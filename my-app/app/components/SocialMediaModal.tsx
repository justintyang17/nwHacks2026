import { useEffect, useState } from "react";
import { Button } from "@mui/material";
import { Platform, useSocialMediaContext } from "../context/SocialMediaContext";

export default function SocialMediaModal() {
  const { accounts, setAccount } = useSocialMediaContext();

  const platforms: Platform[] = ["twitter", "instagram", "youtube", "tiktok"];

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
    <form>
      <div>
        {platforms.map(platform => (
          <div
            key={platform}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "12px 16px",
              border: "1px solid rgba(148,163,184,0.5)",
              borderRadius: 8,
              marginBottom: 12,
              backgroundColor: "rgba(15,23,42,0.2)",
            }}
          >
            <h3 style={{ margin: 0, textTransform: "capitalize" }}>
              {platform}
            </h3>

            <Button variant="contained" onClick={() => handleConnect(platform)}>
              {connected[platform] ? "Change Account" : "Add Account"}
            </Button>
          </div>
        ))}
      </div>
    </form>
  );
}