
import { Button } from "@mui/material";
import { useState, useEffect } from "react";

interface VideoComponentProps {
    url: string;
    index: number;
    removeCallback: (index: number, url: string) => void;
    uploadCallback: (index: number, url: string) => void;
}


export default function VideoComponent({url, index, removeCallback, uploadCallback} : VideoComponentProps) {

    const handleUpdate = () => {
        uploadCallback(index, url)
    }

    const handleRemove = () => {
        removeCallback(index, url)
    }

    return (
        <div>
            <div
                style={{
                    width: "320px",
                    aspectRatio: "9 / 16",
                    backgroundColor: "#000",
                    borderRadius: 4,
                    overflow: "hidden",
                }}
            >
                <video
                    src={url}
                    controls
                    style={{ width: "100%", height: "100%", objectFit: "contain" }}
                />
            </div>
            <div
                style={{
                    display: "flex",
                    width: "300px",
                    justifyContent: "space-between",
                    gap: 8,
                    paddingTop: 6,
                }}
            >
                <Button
                    variant="outlined"
                    color="inherit"
                    className="glass-btn glass-btn-primary"
                    size="small"
                    onClick={handleUpdate}
                >
                    Edit
                </Button>
                <Button
                    variant="outlined"
                    color="inherit"
                    className="glass-btn glass-btn-danger"
                    size="small"
                    onClick={handleRemove}
                >
                    Remove
                </Button>
            </div>
        </div>
    );
}