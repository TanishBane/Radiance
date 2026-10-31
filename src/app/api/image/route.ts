import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const ImageGenSchema = z.object({
  prompt: z.string().min(1).max(1000),
  width: z.number().int().min(256).max(1024).default(768),
  height: z.number().int().min(256).max(1024).default(768),
  seed: z.number().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = ImageGenSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid image prompt payload" }, { status: 400 });
    }

    const { prompt, width, height, seed } = parsed.data;
    const finalSeed = seed ?? Math.floor(Math.random() * 1000000);
    const encoded = encodeURIComponent(prompt);
    const imageUrl = `https://image.pollinations.ai/prompt/${encoded}?model=flux&width=${width}&height=${height}&nologo=true&enhance=true&seed=${finalSeed}`;

    return NextResponse.json({
      imageUrl,
      seed: finalSeed,
      prompt,
    });
  } catch {
    return NextResponse.json({ error: "Failed to generate image" }, { status: 500 });
  }
}
