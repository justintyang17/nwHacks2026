import { videoTranscription } from "@/backend/util/auto-translation/videoTranslation";
import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { randomUUID } from "crypto";
import path from "path";
import { execFile, exec, execSync } from "child_process";
import { promisify } from "util";
import { write } from "fs";
import { DubbingTranscriptResponseModel } from "@elevenlabs/elevenlabs-js/api";

import { unlink } from "fs/promises";



// import  ffmpeg from 'fluent-ffmpeg';
// import ffmpegPath from 'ffmpeg-static';


interface transcriptType {
    transcriptFormat: "srt",
    srt: "string"
}


// Ensure we use the Node.js runtime so we can access the filesystem
export const runtime = "nodejs";

const execFileAsync = promisify(execFile);

export async function POST(req: Request) {
  console.log("[/api/upload] Request received");
  const formData = await req.formData();
  const file = formData.get("video") as File | null;

  if (!file) {
    return NextResponse.json(
      { error: "No videos uploaded" },
      { status: 400 }
    );
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });

  // 0. Get transcription of uploaded video
  console.log("[/api/upload] Getting Trantion");
  //const vt = new videoTranscription();
  //const transcription = await vt.transcribe(file);
  //console.log(execSync(`${ffmpegPath} -version`).toString());

  //console.log(transcription);

  //const tempSrt = path.join(uploadDir, "temp.srt")
  //const srtFile = await writeFile(tempSrt, transcription.srt, "utf-8");
  
  // 1. Save original uploaded video to disk (e.g. public/uploads)


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

  // 2. Run AI face detection + blurring.
  //    We first write a blurred video (video-only) via Python, then remux
  //    the original audio back in using ffmpeg so we don't lose sound.
  const blurredFileName = `blurred-${id}.${extension}`;
  const blurredFilePath = path.join(uploadDir, blurredFileName);
  const blurredVideoOnlyPath = path.join(
    uploadDir,
    `blurred-videoonly-${id}.${extension}`
  );

  console.log("[/api/upload] Starting blurFacesInVideo", {
    inputPath: originalFilePath,
    outputPath: blurredVideoOnlyPath,
  });

  // 2a. Blur faces into a temporary video-only file.
  await blurFacesInVideo(originalFilePath, blurredVideoOnlyPath);
  console.log("[/api/upload] Finished blurFacesInVideo, restoring audio track");

  // 2b. Use ffmpeg to copy the blurred video stream and the original audio
  //     into the final blurredFilePath, so audio is preserved.
  try {
    const { stdout, stderr } = await execFileAsync("ffmpeg", [
      "-y",
      "-i",
      blurredVideoOnlyPath,
      "-i",
      originalFilePath,
      "-map",
      "0:v:0",
      "-map",
      "1:a:0",
      "-c:v",
      "copy",
      "-c:a",
      "aac",
      blurredFilePath,
    ]);

    if (stdout) {
      console.log("[/api/upload ffmpeg stdout]", stdout.toString());
    }
    if (stderr) {
      console.log("[/api/upload ffmpeg stderr]", stderr.toString());
    }
  } catch (err) {
    console.error(
      "[/api/upload] ffmpeg remux (restore audio) failed, falling back to video-only blurred clip",
      err
    );
  }



  // 3. Return URL of blurred video so the frontend can show/download it
  const blurredVideoUrl = `/uploads/${blurredFileName}`;
  const subVideoPath = path.join(uploadDir,"test.mp4");
  const srtPath = path.join(uploadDir,"temp.srt");
  
  import("fs/promises").then(fs => fs.unlink(subVideoPath).catch(() => {}));
  await unlink(subVideoPath).catch(() => {});

//   addHardcodedSubtitles(blurredFilePath,srtPath,subVideoPath);
  /*const blurredSubVideoUrl = 

   await new Promise<void>((resolve, reject) => {
    const cmd =
  `ffmpeg -i ${blurredFilePath} ` +
  `-vf subtitles=${srtPath} ` +   // ← space here matters
  `${subVideoPath}`;


    exec(cmd, (err) => (err ? reject(err) : resolve()));
  }); */

  return NextResponse.json({
    success: true,
    blurredVideoUrl,

  });
}



// Tell fluent-ffmpeg where the ffmpeg executable is
// console.log(ffmpegPath)
// ffmpeg.setFfmpegPath("/opt/homebrew/bin/ffmpeg");





// function addHardcodedSubtitles(input : string, srt : string, output : string) {
//     ffmpeg(input)
//         .outputOptions([
//             // Use the 'subtitles' video filter to burn the subtitles in
//             `-vf subtitles=${srt}`
//         ])
//         .on('error', function(err) {
//             console.error('An error occurred: ' + err.message);
//         })
//         .on('end', function() {
//             console.log('Hardcoded subtitles added successfully!');
//         })
//         .save(output);
// }




/*
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

  // Cross-platform virtualenv python path
  const pythonPath =
    process.platform === "win32"
      ? path.join(process.cwd(), ".venv", "Scripts", "python.exe")
      : path.join(process.cwd(), ".venv", "bin", "python3");

  // Call the Python script in the project virtual environment to blur faces
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