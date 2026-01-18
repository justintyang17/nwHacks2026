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
  const [error, setError] = useState<string | null>(null);
  const [blurredUrl, setBlurredUrl] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);

  const [transcript, setTranscript] = useState<string | null>(null);
  const [subtitleSegments, setSubtitleSegments] = useState<SubtitleSegment[]>(
    []
  );
  const [currentSubtitleIndex, setCurrentSubtitleIndex] = useState(0);

  const { addEditedVideo } = useEditedVideoContext();

  // Assume the video was chosen on the landing page and its URL
  // (or some identifier) was stored in sessionStorage.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = sessionStorage.getItem("videoToEditUrl");
    setPreviewUrl(stored);
    setVideoFile(getSelectedVideoFile());
  }, []);

  const handleApplyBlur = async () => {
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
      };

      if (!data.success || !data.segments || !data.segments.length) {
        setError(data.error || "Subtitle generation failed. Please try again.");
        return;
      }

      setTranscript(
        data.segments.map((seg) => seg.text).join(" ").trim() || null
      );
      setSubtitleSegments(data.segments);
      setCurrentSubtitleIndex(0);
    } catch {
      setError("Subtitle generation failed. Please try again.");
    } finally {
      setIsGeneratingSubs(false);
    }
  };

  const handleLoadedMetadata = () => {
    // No-op for now; we rely directly on backend segment timings.
  };

  const handleTimeUpdate = (event: React.SyntheticEvent<HTMLVideoElement>) => {
    if (subtitleSegments.length === 0) return;
    const t = event.currentTarget.currentTime;

    let idx = subtitleSegments.findIndex(
      (seg) => t >= seg.start && t < seg.end
    );
    if (idx === -1 && t >= subtitleSegments[subtitleSegments.length - 1].end) {
      idx = subtitleSegments.length - 1;
    }

    if (idx !== currentSubtitleIndex) {
      setCurrentSubtitleIndex(idx);
    }
  };

  const saveVideo = () => {
    const finalUrl = blurredUrl ?? previewUrl;
    if (!finalUrl) {
      setError("No edited video to save.");
      return;
    }

    addEditedVideo({
      url: finalUrl,
      // Only attach subtitles/transcript if they exist.
      subtitles: subtitleSegments.length ? subtitleSegments : undefined,
      transcript: transcript ?? undefined,
      language: subtitleLang,
    });
    router.push("/clips");
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
          gridTemplateColumns: "minmax(0, 3fr) minmax(0, 2fr)",
          gap: 24,
        }}
      >
        {/* Left: video preview */}
        <div
          style={{
            backgroundColor: "rgba(15,23,42,0.45)",
            borderRadius: 20,
            padding: 20,
            border: "1px solid rgba(148, 163, 184, 0.4)",
            boxShadow: "0 18px 45px rgba(0, 0, 0, 0.65)",
            backdropFilter: "blur(18px)",
            WebkitBackdropFilter: "blur(18px)",
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
                onTimeUpdate={handleTimeUpdate}
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
            ) : (
              <Typography variant="body2" color="gray">
                No video selected. Choose a video to edit.
              </Typography>
            )}

            {subtitleSegments.length > 0 && currentSubtitleIndex >= 0 && (
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  bottom: 12,
                  display: "flex",
                  justifyContent: "center",
                  pointerEvents: "none",
                }}
              >
                <div
                  style={{
                    maxWidth: "90%",
                    padding: "6px 10px",
                    backgroundColor: "rgba(0, 0, 0, 0.7)",
                    borderRadius: 8,
                    color: "#f9fafb",
                    textAlign: "center",
                    fontSize: 14,
                    fontFamily:
                      "'Noto Sans', 'Noto Sans SC', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                  }}
                >
                  {subtitleSegments[currentSubtitleIndex]?.text}
                </div>
              </div>
            )}
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
          <div
            style={{
              backgroundColor: "rgba(15,23,42,0.45)",
              borderRadius: 20,
              padding: 16,
              border: "1px solid rgba(148, 163, 184, 0.35)",
              boxShadow: "0 12px 30px rgba(0, 0, 0, 0.7)",
              backdropFilter: "blur(14px)",
              WebkitBackdropFilter: "blur(14px)",
            }}
          >
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
              variant="contained"
              color="primary"
              disabled={!previewUrl}
              onClick={handleApplyBlur}
            >
              Apply face blur
            </Button>
          </div>

          {/* Subtitles card */}
          <div
            style={{
              backgroundColor: "rgba(15,23,42,0.45)",
              borderRadius: 20,
              padding: 16,
              border: "1px solid rgba(148, 163, 184, 0.35)",
              boxShadow: "0 12px 30px rgba(0, 0, 0, 0.7)",
              backdropFilter: "blur(14px)",
              WebkitBackdropFilter: "blur(14px)",
            }}
          >
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
              disabled={!previewUrl || isGeneratingSubs}
              onClick={handleGenerateSubtitles}
            >
              {isGeneratingSubs ? "Generating..." : "Generate subtitles"}
            </Button>

            {transcript && (
              <Typography
                variant="body2"
                style={{
                  marginTop: 12,
                  whiteSpace: "pre-wrap",
                  fontFamily:
                    "'Noto Sans', 'Noto Sans SC', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                }}
              >
                {transcript}
              </Typography>
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
          justifyContent: "flex-end",
          marginTop: 8,
        }}
      >
        <Button
          variant="outlined"
          color="inherit"
          onClick={saveVideo}
          disabled={!previewUrl}
        >
          Finish
        </Button>
      </div>
    </main>
  );
}

