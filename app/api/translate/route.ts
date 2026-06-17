import { NextResponse } from "next/server";

const MAX_CHARS = 3000;

async function translateBatch(batch: string[], targetLang: string): Promise<string[]> {
  const joined = batch.join("\n|||\n");
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(joined)}`;

  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
  });

  if (!res.ok) {
    throw new Error(`Google Translate responded with status ${res.status}`);
  }

  const data = await res.json();
  if (!data || !data[0]) {
    throw new Error("Invalid response structure from Google Translate");
  }

  const translatedText = data[0].map((x: any) => x[0] || "").join("");
  const parts = translatedText.split(/\|\|\|/).map((s: string) => s.trim());

  if (parts.length === batch.length) {
    return parts;
  } else {
    // If the part counts don't align, fall back to translating individually for this batch
    console.warn(`Translation alignment mismatch: expected ${batch.length} items, received ${parts.length}. Resolving individually.`);
    const fallbackResults: string[] = [];
    for (const item of batch) {
      if (!item.trim()) {
        fallbackResults.push("");
        continue;
      }
      try {
        const itemUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(item)}`;
        const itemRes = await fetch(itemUrl, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          },
        });
        if (itemRes.ok) {
          const itemData = await itemRes.json();
          const itemTrans = itemData[0].map((x: any) => x[0] || "").join("").trim();
          fallbackResults.push(itemTrans);
        } else {
          fallbackResults.push(item);
        }
      } catch (err) {
        console.error("Individual fallback translation failed for item", item, err);
        fallbackResults.push(item);
      }
    }
    return fallbackResults;
  }
}

export async function POST(req: Request) {
  try {
    const { texts, target } = await req.json();

    if (!target) {
      return NextResponse.json({ error: "Missing target language" }, { status: 400 });
    }

    if (!texts || !Array.isArray(texts) || texts.length === 0) {
      return NextResponse.json({ translated: [] });
    }

    // Partition texts into batches based on character limits to stay within Google Translate's limit
    const batches: string[][] = [];
    let currentBatch: string[] = [];
    let currentLength = 0;

    for (const text of texts) {
      // Escape target split characters in the original text to prevent alignment bugs
      const cleanText = text.replace(/\|\|\|/g, "||");
      
      if (currentLength + cleanText.length + 5 > MAX_CHARS && currentBatch.length > 0) {
        batches.push(currentBatch);
        currentBatch = [];
        currentLength = 0;
      }

      currentBatch.push(cleanText);
      currentLength += cleanText.length + 5; // length of string + delimiter length
    }
    if (currentBatch.length > 0) {
      batches.push(currentBatch);
    }

    const translatedResults: string[] = [];

    for (const batch of batches) {
      try {
        const batchTranslations = await translateBatch(batch, target);
        translatedResults.push(...batchTranslations);
      } catch (error) {
        console.error("Batch translation error, returning original text for batch", error);
        translatedResults.push(...batch);
      }
    }

    return NextResponse.json({ translated: translatedResults });
  } catch (err: any) {
    console.error("API Translate error:", err);
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}
