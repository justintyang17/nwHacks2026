 "use client";

import { Button, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import EditedVideoComponent from "../components/EditedVideoComponent";

import { useEditedVideoContext } from "../context/EditedVideoContext";

export default function ClipsPage() {
  const router = useRouter();
  const { editedVideos, removeEditedVideo } = useEditedVideoContext();

  const handleRemove = (idx: number) => {
    removeEditedVideo(idx);
  };

  const handleShare = (idx: number, url: string) => {
    // TODO: implement social sharing
    void idx;
    void url;
  };

  const handleDownload = (idx: number, url: string) => {
    // Simple browser download for now.
    void idx;
    const a = document.createElement("a");
    a.href = url;
    a.download = "edited-video.mp4";
    a.click();
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
      {/* Header */}
      <div
        style={{
          width: "100%",
          maxWidth: 960,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h5">Publish Videos</Typography>
        <Button
          variant="outlined"
          color="inherit"
          onClick={() => router.push("/")}
        >
          Back to Uploads
        </Button>
      </div>

      {/* Edited Videos List */}
      <div style={{ height: 800, overflow: "auto" }}>
        {editedVideos.map((editedVideo, idx) => (
          <div key={idx}>
            <EditedVideoComponent
              video={editedVideo}
              index={idx}
              removeCallback={handleRemove}
              shareCallback={handleShare}
              downloadCallback={handleDownload}
            />
          </div>
        ))}
      </div>
    </main>
  );
}