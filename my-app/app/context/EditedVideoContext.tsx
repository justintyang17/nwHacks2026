"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type SubtitleSegment = {
  start: number;
  end: number;
  text: string;
};

export type VideoMeta = {
  // URL to the final edited video (blurred/original) that should be played.
  url: string;
  // Optional transcript & subtitles for this clip.
  transcript?: string;
  subtitles?: SubtitleSegment[];
  language?: string;
};

type EditedVideoContextType = {
  editedVideos: VideoMeta[];
  addEditedVideo: (meta: VideoMeta) => void;
  removeEditedVideo: (index: number) => void;
  clearEditedVideos: () => void;
};

const EditedVideoContext = createContext<EditedVideoContextType | undefined>(
  undefined
);

export const EditedVideoProvider = ({ children }: { children: ReactNode }) => {
  const [editedVideos, setEditedVideos] = useState<VideoMeta[]>([]);

  const addEditedVideo = (meta: VideoMeta) => {
    setEditedVideos((prev) => [...prev, meta]);
  };

  const removeEditedVideo = (index: number) => {
    setEditedVideos((prev) => prev.filter((_, i) => i !== index));
  };

  const clearEditedVideos = () => setEditedVideos([]);

  return (
    <EditedVideoContext.Provider
      value={{ editedVideos, addEditedVideo, removeEditedVideo, clearEditedVideos }}
    >
      {children}
    </EditedVideoContext.Provider>
  );
};

export const useEditedVideoContext = () => {
  const context = useContext(EditedVideoContext);
  if (!context)
    throw new Error("useEditedVideoContext must be used within EditedVideoProvider");
  return context;
};