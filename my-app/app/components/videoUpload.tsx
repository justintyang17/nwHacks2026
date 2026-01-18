"use client";

import {
    Button,
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    Typography,
} from "@mui/material";
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

    const { originalVideos, addOriginalVideo, removeOriginalVideo } = useOriginalVideoContext();
    const [openModal, setOpenModal] = useState(false);

    const sliderSettings = {
        infinite: false,
        slidesToShow: 3,
        slidesToScroll: 3,
        arrows: true,
        draggable: true,
        responsive: [
            { breakpoint: 1024, settings: { slidesToShow: 2 } },
            { breakpoint: 600, settings: { slidesToShow: 1 } },
        ],
    };

    const handleAddChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        const vid = e.target.files[0];
        addOriginalVideo(vid)
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
                <Button variant="outlined" color="inherit" onClick={openAccountModal}>
                    Account
                </Button>
            </div>

            {/* Upload Card */}
            <div
                style={{
                    width: "100%",
                    maxWidth: 960,
                    backgroundColor: "rgba(15,23,42,0.45)",
                    borderRadius: 20,
                    padding: 20,
                    border: "1px solid rgba(148,163,184,0.35)",
                    boxShadow: "0 18px 45px rgba(0,0,0,0.65)",
                    backdropFilter: "blur(18px)",
                    WebkitBackdropFilter: "blur(18px)",
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                }}
            >
                <Button variant="contained" component="label">
                    Add video
                    <input
                        type="file"
                        accept="video/*"
                        hidden
                        onChange={handleAddChange}
                    />
                </Button>
                <Typography variant="body2" color="gray">
                    Upload one or more videos to edit
                </Typography>
            </div>

            {/* Video Carousel Card */}
            <div
                style={{
                    width: "100%",
                    maxWidth: 960,
                    backgroundColor: "rgba(15,23,42,0.45)",
                    borderRadius: 20,
                    padding: 20,
                    border: "1px solid rgba(148,163,184,0.35)",
                    boxShadow: "0 18px 45px rgba(0,0,0,0.65)",
                    backdropFilter: "blur(18px)",
                    WebkitBackdropFilter: "blur(18px)",
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
            >
                <DialogTitle>
                    Accounts
                    <IconButton
                        onClick={closeAccountModal}
                        sx={{ position: "absolute", right: 8, top: 8 }}
                    >
                        X
                    </IconButton>
                </DialogTitle>

                <DialogContent>
                    <SocialMediaModal />
                </DialogContent>
            </Dialog>
        </main>
    );
}