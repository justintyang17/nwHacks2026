"use client";

import {
  Button,
  CircularProgress,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getSelectedVideoFile } from "../components/videoStore";

export default function EditPage() {
  const router = useRouter();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [subtitleLang, setSubtitleLang] = useState<string>("en");
  const [isBlurring, setIsBlurring] = useState(false);
  const [isGeneratingSubs, setIsGeneratingSubs] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [blurredUrl, setBlurredUrl] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);

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
    if (!previewUrl) {
      setError("No video available to generate subtitles.");
      return;
    }
    setError(null);
    setIsGeneratingSubs(true);

    try {
      // Placeholder: call your subtitles backend when it's ready.
      await new Promise((resolve) => setTimeout(resolve, 1500));
    } catch {
      setError("Subtitle generation failed. Please try again.");
    } finally {
      setIsGeneratingSubs(false);
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
            ) : blurredUrl ? (
              <video
                src={blurredUrl}
                controls
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
            ) : previewUrl ? (
              <video
                src={previewUrl}
                controls
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
            ) : (
              <Typography variant="body2" color="gray">
                No video selected. Choose a video to edit.
              </Typography>
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
              Subtitles (coming soon)
            </Typography>
            <Typography
              variant="body2"
              color="gray"
              style={{ marginBottom: 12 }}
            >
              Select the language you want subtitles in. Subtitle generation
              logic will be plugged in here later.
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
              disabled={!previewUrl}
            >
              {isGeneratingSubs ? "Generating..." : "Generate subtitles"}
            </Button>
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
          // TODO: wire this to a page that lists edited clips
          onClick={() => router.push("/clips")}
          disabled={!previewUrl}
        >
          Finish
        </Button>
      </div>
    </main>
  );
}


