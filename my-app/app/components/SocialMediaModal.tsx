import { useEffect, useState } from "react";
import { Button } from "@mui/material";
import { Platform, useSocialMediaContext } from "../context/SocialMediaContext";
import InstagramIcon from '@mui/icons-material/Instagram';
import YouTubeIcon from '@mui/icons-material/YouTube';
import TwitterIcon from '@mui/icons-material/Twitter';
import MusicNoteIcon from '@mui/icons-material/MusicNote';

export default function SocialMediaModal() {
  const { accounts, setAccount } = useSocialMediaContext();

  const platforms: Platform[] = ["twitter", "instagram", "youtube", "tiktok"];

  const platformIcons: Record<Platform, JSX.Element> = {
    twitter: <TwitterIcon />,
    instagram: <InstagramIcon />,
    youtube: <YouTubeIcon />,
    tiktok: <MusicNoteIcon />,
  };

  // store connection status per platform
  const [connected, setConnected] = useState<Record<Platform, boolean>>({
    twitter: false,
    instagram: false,
    youtube: false,
    tiktok: false,
  });

  useEffect(() => {
    // fetch connection status for all platforms
    const fetchStatus = async () => {
      const newStatus: Record<Platform, boolean> = {
          instagram: false,
          twitter: false,
          tiktok: false,
          youtube: false
      };
      for (const platform of platforms) {
        try {
          const formData = new FormData();
          formData.append("platform", platform);

          const res = await fetch("/api/isConnected", {
            method: "POST",
            body: formData,
          });

          const data = await res.json();
          newStatus[platform] = data?.platform || false;
        } catch (err) {
          console.error(err);
          newStatus[platform] = false;
        }
      }
      setConnected(newStatus);
    };

    fetchStatus();
  }, []);
const handleConnect = async (platform: Platform) => {
    try {
      const formData = new FormData();
      formData.append("platform", platform);

      const res = await fetch("/api/connect", { method: "POST", body: formData });
      const data = await res.json();

      if (data.auth) {
        window.location.href = data.auth;
      }

      setAccount(platform, null);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <form
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 8,
        backgroundColor: "transparent",
        color: "#f9fafb",
      }}
    >
      <div>
        {platforms.map((platform) => (
          <div
            key={platform}
            className="glass-card-soft"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "12px 16px",
              borderRadius: 14,
              marginBottom: 10,
              background: "rgba(37, 99, 235, 0.35)", // blue glass
              border: "1px solid rgba(96, 165, 250, 0.7)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              {platformIcons[platform]}
              <h3 style={{ margin: 0, textTransform: "capitalize" }}>
                {platform}
              </h3>
            </div>

            <Button
              variant="outlined"
              color="inherit"
              size="small"
              className={`glass-btn ${
                connected[platform] ? "glass-btn-neutral" : "glass-btn-primary"
              }`}
              onClick={() => handleConnect(platform)}
            >
              {connected[platform] ? "Change Account" : "Add Account"}
            </Button>
          </div>
        ))}
      </div>
    </form>
  );
}