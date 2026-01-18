"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type VideoMeta = {
    file: File;
    url: string;
};

type OriginalVideoContextType = {
    originalVideos: VideoMeta[];
    addOriginalVideo: (file: File) => void;
    removeOriginalVideo: (index: number) => void;
    clearOriginalVideos: () => void;
};

const OriginalVideoContext = createContext<OriginalVideoContextType | undefined>(undefined);

export const OriginalVideoProvider = ({ children }: { children: ReactNode }) => {
    const [originalVideos, setOriginalVideos] = useState<VideoMeta[]>([]);

    const addOriginalVideo = (file: File) => {
        const url = URL.createObjectURL(file);
        setOriginalVideos((prev) => [...prev, { file, url }]);
    };

    const removeOriginalVideo = (index: number) => {
        setOriginalVideos((prev) => prev.filter((_, i) => i !== index));
    };

    const clearOriginalVideos = () => setOriginalVideos([]);

    return (
        <OriginalVideoContext.Provider
            value={{ originalVideos, addOriginalVideo, removeOriginalVideo, clearOriginalVideos }}
        >
            {children}
        </OriginalVideoContext.Provider>
    );
};

export const useOriginalVideoContext = () => {
    const context = useContext(OriginalVideoContext);
    if (!context) throw new Error("useOriginalVideoContext must be used within OriginalVideoProvider");
    return context;
};