"use client";

import { Button, TextField } from "@mui/material";
import { Platform, useSocialMediaContext } from "../context/SocialMediaContext";
import { useState } from "react";

interface PostModalComponentProps {
  postCallback: (platform: Platform, caption: string) => void;
}

export default function PostModal({postCallback}: PostModalComponentProps) {

    const { accounts, setAccount } = useSocialMediaContext();
    const [postPlatform, setPostPlatform] = useState<Platform | null>(null);
    const [caption, setCaption] = useState("");

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

    // create a post with platform = postPlatform and content = caption
    const handlePost = () => {
        if (!postPlatform) {
            console.log("no platform selected");
            return;
        }
        postCallback(postPlatform, caption);
    }

    return (
        <form
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 12, // space between rows
                width: "100%",
            }}>
            <div style={{
                display: "flex",
                alignItems: "center",
                gap: 16
            }}>
                {platforms.map((platform) => (
                    <div
                        key={platform}
                    >
                        <Button
                            variant="contained"
                            disabled={(platform == postPlatform) || !isConnected(platform)}
                            onClick={() => setPostPlatform(platform)}
                        >
                            {platform}
                        </Button>
                    </div>
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

            <h1></h1>
            <Button
                variant="contained"
                disabled={!postPlatform}
                onClick={handlePost}
            >
                Post {postPlatform && "on " + postPlatform} 
            </Button>
        </form>


    );
}