import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
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

function secondsToSrtTime(seconds: number): string {
  const totalMs = Math.round(seconds * 1000);
  const ms = totalMs % 1000;
  const totalSeconds = Math.floor(totalMs / 1000);
  const s = totalSeconds % 60;
  const m = Math.floor(totalSeconds / 60) % 60;
  const h = Math.floor(totalSeconds / 3600);

  const pad = (n: number, size: number = 2) => n.toString().padStart(size, "0");
  return `${pad(h)}:${pad(m)}:${pad(s)},${pad(ms, 3)}`;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      videoUrl?: string;
      segments?: SubtitleSegment[];
    };

    const { videoUrl, segments } = body;

    if (!videoUrl || !segments || !segments.length) {
      return NextResponse.json(
        { success: false, error: "videoUrl and segments are required" },
        { status: 400 }
      );
    }

    // The video URL should be something like `/uploads/filename.mp4`.
    // Convert it into an absolute path under `public/`.
    const relativeVideoPath = videoUrl.replace(/^\/+/, "");
    const inputPath = path.join(process.cwd(), "public", relativeVideoPath);

    const id = randomUUID();
    const uploadDir = path.dirname(inputPath);
    const srtPath = path.join(uploadDir, `subs-${id}.srt`);
    const outputPath = path.join(uploadDir, `subbed-${id}.mp4`);

    // Build SRT file content from segments.
    let srtContent = "";
    let counter = 1;
    for (const seg of segments) {
      const text = (seg.text || "").replace(/\r/g, "").trim();
      if (!text) continue;

      const start = secondsToSrtTime(seg.start);
      const end = secondsToSrtTime(seg.end);

      srtContent += `${counter}\n${start} --> ${end}\n${text}\n\n`;
      counter += 1;
    }

    if (!srtContent) {
      return NextResponse.json(
        { success: false, error: "No non-empty subtitle lines to burn" },
        { status: 400 }
      );
    }

    await writeFile(srtPath, srtContent, { encoding: "utf8" });

    // For Windows paths, using an absolute path like "C:/.../subs.srt" with the
    // subtitles filter can confuse ffmpeg because ':' is used as an option
    // separator (it can be misread as "original_size=..."). To avoid that,
    // run ffmpeg with cwd=uploadDir and reference the SRT file by its
    // filename only (no drive letter, no colon).
    const srtFileName = path.basename(srtPath);

    // Call ffmpeg to burn the SRT subtitles into the video.
    // Requires ffmpeg to be installed and available on PATH.
    const vfArg = `subtitles=${srtFileName}`;

    const { stdout, stderr } = await execFileAsync(
      "ffmpeg",
      [
        "-y",
        "-i",
        inputPath,
        "-vf",
        vfArg,
        "-c:a",
        "copy",
        outputPath,
      ],
      {
        cwd: uploadDir,
      }
    );

    if (stdout) {
      console.log("[ffmpeg subtitles stdout]", stdout.toString());
    }
    if (stderr) {
      console.log("[ffmpeg subtitles stderr]", stderr.toString());
    }

    const outputFileName = path.basename(outputPath);
    const outputVideoUrl = `/uploads/${outputFileName}`;

    return NextResponse.json({ success: true, videoUrl: outputVideoUrl });
  } catch (err) {
    console.error("[/api/burn-subtitles] error", err);
    return NextResponse.json(
      { success: false, error: "Failed to burn subtitles into video" },
      { status: 500 }
    );
  }
}

