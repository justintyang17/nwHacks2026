
"use client";

import { Button } from "@mui/material";
import { useState, useEffect } from "react";
import Slider from "react-slick";
import VideoComponent from "./videoComponent";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

export default function VideoUpload() {
    const [videos, setVideos] = useState<File[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    const [currVideo, setCurrVideo] = useState<File | null>(null);

    const sliderSettings = {
    infinite: false,
    slidesToShow: 4,
    slidesToScroll: 4,
    arrows: true,
    draggable: true,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 2 } },
      { breakpoint: 600, settings: { slidesToShow: 1 } },
    ],
  };

    //Set Videos State Variable
    const handleAddChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        const vid = e.target.files[0];
        setVideos((prev) => [...prev, vid]);
        setCurrVideo(vid);
    };

    const handleRemove = (idx: number, url: string) => {
        const index = previewUrls.indexOf(url);
        if (index !== idx) {
            console.log("INDEX MISMATCH")
        }
        if (idx === -1) {
            console.log("remove error");
            return; // URL not found
        }

        setVideos((prevVideos) => prevVideos.filter((_, i) => i !== idx));

        setPreviewUrls((prevUrls) => prevUrls.filter((u) => u !== url));
    };

    //Set Preview Urls
    useEffect(() => {
        if (videos.length == 0) return;

        const urls = videos.map((video) => URL.createObjectURL(video));
        setPreviewUrls(urls);

        // Cleanup to avoid memory leaks
        return () => urls.forEach((url) => URL.revokeObjectURL(url));
    }, [videos]);

    // Upload Button
    const handleUpload = async (idx: number, url: string) => {
        const video = videos[idx];
        if (!video) {
            console.log("upload ERROR")
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
            style={{
                display: "flex",
                flexDirection: "column",
                height: "100vh", // full viewport height
            }}
        >
            {/*Top Bar*/}
            <div style={{ height: "60px", backgroundColor: "#444", color: "#fff", padding: 16 }}>
                <h1>Privacy Video Processor</h1></div>

            {/* Upload Area*/}
            <div
                style={{
                    flex: 1,
                    backgroundColor: "#666",
                    display: "flex",
                    alignItems: "center",
                    padding: 16,
                    gap: 16,
                }}
            >
                <Button variant="contained" component="label">
                    Add Video
                    <input
                        type="file"
                        accept="video/*"
                        onChange={handleAddChange}
                        style={{ display: "none" }}
                    />
                </Button>
            </div>


        {/* Video Carousel */}
      <div style={{ flex: 1, backgroundColor: "#888", padding: 16 }}>
        {previewUrls.length === 0 ? (
          <h3 style={{ color: "#fff" }}>No videos uploaded yet</h3>
        ) : (
          <Slider {...sliderSettings}>
            {previewUrls.map((previewUrl, idx) => (
              <VideoComponent key={idx} url={previewUrl} index={idx} removeCallback={handleRemove} uploadCallback={handleUpload}/>
            ))}
          </Slider>
        )}
      </div>
        </div>
    );
}