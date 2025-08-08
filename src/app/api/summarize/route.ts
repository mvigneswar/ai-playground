import { NextResponse } from "next/server";
import { OpenAI } from "openai";

export const runtime = "nodejs";

async function extractFromPdf(file: File) {
  const pdfParse = (await import("pdf-parse")).default;
  const ab = await file.arrayBuffer();
  const buffer = Buffer.from(ab);
  const data = await pdfParse(buffer);
  return data.text ?? "";
}

async function extractFromDoc(file: File) {
  const mammoth = (await import("mammoth")).default;
  const ab = await file.arrayBuffer();
  const buffer = Buffer.from(ab);
  const result = await mammoth.extractRawText({ buffer });
  return result.value ?? "";
}

async function extractFromUrl(url: string) {
  const [{ JSDOM }, { Readability }] = await Promise.all([
    import("jsdom"),
    import("@mozilla/readability")
  ]);
  const res = await fetch(url);
  const html = await res.text();
  const dom = new JSDOM(html as any, { url });
  const reader = new (Readability as any)(dom.window.document);
  const article = reader.parse();
  return article?.textContent ?? article?.content ?? html;
}

async function summarize(text: string) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY environment variable is not set");
  }
  
  const client = new OpenAI({ apiKey });
  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "Summarize the content concisely as bullet points, then a 3-line abstract." },
      { role: "user", content: text.slice(0, 16000) }
    ],
    temperature: 0.3
  });
  return completion.choices[0]?.message?.content ?? "";
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file");
    const url = String(form.get("url") ?? "");
    
    if (!(file instanceof File) && !url) {
      return new NextResponse("Provide a file or a URL", { status: 400 });
    }

    let text = "";
    if (file instanceof File) {
      if (file.name.endsWith(".pdf")) {
        text = await extractFromPdf(file);
      } else {
        text = await extractFromDoc(file);
      }
    } else if (url) {
      text = await extractFromUrl(url);
    }
    
    if (!text.trim()) {
      return new NextResponse("No textual content extracted", { status: 400 });
    }
    
    const summary = await summarize(text);
    return NextResponse.json({ summary });
  } catch (error) {
    console.error("Summarize API error:", error);
    return new NextResponse(
      `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}`, 
      { status: 500 }
    );
  }
}

