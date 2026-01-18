
import { Button } from "@mui/material";
import { useState, useEffect } from "react";

export default function VideoComponent({url, index, removeCallback, uploadCallback}) {

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
        <Button variant="contained" onClick={() => handleUpdate()}>
          Upload for Editing
        </Button>
          <Button variant="contained" color="error" onClick={() => handleRemove()}>
          Remove
        </Button>
    </div>
  );
}