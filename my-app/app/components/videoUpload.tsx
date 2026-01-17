"use client";

import { Button } from "@mui/material";
import { useState, useEffect } from "react";

export default function VideoUpload() {
    const [video, setVideo] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        setVideo(e.target.files[0]);
    };

    useEffect(() => {
        if (!video) return;

        const url = URL.createObjectURL(video);
        setPreviewUrl(url);

        // Cleanup to avoid memory leaks
        return () => URL.revokeObjectURL(url);
    }, [video]);

  const handleUpload = async () => {

    if (!video) {
      return;
    }

    const formData = new FormData();
    formData.append("video", video);

    await fetch("/api/upload", {
            method: "POST",
            body: formData,
        });
    };

  return (
    <div
     style={{backgroundColor: "#303030"}}>
        <h4> Privacy Video Processor</h4>    
        <Button
            variant="contained"
            component="label">
            {video ? "Change Video" : "Add Video"}
            <input
                type="file"
                onChange={handleChange}
                style={{ display: "none" }}
            />
        </Button>
        <Button 
            variant="contained"
            disabled={!video} 
            onClick={handleUpload}>
            Upload Video
        </Button>
        <div
            style={{
                width: "500px",
                height: "500px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
            }}>
                {!previewUrl && (
                   <h3 style={{
                    justifyContent: "center"
                   }}
                   >Upload a Video File!</h3>             
                )}
                {previewUrl && (
                <video
                src={previewUrl}
                controls
                autoPlay
                    style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain"
                    }}/>
                )}
        </div>
    </div>
  );
}