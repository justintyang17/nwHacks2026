
import { Button } from "@mui/material";
import { useState, useEffect } from "react";

interface EditedVideoComponentProps {
    url: string;
    index: number;
    removeCallback: (index: number, url: string) => void;
    downloadCallback: (index: number, url: string) => void;
    shareCallback: (index: number, url:string) => void;
}

export default function EditedVideoComponent({ url, index, removeCallback, shareCallback, downloadCallback }: EditedVideoComponentProps) {

    const handleUpdate = () => {
        downloadCallback(index, url)
    }

    const handleShare = () => {
        shareCallback(index, url)
    }

    const handleRemove = () => {
        removeCallback(index, url)
    }

    return (
        <div>
            <div
                style={{
                    width: "300px",
                    height: "200px",
                    backgroundColor: "#000",
                    display: "inline-block",
                    marginRight: "16px",
                    borderRadius: 4,
                    overflow: "hidden",
                }}
            >
                <video
                    src={url}
                    controls
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
            </div>
            <div
                style={{
                    display: "flex",
                    width: "300px",
                    justifyContent: "space-between",
                    padding: "10px"
                }}
            >
                <Button variant="contained" onClick={handleUpdate}>
                    Download
                </Button>
                <Button variant="contained" onClick={handleShare}>
                    Share
                </Button>
                <Button variant="contained" color="error" onClick={handleRemove}>
                    Delete
                </Button>
            </div>
        </div>
    );
}