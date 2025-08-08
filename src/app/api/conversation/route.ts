import { NextResponse } from "next/server";
import { OpenAI } from "openai";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

export const runtime = "nodejs";

async function saveTempFile(file: File) {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const tmp = path.join(os.tmpdir(), `${Date.now()}-${file.name}`);
  await fs.promises.writeFile(tmp, buffer);
  return tmp;
}

async function transcribe(filePath: string) {
  const fileStream = fs.createReadStream(filePath);
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const response = await client.audio.transcriptions.create({
    file: fileStream as any,
    model: "gpt-4o-mini-transcribe"
  });
  // @ts-expect-error SDK type mismatch for legacy endpoint
  const text: string = response.text ?? response?.results?.[0]?.alternatives?.[0]?.transcript ?? "";
  return text.trim();
}

// Simple diarization: we do NOT use vendor diarization. We call an LLM to segment into up to 2 speakers.
async function diarizeWithLLM(transcript: string) {
  const prompt = `You are a diarization assistant. Given a transcript with no speaker labels, segment it into up to 2 speakers.
Return a JSON array of objects with keys: speaker (1 or 2) and text (concise contiguous utterances). Keep order. Merge short interjections.
Transcript:\n${transcript}`;

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "Return only valid JSON." },
      { role: "user", content: prompt }
    ],
    temperature: 0.2
  });
  const content = completion.choices[0]?.message?.content ?? "[]";
  try {
    const parsed = JSON.parse(content);
    const normalized = Array.isArray(parsed)
      ? parsed.map((x) => ({ speaker: Number(x.speaker) === 2 ? 2 : 1, text: String(x.text ?? "").trim() }))
      : [];
    return normalized.filter((x) => x.text.length > 0);
  } catch {
    return [];
  }
}

async function summarize(text: string) {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "Summarize concisely in 5-7 bullet points." },
      { role: "user", content: text }
    ],
    temperature: 0.3
  });
  return completion.choices[0]?.message?.content ?? "";
}

export async function POST(req: Request) {
  const form = await req.formData();
  const audio = form.get("audio");
  if (!(audio instanceof File)) {
    return new NextResponse("No audio provided", { status: 400 });
  }
  const tmp = await saveTempFile(audio);
  try {
    const text = await transcribe(tmp);
    const diarization = await diarizeWithLLM(text);
    const summaryText = await summarize(text);
    return NextResponse.json({ transcript: text, diarization, summary: summaryText });
  } finally {
    fs.promises.unlink(tmp).catch(() => {});
  }
}

