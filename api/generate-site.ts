import { NextResponse } from "next/server";

export const runtime = "edge"; // Sneller en goedkoper op Vercel

export async function POST(req: Request) {
  try {
    // 1. Ontvang prompt uit Base44
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "No prompt provided" },
        { status: 400 }
      );
    }

    // 2. Roep OpenAI API aan
    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    const data = await openaiResponse.json();

    if (!data.choices || !data.choices[0]) {
      return NextResponse.json(
        { error: "Invalid OpenAI response", details: data },
        { status: 500 }
      );
    }

    return NextResponse.json({
      result: data.choices[0].message?.content || "",
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        error: "Server error",
        details: err?.message || err.toString(),
      },
      { status: 500 }
    );
  }
}