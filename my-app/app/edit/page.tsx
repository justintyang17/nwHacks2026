"use client";

import {
  Button,
  CircularProgress,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { getSelectedVideoFile } from "../components/videoStore";

import { useEditedVideoContext } from "../context/EditedVideoContext";

type SubtitleSegment = {
  text: string;
  start: number;
  end: number;
};

export default function EditPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [subtitleLang, setSubtitleLang] = useState<string>("en");
  const [isBlurring, setIsBlurring] = useState(false);
  const [isGeneratingSubs, setIsGeneratingSubs] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [blurredUrl, setBlurredUrl] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);

  const [transcript, setTranscript] = useState<string | null>(null);
  const [subtitleSegments, setSubtitleSegments] = useState<SubtitleSegment[]>([]);
  const [subtitleSourceVideoUrl, setSubtitleSourceVideoUrl] =
    useState<string | null>(null);
  const [generatedSubtitleLang, setGeneratedSubtitleLang] =
    useState<string | null>(null);
  const [subtitleVttUrl, setSubtitleVttUrl] = useState<string | null>(null);

  const { addEditedVideo } = useEditedVideoContext();

  // Assume the video was chosen on the landing page and its URL
  // (or some identifier) was stored in sessionStorage.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = sessionStorage.getItem("videoToEditUrl");
    setPreviewUrl(stored);
    setVideoFile(getSelectedVideoFile());
  }, []);

  useEffect(() => {
    return () => {
      if (subtitleVttUrl && typeof window !== "undefined") {
        URL.revokeObjectURL(subtitleVttUrl);
      }
    };
  }, [subtitleVttUrl]);

  const handleApplyBlur = async () => {
    // Avoid re-blurring the same video multiple times.
    if (blurredUrl) {
      return;
    }
    if (!videoFile) {
      setError("No video file available to send to backend.");
      return;
    }
    setError(null);
    setIsBlurring(true);

    try {
      const formData = new FormData();
      formData.append("video", videoFile);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        setError("Face blurring failed. Please try again.");
        return;
      }

      const data = (await res.json()) as {
        success?: boolean;
        blurredVideoUrl?: string;
        error?: string;
      };

      if (!data.success || !data.blurredVideoUrl) {
        setError(data.error || "Face blurring failed. Please try again.");
        return;
      }

      setBlurredUrl(data.blurredVideoUrl);
    } catch (e) {
      setError("Unexpected error while blurring faces.");
    } finally {
      setIsBlurring(false);
    }
  };

  const handleGenerateSubtitles = async () => {
    // If we already have subtitles for this language, don't regenerate.
    if (subtitleSegments.length > 0 && generatedSubtitleLang === subtitleLang) {
      return;
    }
    if (!videoFile) {
      setError("No video file available to generate subtitles.");
      return;
    }
    setError(null);
    setIsGeneratingSubs(true);

    try {
      const formData = new FormData();
      formData.append("video", videoFile);
      formData.append("lang", subtitleLang);

      const res = await fetch("/api/subtitles", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        setError("Subtitle generation failed. Please try again.");
        return;
      }

      const data = (await res.json()) as {
        success?: boolean;
        segments?: SubtitleSegment[];
        error?: string;
        sourceVideoUrl?: string;
      };

      if (!data.success || !data.segments || !data.segments.length) {
        setError(data.error || "Subtitle generation failed. Please try again.");
        return;
      }

      setTranscript(
        data.segments.map((seg) => seg.text).join(" ").trim() || null
      );
      setSubtitleSegments(data.segments);
      setGeneratedSubtitleLang(subtitleLang);
      if (data.sourceVideoUrl) {
        setSubtitleSourceVideoUrl(data.sourceVideoUrl);
      }

      // Build a WebVTT file for the <track> element so subtitles also show
      // when the user puts the video into fullscreen.
      if (typeof window !== "undefined") {
        if (subtitleVttUrl) {
          URL.revokeObjectURL(subtitleVttUrl);
        }

        const toVttTime = (seconds: number) => {
          const totalMs = Math.round(seconds * 1000);
          const ms = totalMs % 1000;
          const totalSeconds = Math.floor(totalMs / 1000);
          const s = totalSeconds % 60;
          const m = Math.floor(totalSeconds / 60) % 60;
          const h = Math.floor(totalSeconds / 3600);

          const pad = (n: number, size: number = 2) =>
            n.toString().padStart(size, "0");
          return `${pad(h)}:${pad(m)}:${pad(s)}.${pad(ms, 3)}`;
        };

        let vtt = "WEBVTT\n\n";
        data.segments.forEach((seg, idx) => {
          const text = (seg.text || "").trim();
          if (!text) return;
          const start = toVttTime(seg.start);
          const end = toVttTime(seg.end);
          vtt += `${idx + 1}\n${start} --> ${end}\n${text}\n\n`;
        });

        const blob = new Blob([vtt], { type: "text/vtt" });
        const url = URL.createObjectURL(blob);
        setSubtitleVttUrl(url);
      }
    } catch {
      setError("Subtitle generation failed. Please try again.");
    } finally {
      setIsGeneratingSubs(false);
    }
  };

  const handleLoadedMetadata = () => {
    // No-op for now; we rely directly on backend segment timings.
  };

  const saveVideo = async () => {
    if (isSaving) return;
    setError(null);

    const basePreviewUrl = blurredUrl ?? previewUrl;
    if (!basePreviewUrl) {
      setError("No edited video to save.");
      return;
    }

    try {
      setIsSaving(true);
      let finalUrl = basePreviewUrl;

      // If we have subtitles, burn them into the actual video file on the server
      // so downloads/shares include the text.
      const alreadySubbed =
        typeof finalUrl === "string" && finalUrl.includes("/uploads/subbed-");

      if (subtitleSegments.length > 0 && !alreadySubbed) {
        const videoUrlForBurn = blurredUrl ?? subtitleSourceVideoUrl;

        if (!videoUrlForBurn) {
          setError(
            "Unable to export subtitles: missing server video file. Try generating subtitles again."
          );
        } else {
          const res = await fetch("/api/burn-subtitles", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              videoUrl: videoUrlForBurn,
              segments: subtitleSegments,
            }),
          });

          if (!res.ok) {
            setError("Failed to bake subtitles into the video.");
          } else {
            const data = (await res.json()) as {
              success?: boolean;
              videoUrl?: string;
              error?: string;
            };
            if (!data.success || !data.videoUrl) {
              setError(
                data.error || "Failed to bake subtitles into the video."
              );
            } else {
              finalUrl = data.videoUrl;
            }
          }
        }
      }

      addEditedVideo({
        url: finalUrl,
        // Keep subtitle metadata so we can still show transcript text in-app
        // if desired, even though the subtitles are baked into the video file.
        subtitles: subtitleSegments.length ? subtitleSegments : undefined,
        transcript: transcript ?? undefined,
        language: subtitleLang,
      });

      // Persist the final URL so if the user comes back to this page later,
      // the baked version is what they see.
      if (typeof window !== "undefined") {
        sessionStorage.setItem("videoToEditUrl", finalUrl);
      }

      router.push("/clips");
    } catch {
      setError("Failed to save edited video.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "32px 24px",
        backgroundColor: "#000000",
        color: "#f9fafb",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 24,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 960,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h5" component="h1">
          Edit Video
        </Typography>
        <Button
          variant="outlined"
          color="inherit"
          onClick={() => router.push("/")}
        >
          Back to upload
        </Button>
      </div>

      <div
        style={{
          width: "100%",
          maxWidth: 960,
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.7fr) minmax(0, 1.3fr)",
          columnGap: 24,
          rowGap: 24,
          alignItems: "flex-start",
        }}
      >
        {/* Left: video preview */}
        <div
          className="glass-card"
          style={{
            padding: 20,
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          <Typography variant="subtitle1">Video preview</Typography>

          <div
            style={{
              width: "100%",
              aspectRatio: "16 / 9",
              backgroundColor: "rgba(15,23,42,0.85)",
              borderRadius: 16,
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
            }}
          >
            {isBlurring ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 12,
                }}
              >
                <CircularProgress size={32} />
                <Typography variant="body2" color="gray">
                  Processing video...
                </Typography>
              </div>
            ) : blurredUrl || previewUrl ? (
              <video
                ref={videoRef}
                src={blurredUrl ?? previewUrl ?? undefined}
                controls
                onLoadedMetadata={handleLoadedMetadata}
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
              >
                {subtitleVttUrl && (
                  <track
                    kind="subtitles"
                    src={subtitleVttUrl}
                    srcLang={subtitleLang}
                    label="Subtitles"
                    default
                  />
                )}
              </video>
            ) : (
              <Typography variant="body2" color="gray">
                No video selected. Choose a video to edit.
              </Typography>
            )}

            {/* No extra CSS overlay; subtitles are provided via <track> so they
                work consistently in fullscreen and normal modes. */}
          </div>

          {error && (
            <Typography
              variant="body2"
              color="error"
              style={{ marginTop: 12 }}
            >
              {error}
            </Typography>
          )}

          {!previewUrl && (
            <Typography variant="body2" color="gray" style={{ marginTop: 12 }}>
              This page expects a video to be selected on the landing page
              first. Once your friend wires the navigation, the chosen video
              will appear here automatically.
            </Typography>
          )}
        </div>

        {/* Right: edit options */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          {/* Blur faces card */}
          <div className="glass-card-soft" style={{ padding: 16 }}>
            <Typography variant="subtitle1" gutterBottom>
              Face blurring
            </Typography>
            <Typography
              variant="body2"
              color="gray"
              style={{ marginBottom: 12 }}
            >
              Blur all detected faces in the video to protect identities.
            </Typography>
            <Button
              variant="outlined"
              color="inherit"
              className="glass-btn glass-btn-primary"
              disabled={!previewUrl}
              onClick={handleApplyBlur}
            >
              Apply face blur
            </Button>
          </div>

          {/* Subtitles card */}
          <div className="glass-card-soft" style={{ padding: 16 }}>
            <Typography variant="subtitle1" gutterBottom>
              Subtitles
            </Typography>
            <Typography
              variant="body2"
              color="gray"
              style={{ marginBottom: 12 }}
            >
              Select the language you want subtitles in. Subtitles are
              generated using AI with accurate timing.
            </Typography>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 12,
              }}
            >
              <Typography variant="body2">Language:</Typography>
              <Select
                size="small"
                value={subtitleLang}
                onChange={(e) =>
                  setSubtitleLang(e.target.value as string)
                }
                style={{ minWidth: 160 }}
              >
                <MenuItem value="en">English</MenuItem>
                <MenuItem value="es">Spanish</MenuItem>
                <MenuItem value="fr">French</MenuItem>
                <MenuItem value="de">German</MenuItem>
                <MenuItem value="zh">Chinese</MenuItem>
              </Select>
            </div>
            <Button
              variant="outlined"
              className="glass-btn glass-btn-secondary"
              disabled={!previewUrl || isGeneratingSubs}
              onClick={handleGenerateSubtitles}
              startIcon={
                isGeneratingSubs ? <CircularProgress size={16} /> : undefined
              }
            >
              {isGeneratingSubs ? "Generating..." : "Generate subtitles"}
            </Button>

            {transcript && (
              <div
                style={{
                  marginTop: 12,
                  maxHeight: 220,
                  overflowY: "auto",
                  padding: 8,
                  borderRadius: 12,
                  backgroundColor: "rgba(15,23,42,0.85)",
                  border: "1px solid rgba(148,163,184,0.35)",
                }}
              >
                <Typography
                  variant="body2"
                  style={{
                    whiteSpace: "pre-wrap",
                    fontFamily:
                      "'Noto Sans', 'Noto Sans SC', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                  }}
                >
                  {transcript}
                </Typography>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom actions */}
      <div
        style={{
          width: "100%",
          maxWidth: 960,
          display: "flex",
          justifyContent: "space-between",
          marginTop: 8,
        }}
      >
        <Button
          variant="outlined"
          color="inherit"
          className="glass-btn glass-btn-neutral"
          onClick={() => router.push("/clips")}
        >
          Go to clips
        </Button>
        <Button
          variant="outlined"
          color="inherit"
          className="glass-btn glass-btn-primary"
          onClick={saveVideo}
          disabled={!previewUrl || isSaving}
        >
          {isSaving ? <CircularProgress size={18} /> : "Finish"}
        </Button>
      </div>
    </main>
  );
}

