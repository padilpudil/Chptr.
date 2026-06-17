import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { text, target } = await req.json();

    if (!text || !target) {
      return NextResponse.json({ error: "Missing text or target language" }, { status: 400 });
    }

    const trimmedText = text.trim();
    if (!trimmedText) {
      return NextResponse.json({ translation: "", definitions: [] });
    }

    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${target}&dt=t&dt=md&q=${encodeURIComponent(trimmedText)}`;

    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    if (!res.ok) {
      throw new Error(`Google Translate responded with status ${res.status}`);
    }

    const data = await res.json();
    if (!data) {
      throw new Error("Invalid response from Google Translate");
    }

    // Extract primary translation
    const translation = data[0] ? data[0].map((x: any) => x[0] || "").join("") : "";

    // Extract dictionary definitions if present (typically data[12])
    const definitions: { partOfSpeech: string; definitions: string[] }[] = [];
    if (data[12] && Array.isArray(data[12])) {
      for (const entry of data[12]) {
        const partOfSpeech = entry[0] || "";
        const defs = entry[1] ? entry[1].map((x: any) => x[0] || "") : [];
        if (defs.length > 0) {
          definitions.push({ partOfSpeech, definitions: defs });
        }
      }
    }

    return NextResponse.json({
      translation,
      definitions,
      detectedSource: data[2] || "auto",
    });
  } catch (error: any) {
    console.error("Define API Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
