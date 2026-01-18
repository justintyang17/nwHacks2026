"use client";

import { Button, Dialog, DialogContent, DialogTitle, IconButton, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import { useRouter } from "next/navigation";
import EditedVideoComponent from "../components/EditedVideoComponent";
import { useState } from "react";
import PostModal from "../components/PostModal";
import SocialMediaModal from "../components/SocialMediaModal";
import { useEditedVideoContext } from "../context/EditedVideoContext";

export default function ClipsPage() {
    const router = useRouter();
    const { editedVideos, removeEditedVideo } = useEditedVideoContext();

    const [postModal, setPostOpenModal] = useState(false);
    const [accountModal, setAccountModal] = useState(false);


    const openPostModal = () => {
        setPostOpenModal(true);
    }

    const closePostModal = () => {
        setPostOpenModal(false);
    }

    const openAccountModal = () => {
        setAccountModal(true);
    }

    const closeAccountModal = () => {
        setAccountModal(false);
    }

    const handleRemove = (idx: number) => {
        removeEditedVideo(idx);
    };

    const handleShare = (idx: number, url: string) => {
        openPostModal();
        void idx;
        void url;
    };

    const handleDownload = (idx: number, url: string) => {
        // Simple browser download for now.
        void idx;
        const a = document.createElement("a");
        a.href = url;
        a.download = "edited-video.mp4";
        a.click();
    };

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
                overflow: "hidden"
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
                <Typography variant="h5">Publish Videos</Typography>
                <Button
                    variant="outlined"
                    color="inherit"
                    onClick={() => router.push("/")}
                >
                    Back to Uploads
                </Button>
                <Button variant="outlined" color="inherit" onClick={openAccountModal}>
                    Account
                </Button>
            </div>

            {/* Edited Videos List */}
            <div
                style={{
                    overflowY: "auto",
                    width: "100%",
                    maxWidth: 1000,
                }}
            >
                <div style={{ height: 575, overflowY: "auto", width: "100%", maxWidth: 1000 }}>
                    <Grid container spacing={1}>
                        {editedVideos.map((editedVideo, idx) => (
                            <Grid
                                key={idx}
                                columns={3}>
                                <EditedVideoComponent
                                    video={editedVideo}
                                    index={idx}
                                    removeCallback={handleRemove}
                                    shareCallback={handleShare}
                                    downloadCallback={handleDownload}
                                />
                            </Grid>
                        ))}
                    </Grid>
                </div>

            </div>

            <Dialog
                open={postModal}
                onClose={closePostModal}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    Create a Post
                    <IconButton
                        onClick={closePostModal}
                        sx={{ position: "absolute", right: 8, top: 8 }}
                    >
                        X
                    </IconButton>
                </DialogTitle>

                <DialogContent>
                    <PostModal postCallback={closePostModal} />
                </DialogContent>
            </Dialog>

            <Dialog
                open={accountModal}
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