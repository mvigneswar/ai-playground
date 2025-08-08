import { NextResponse } from "next/server";
import { OpenAI } from "openai";
export const runtime = "nodejs";

export async function POST(req: Request) {
  const form = await req.formData();
  const image = form.get("image");
  if (!(image instanceof File)) {
    return new NextResponse("No image provided", { status: 400 });
  }

  const arrayBuffer = await image.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");
  const dataUrl = `data:${image.type};base64,${base64}`;

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: "Describe this image in detail." } as any,
          { type: "image_url", image_url: { url: dataUrl } } as any
        ]
      } as any
    ],
    temperature: 0.2
  });

  const description = completion.choices[0]?.message?.content ?? "";
  return NextResponse.json({ description });
}

