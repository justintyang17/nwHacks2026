
import { Button } from "@mui/material";
import type { VideoMeta } from "../context/EditedVideoContext";

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
  const handleDownload = () => {
    downloadCallback(index, video.url);
  };

  const handleShare = () => {
    shareCallback(index, video.url);
  };

  const handleRemove = () => {
    removeCallback(index);
  };

  return (
    <div>
      <div
        style={{
          width: "320px",
          aspectRatio: "9 / 16",
          backgroundColor: "#000",
          display: "inline-block",
          marginRight: "16px",
          borderRadius: 4,
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* At this point subtitles are already baked into the video file itself */}
        <video
          src={video.url}
          controls
          style={{ width: "100%", height: "100%", objectFit: "contain" }}
        />
      </div>
      <div
        style={{
          display: "flex",
          width: "320px",
          justifyContent: "space-between",
          padding: "10px",
        }}
      >
        <Button
          variant="outlined"
          color="inherit"
          className="glass-btn glass-btn-secondary"
          onClick={handleDownload}
        >
          Download
        </Button>
        <Button
          variant="outlined"
          color="inherit"
          className="glass-btn glass-btn-primary"
          onClick={handleShare}
        >
          Share
        </Button>
        <Button
          variant="outlined"
          color="inherit"
          className="glass-btn glass-btn-danger"
          onClick={handleRemove}
        >
          Delete
        </Button>
      </div>
    </div>
  );
}