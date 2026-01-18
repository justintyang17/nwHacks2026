"use client";

import { Button } from "@mui/material";
import { Platform, useSocialMediaContext } from "../context/SocialMediaContext";

export default function SocialMediaModal() {

    const { accounts, setAccount } = useSocialMediaContext();

    // return true if there is an account already associate with platform
    const isConnected = (platform: Platform) => {
        return (platform.length == 7);
    }

    const platforms: Platform[] = [
        "twitter",
        "instagram",
        "youtube",
        "tiktok",
    ];

    // set new account or replace existing account
    const handleConnect = (platform: Platform) => {

    }

    // get username associated with this platform, assume that it is connected
    const getAccount = (platform: Platform) => {
        return "temp"
    }

    return (
<form>
  <div>
    {platforms.map((platform) => (
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
            {platform} {isConnected(platform) ? "" : "-" + getAccount(platform)}
        </h3>

        <Button
          variant="contained"
          onClick={() => handleConnect(platform)}
        >
          {isConnected(platform) ? "Change Account" : "Add Account"}
        </Button>
      </div>
    ))}
  </div>
</form>


    );
}