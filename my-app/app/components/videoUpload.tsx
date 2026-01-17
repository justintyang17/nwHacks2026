"use client";

import { useState } from "react";
console.log("🟢 VideoUpload component rendered");
export default function VideoUpload() {
  const [video, setVideo] = useState<File | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setVideo(e.target.files[0]);
  };

  const handleUpload = async () => {
    console.log("Upload clicked");
    if (!video) return;

    const formData = new FormData();
    formData.append("video", video);

    await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });
  };

  return (
    <div>
      <input
        type="file"
        accept="video/*"
        onChange={handleChange}
      />
      <button onClick={handleUpload}>
        Video
      </button>
    </div>
  );
}