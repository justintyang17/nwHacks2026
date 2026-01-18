import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { randomUUID } from "crypto";
import path from "path";
import { execFile } from "child_process";
import { promisify } from "util";

export const runtime = "nodejs";

const execFileAsync = promisify(execFile);

type SubtitleSegment = {
  start: number;
  end: number;
  text: string;
};

async function translateSegmentsWithOpenAI(
  segments: SubtitleSegment[],
  targetLang: string
): Promise<SubtitleSegment[]> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.warn(
      "[/api/subtitles] OPENAI_API_KEY not set; returning original-language subtitles"
    );
    return segments;
  }

  // More robust but slightly slower: translate each segment text individually.
  const translated: SubtitleSegment[] = [];
  for (const seg of segments) {
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: `Translate the user's subtitle text into language code "${targetLang}". Return ONLY the translated text, with no quotes, metadata, or explanation.`,
            },
            {
              role: "user",
              content: seg.text,
            },
          ],
          temperature: 0,
        }),
      });

      if (!response.ok) {
        console.error(
          "[/api/subtitles] OpenAI translation request failed for segment",
          await response.text()
        );
        translated.push(seg);
        continue;
      }

      const data = (await response.json()) as any;
      const translatedText: string =
        data.choices?.[0]?.message?.content?.trim() ?? seg.text;

      translated.push({
        ...seg,
        text: translatedText,
      });
    } catch (err) {
      console.error("[/api/subtitles] error during translation for segment", err);
      translated.push(seg);
    }
  }

  return translated;
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("video") as File | null;
    const lang = (formData.get("lang") as string | null) || "auto";

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No video uploaded" },
        { status: 400 }
      );
    }

    // Save the uploaded video so the Python Whisper script can read it.
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    const extension = file.name.split(".").pop() || "mp4";
    const id = randomUUID();
    const inputFileName = `subs-${id}.${extension}`;
    const inputFilePath = path.join(uploadDir, inputFileName);

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await writeFile(inputFilePath, buffer);

    const scriptPath = path.join(
      process.cwd(),
      "scripts",
      "transcribe_whisper.py"
    );

    const pythonPath =
      process.platform === "win32"
        ? path.join(process.cwd(), ".venv", "Scripts", "python.exe")
        : path.join(process.cwd(), ".venv", "bin", "python3");

    const args = [scriptPath, inputFilePath];
    // Pass requested language to Whisper script (used for English translation).
    if (lang && lang !== "auto") {
      args.push(lang);
    }

    // Force Python to emit UTF-8 on stdout so non-ASCII characters
    // (e.g. German, French, etc.) are not mangled when Node reads them.
    const { stdout, stderr } = await execFileAsync(pythonPath, args, {
      env: {
        ...process.env,
        PYTHONIOENCODING: "utf-8",
      },
    });

    if (stderr) {
      console.error("[transcribe_whisper stderr]", stderr.toString());
    }

    let segments: SubtitleSegment[] = [];
    try {
      const parsed = JSON.parse(stdout.toString()) as {
        segments?: SubtitleSegment[];
      };
      if (parsed.segments && Array.isArray(parsed.segments)) {
        segments = parsed.segments;
      }
    } catch (e) {
      console.error("[/api/subtitles] Failed to parse Whisper output", e);
      return NextResponse.json(
        { success: false, error: "Failed to parse subtitles" },
        { status: 500 }
      );
    }

    if (!segments.length) {
      return NextResponse.json(
        { success: false, error: "No subtitle segments produced" },
        { status: 500 }
      );
    }

    // If the user selected a specific language that is not English,
    // translate the text of each segment while preserving timings.
    if (lang && lang !== "auto" && lang !== "en") {
      segments = await translateSegmentsWithOpenAI(segments, lang);
    }

    return NextResponse.json({ success: true, segments });
  } catch (err) {
    console.error("[/api/subtitles] error", err);
    return NextResponse.json(
      { success: false, error: "Internal error generating subtitles" },
      { status: 500 }
    );
  }
}

