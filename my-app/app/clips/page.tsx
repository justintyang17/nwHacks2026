"use client";

import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Skeleton,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import Grid from "@mui/material/Grid";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import EditedVideoComponent from "../components/EditedVideoComponent";
import PostModal from "../components/PostModal";
import SocialMediaModal from "../components/SocialMediaModal";
import { useEditedVideoContext } from "../context/EditedVideoContext";
import { Platform } from "../context/SocialMediaContext";

export default function ClipsPage() {
  const router = useRouter();
  const { editedVideos, removeEditedVideo } = useEditedVideoContext();
  const [isLoading, setIsLoading] = useState(true);
  const [postModal, setPostOpenModal] = useState(false);
  const [accountModal, setAccountModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(t);
  }, []);


  const openPostModal = () => {
    setPostOpenModal(true);
  };

  const closePostModal = () => {
    setPostOpenModal(false);
  };

  const openAccountModal = () => {
    setAccountModal(true);
  };

  const closeAccountModal = () => {
    setAccountModal(false);
  };

  const handleRemove = (idx: number) => {
    removeEditedVideo(idx);
  };

  async function getFileFromUrl(url: string, filename: string) {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch file from URL");

    const blob = await res.blob();
    return new File([blob], filename, { type: blob.type });
  }

  const handleShare = async (_idx: number, url: string) => {
    const parts = url.split("/");
    const filename = parts[parts.length - 1];
    const file = await getFileFromUrl(url, filename);
    setSelectedVideo(file);
    openPostModal();
  };

  const handleDownload = (_idx: number, url: string) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = "edited-video.mp4";
    a.click();
  };

  const handlePost = async (platform: Platform, caption: string) => {
    if (!selectedVideo) {
      console.log("No Video Selected");
      return;
    }
    try {
      const formData = new FormData();
      formData.append("platform", platform);
      formData.append("content", caption);
      formData.append("video", selectedVideo);

      const res = await fetch("/api/post", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        console.log("post error");
        return;
      }

      const data = (await res.json()) as {
        success?: boolean;
      };

      if (!data.success) {
        console.log("Post Failed.");
        return;
      }
    } catch (e) {
      console.log("Unexpected error while posting video.");
    }
    closePostModal();
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
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          <Typography variant="h5">Publish Videos</Typography>
          <div style={{ display: "flex", gap: 8 }}>
            <Button
              variant="outlined"
              color="inherit"
              className="glass-btn glass-btn-neutral"
              onClick={() => router.push("/")}
            >
              Back to Uploads
            </Button>
            <Button
              variant="outlined"
              color="inherit"
              className="glass-btn glass-btn-neutral"
              onClick={openAccountModal}
            >
              Account
            </Button>
          </div>
        </div>
        <div
          style={{
            borderBottom: "1px solid rgba(148,163,184,0.3)",
            marginTop: 8,
          }}
        />
      </div>

      {/* Edited Videos List */}
      <div
        style={{
          width: "100%",
          maxWidth: 1000,
        }}
      >
        {isLoading ? (
          <Grid container spacing={1}>
            {[0, 1, 2].map((i) => (
              <Grid item key={i} xs={12} sm={6} md={4}>
                <Skeleton
                  variant="rectangular"
                  width={320}
                  height={320 * (16 / 9)}
                  sx={{ bgcolor: "rgba(148,163,184,0.25)", borderRadius: 1 }}
                />
              </Grid>
            ))}
          </Grid>
        ) : editedVideos.length === 0 ? (
          <Typography variant="body2" color="gray">
            No edited clips yet. Go back to the editor to create your first clip.
          </Typography>
        ) : (
          <Grid container spacing={1}>
            {editedVideos.map((editedVideo, idx) => (
              <Grid item key={idx} xs={12} sm={6} md={4} lg={3}>
                <EditedVideoComponent
                  video={editedVideo}
                  index={idx}
                  removeCallback={handleRemove}
                  shareCallback={handleShare}
                  downloadCallback={handleDownload}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </div>

      {/* Post modal */}
      <Dialog
        open={postModal}
        onClose={closePostModal}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: "#000000",
            color: "#f9fafb",
            borderRadius: 3,
            border: "1px solid rgba(148,163,184,0.4)",
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            pr: 6,
          }}
        >
          Create a Post
          <IconButton
            onClick={closePostModal}
            sx={{
              position: "absolute",
              right: 12,
              top: 10,
              borderRadius: "999px",
              border: "1px solid rgba(148,163,184,0.6)",
              color: "#e5e7eb",
              padding: "4px",
              backgroundColor: "rgba(15,23,42,0.85)",
              transition: "all 150ms ease",
              "&:hover": {
                backgroundColor: "rgba(239,68,68,0.95)",
                borderColor: "rgba(248,113,113,0.9)",
                color: "#f9fafb",
              },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <PostModal postCallback={handlePost} />
        </DialogContent>
      </Dialog>

      {/* Accounts modal */}
      <Dialog open={accountModal} onClose={closeAccountModal} maxWidth="sm" fullWidth>
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            pr: 6,
          }}
        >
          Accounts
          <IconButton
            onClick={closeAccountModal}
            sx={{
              position: "absolute",
              right: 12,
              top: 10,
              borderRadius: "999px",
              border: "1px solid rgba(148,163,184,0.6)",
              color: "#e5e7eb",
              padding: "4px",
              backgroundColor: "rgba(15,23,42,0.85)",
              transition: "all 150ms ease",
              "&:hover": {
                backgroundColor: "rgba(239,68,68,0.95)",
                borderColor: "rgba(248,113,113,0.9)",
                color: "#f9fafb",
              },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <SocialMediaModal />
        </DialogContent>
      </Dialog>
    </main>
  );
}