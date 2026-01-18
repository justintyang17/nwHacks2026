"use client";

import { Button, TextField } from "@mui/material";
import { Platform, useSocialMediaContext } from "../context/SocialMediaContext";
import { useState, useEffect } from "react";
import InstagramIcon from "@mui/icons-material/Instagram";
import YouTubeIcon from "@mui/icons-material/YouTube";
import TwitterIcon from "@mui/icons-material/Twitter";
import MusicNoteIcon from "@mui/icons-material/MusicNote";

interface PostModalComponentProps {
  postCallback: (platform: Platform, caption: string) => void;
}

export default function PostModal({ postCallback }: PostModalComponentProps) {
  const { accounts } = useSocialMediaContext();
  const [postPlatform, setPostPlatform] = useState<Platform | null>(null);
  const [caption, setCaption] = useState("");

  const platforms: Platform[] = ["twitter", "instagram", "youtube", "tiktok"];
  const platformIcons: Record<Platform, JSX.Element> = {
    twitter: <TwitterIcon />,
    instagram: <InstagramIcon />,
    youtube: <YouTubeIcon />,
    tiktok: <MusicNoteIcon />,
  };

  // Track which platforms are connected
  const [connected, setConnected] = useState<Record<Platform, boolean>>({
    twitter: false,
    instagram: false,
    youtube: false,
    tiktok: false,
  });

  // Check connected platforms on mount
  useEffect(() => {
    platforms.forEach(async (platform) => {
      try {
        const formData = new FormData();
        formData.append("platform", platform);

        const res = await fetch("/api/isConnected", {
          method: "POST",
          body: formData,
        });
        if (!res.ok) return;

        const data = (await res.json()) as {
          success?: boolean;
          platform: boolean;
        };

        if (!data.success) return;

        setConnected((prev) => ({
          ...prev,
          [platform]: data.platform,
        }));
      } catch (e) {
        console.log("Error checking platform:", platform, e);
      }
    });
  }, []);
const handlePost = () => {
    if (!postPlatform) {
      console.log("No platform selected");
      return;
    }

    postCallback(postPlatform, caption);
  };

  return (
    <form
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 12,
        width: "100%",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {platforms.map((platform) => (
          <Button
            key={platform}
            variant="contained"
            disabled={postPlatform === platform || !connected[platform]}
            onClick={() => setPostPlatform(platform)}
            aria-label={platform}
          >
            {platformIcons[platform]}
          </Button>
        ))}
      </div>

      <TextField
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        multiline
        rows={4}
        placeholder="Write your caption here..."
        variant="outlined"
        fullWidth
        sx={{ maxWidth: 500 }}
      />

      <Button
        variant="contained"
        disabled={!postPlatform}
        onClick={handlePost}
        sx={{ marginTop: 12 }}
      >
        {postPlatform ? `Post on ${postPlatform}` : "Select a platform"}
      </Button>
    </form>
  );
}