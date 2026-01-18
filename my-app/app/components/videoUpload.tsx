"use client";

import type React from "react";
import {
    Button,
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Slider from "react-slick";
import VideoComponent from "./videoComponent";
import { setSelectedVideoFile } from "./videoStore";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useOriginalVideoContext } from "../context/VideoContext";
import SocialMediaModal from "./SocialMediaModal";

export default function VideoUpload() {
    const router = useRouter();

    const { originalVideos, addOriginalVideo, removeOriginalVideo } =
        useOriginalVideoContext();
    const [openModal, setOpenModal] = useState(false);
    const sliderSettings = {
        infinite: false,
        slidesToShow: 2,
        slidesToScroll: 2,
        arrows: true,
        draggable: true,
        centerMode: false,
        responsive: [
            {
                breakpoint: 1280,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 2,
                },
            },
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 2,
                },
            },
            {
                breakpoint: 600,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                },
            },
        ],
    };

    const handleFiles = (files: FileList | null) => {
        if (!files || files.length === 0) return;
        const vid = files[0];
        addOriginalVideo(vid);
    };

    const handleAddChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        handleFiles(e.target.files);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        handleFiles(e.dataTransfer.files);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    const handleRemove = (idx: number, url: string) => {
        removeOriginalVideo(idx);
    };

    const handleUpload = (idx: number, url: string) => {
        //const video = videos[idx];
        const video = originalVideos[idx]
        if (!video) return;

        setSelectedVideoFile(video.file);
        sessionStorage.setItem("videoToEditUrl", url);

        router.push("/edit");
    };

    const openAccountModal = () => {
        setOpenModal(true);
    }

    const closeAccountModal = () => {
        setOpenModal(false);
    }

    return (
        <main
            style={{
                minHeight: "100vh",
                padding: "32px 24px",
                backgroundColor: "#000000",
                color: "#f9fafb",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 24,
            }}
        >
            {/* Header */}
            <div
                style={{
                    width: "100%",
                    maxWidth: 960,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}
            >
                <Typography variant="h5">Add Videos</Typography>
                <Button
                    variant="outlined"
                    color="inherit"
                    className="glass-btn glass-btn-neutral"
                    onClick={openAccountModal}
                >
                    Account
                </Button>
            </div>

            {/* Upload Card */}
            <div
                className="glass-card"
                style={{
                    width: "100%",
                    maxWidth: 960,
                    padding: 32,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <div
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    style={{
                        width: "100%",
                        maxWidth: 640,
                        minHeight: 220,
                        borderRadius: 24,
                        border: "1px dashed rgba(148,163,184,0.7)",
                        background:
                            "linear-gradient(135deg, rgba(15,23,42,0.95), rgba(15,23,42,0.82))",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 12,
                        padding: 24,
                        textAlign: "center",
                    }}
                >
                    <div
                        style={{
                            width: 56,
                            height: 56,
                            borderRadius: 16,
                            backgroundColor: "rgba(15,23,42,0.9)",
                            border: "1px solid rgba(148,163,184,0.6)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            marginBottom: 4,
                        }}
                    >
                        <span style={{ fontSize: 24 }}>📁</span>
                    </div>
                    <Typography variant="h6" component="h2">
                        Create a new project
                    </Typography>
                    <Typography variant="body2" color="gray">
                        Drag and drop video files to upload
                    </Typography>
                    <Typography
                        variant="body2"
                        color="gray"
                        style={{ fontSize: 12, marginTop: 4 }}
                    >
                        Your video will be private until you publish your project.
                    </Typography>
                    <div style={{ marginTop: 12 }}>
                        <Button
                            variant="outlined"
                            color="inherit"
                            className="glass-btn glass-btn-primary"
                            component="label"
                        >
                            Select files
                            <input
                                type="file"
                                accept="video/*"
                                hidden
                                onChange={handleAddChange}
                                multiple
                            />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Video Carousel Card */}
            <div
                className="glass-card-soft"
                style={{
                    width: "100%",
                    maxWidth: 960,
                    padding: 20,
                }}
            >
                <Typography variant="subtitle1" gutterBottom>
                    Uploaded videos
                </Typography>

                {originalVideos.length == 0 ? (
                    <Typography variant="body2" color="gray">
                        No videos uploaded yet
                    </Typography>
                ) : (
                    <Slider {...sliderSettings}>
                        {originalVideos.map((video, idx) => (
                            <VideoComponent
                                key={idx}
                                url={video.url}
                                index={idx}
                                removeCallback={handleRemove}
                                uploadCallback={handleUpload}
                            />
                        ))}
                    </Slider>
                )}
            </div>

            <Dialog
                open={openModal}
                onClose={closeAccountModal}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        backgroundColor: "#000000",
                        color: "#f9fafb",
                        borderRadius: 3,
                        border: "1px solid rgba(148,163,184,0.4)",
                    },
                }}
            >
                <DialogTitle
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        pr: 6,
                    }}
                >
                    Accounts
                    <IconButton
                        onClick={closeAccountModal}
                        sx={{
                            position: "absolute",
                            right: 12,
                            top: 10,
                            borderRadius: "999px",
                            border: "1px solid rgba(148,163,184,0.6)",
                            color: "#e5e7eb",
                            padding: "4px",
                            backgroundColor: "rgba(15,23,42,0.85)",
                            transition: "all 150ms ease",
                            "&:hover": {
                                backgroundColor: "rgba(239,68,68,0.95)",
                                borderColor: "rgba(248,113,113,0.9)",
                                color: "#f9fafb",
                            },
                        }}
                    >
                        <CloseIcon fontSize="small" />
                    </IconButton>
                </DialogTitle>

                <DialogContent>
                    <SocialMediaModal />
                </DialogContent>
            </Dialog>
        </main>
    );
}