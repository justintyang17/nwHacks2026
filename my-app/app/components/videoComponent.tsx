
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
                    width: "300px",
                    height: "200px",
                    backgroundColor: "#000",
                    display: "inline-block", // for horizontal scroll
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
                    Edit
                </Button>
                <Button variant="contained" color="error" onClick={handleRemove}>
                    Remove
                </Button>
            </div>
        </div>
    );
}