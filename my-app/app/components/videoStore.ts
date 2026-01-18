"use client";

// Simple in-memory store for the selected video file so that
// the edit page can access it after navigation.

let selectedVideoFile: File | null = null;

export function setSelectedVideoFile(file: File | null) {
  selectedVideoFile = file;
}

export function getSelectedVideoFile(): File | null {
  return selectedVideoFile;
}


