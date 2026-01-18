import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { randomUUID } from "crypto";
import path from "path";
import { execFile } from "child_process";
import { promisify } from "util";

// Ensure we use the Node.js runtime so we can access the filesystem
export const runtime = "nodejs";

const execFileAsync = promisify(execFile);

export async function POST(req: Request) {
  console.log("[/api/upload] Request received");
  const formData = await req.formData();
  const file = formData.get("video") as File | null;

  if (!file) {
    return NextResponse.json(
      { error: "No video uploaded" },
      { status: 400 }
    );
  }

  // 1. Save original uploaded video to disk (e.g. public/uploads)
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });

  const extension = file.name.split(".").pop() || "mp4";
  const id = randomUUID();
  const originalFileName = `original-${id}.${extension}`;
  const originalFilePath = path.join(uploadDir, originalFileName);

  console.log("[/api/upload] Saving original video", {
    name: file.name,
    type: file.type,
    size: file.size,
    originalFilePath,
  });

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  await writeFile(originalFilePath, buffer);

  // 2. Run AI face detection + blurring (to be implemented)
  //    Here you would call your AI/ML pipeline (Python script, external API, etc.)
  //    that takes `originalFilePath` as input and writes a blurred version,
  //    then returns the path to that processed file.
  const blurredFileName = `blurred-${id}.${extension}`;
  const blurredFilePath = path.join(uploadDir, blurredFileName);

  console.log("[/api/upload] Starting blurFacesInVideo", {
    inputPath: originalFilePath,
    outputPath: blurredFilePath,
  });

  await blurFacesInVideo(originalFilePath, blurredFilePath);

  console.log("[/api/upload] Finished blurFacesInVideo");

  // 3. Return URL of blurred video so the frontend can show/download it
  const blurredVideoUrl = `/uploads/${blurredFileName}`;

  return NextResponse.json({
    success: true,
    blurredVideoUrl,
  });
}

/**
 * Placeholder for AI-based face detection and blurring.
 *
 * Implement this using:
 * - A Python script with OpenCV / deep learning models, or
 * - A cloud AI service (e.g. Rekognition, Video Intelligence, etc.)
 *
 * For now this just copies the original video to the blurred path.
 */
async function blurFacesInVideo(
  inputPath: string,
  outputPath: string
): Promise<void> {
  const scriptPath = path.join(process.cwd(), "scripts", "blur_faces.py");
  const pythonPath = path.join(
    process.cwd(),
    ".venv",
    "Scripts",
    "python.exe"
  );

  

  // Call the Python script in the project virtual environment that uses MediaPipe
  // to blur faces in the video.
  const { stdout, stderr } = await execFileAsync(pythonPath, [
    scriptPath,
    inputPath,
    outputPath,
  ]);

  if (stdout) {
    console.log("[blur_faces.py stdout]", stdout.toString());
  }
  if (stderr) {
    console.error("[blur_faces.py stderr]", stderr.toString());
  }
}