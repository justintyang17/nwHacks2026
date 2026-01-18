
import { Button } from "@mui/material";
import { useState } from "react";
import type { VideoMeta } from "../context/EditedVideoContext";

type SubtitleSegment = {
  start: number;
  end: number;
  text: string;
};

interface EditedVideoComponentProps {
  video: VideoMeta;
  index: number;
  removeCallback: (index: number) => void;
  downloadCallback: (index: number, url: string) => void;
  shareCallback: (index: number, url: string) => void;
}

export default function EditedVideoComponent({
  video,
  index,
  removeCallback,
  shareCallback,
  downloadCallback,
}: EditedVideoComponentProps) {
  const [currentSubtitleIndex, setCurrentSubtitleIndex] = useState(0);

  const handleDownload = () => {
    downloadCallback(index, video.url);
  };

  const handleShare = () => {
    shareCallback(index, video.url);
  };

  const handleRemove = () => {
    removeCallback(index);
  };

  const handleTimeUpdate = (
    event: React.SyntheticEvent<HTMLVideoElement, Event>
  ) => {
    if (!video.subtitles || video.subtitles.length === 0) return;
    const t = event.currentTarget.currentTime;

    let idx = (video.subtitles as SubtitleSegment[]).findIndex(
      (seg) => t >= seg.start && t < seg.end
    );
    if (
      idx === -1 &&
      t >= (video.subtitles as SubtitleSegment[])[video.subtitles.length - 1].end
    ) {
      idx = video.subtitles.length - 1;
    }

    if (idx !== -1 && idx !== currentSubtitleIndex) {
      setCurrentSubtitleIndex(idx);
    }
  };

  return (
    <div>
      <div
        style={{
          width: "300px",
          height: "200px",
          backgroundColor: "#000",
          display: "inline-block",
          marginRight: "16px",
          borderRadius: 4,
          overflow: "hidden",
          position: "relative",
        }}
      >
        <video
          src={video.url}
          controls
          onTimeUpdate={handleTimeUpdate}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />

        {video.subtitles &&
          video.subtitles.length > 0 &&
          currentSubtitleIndex >= 0 && (
            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: 8,
                display: "flex",
                justifyContent: "center",
                pointerEvents: "none",
              }}
            >
              <div
                style={{
                  maxWidth: "90%",
                  padding: "4px 8px",
                  backgroundColor: "rgba(0, 0, 0, 0.7)",
                  borderRadius: 6,
                  color: "#f9fafb",
                  fontSize: 10,
                  textAlign: "center",
                  fontFamily:
                    "'Noto Sans', 'Noto Sans SC', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                }}
              >
                {video.subtitles[currentSubtitleIndex]?.text}
              </div>
            </div>
          )}
      </div>
      <div
        style={{
          display: "flex",
          width: "300px",
          justifyContent: "space-between",
          padding: "10px",
        }}
      >
        <Button variant="contained" onClick={handleDownload}>
          Download
        </Button>
        <Button variant="contained" onClick={handleShare}>
          Share
        </Button>
        <Button variant="contained" color="error" onClick={handleRemove}>
          Delete
        </Button>
      </div>
    </div>
  );
}