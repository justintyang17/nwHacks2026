import sys
from typing import List, Tuple

import cv2
from ultralytics import YOLO


BBox = Tuple[int, int, int, int]


def blur_faces_in_video(input_path: str, output_path: str) -> None:
    print("[blur_faces.py] Starting blur_faces_in_video")
    print(f"[blur_faces.py] Input: {input_path}")
    print(f"[blur_faces.py] Output: {output_path}")

    cap = cv2.VideoCapture(input_path)
    if not cap.isOpened():
        raise RuntimeError(f"Could not open input video: {input_path}")

    # Output video settings (same size/fps as input)
    fourcc = cv2.VideoWriter_fourcc(*"avc1")
    fps = cap.get(cv2.CAP_PROP_FPS) or 25.0
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))
    if not out.isOpened():
        raise RuntimeError(
            f"Could not open output video for writing: {output_path} "
            f"(fourcc='avc1', fps={fps}, size=({width}, {height}))"
        )

    # Load YOLO model once (small model for speed). This will download weights
    # on first use into the ultralytics cache (~few tens of MB).
    model = YOLO("yolov8n.pt")

    # Temporal smoothing: keep last faces for a few frames to avoid flicker
    last_faces: List[BBox] = []
    frames_since_last_detection = 0
    max_frames_keep = 5

    frame_index = 0

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        frame_index += 1

        # Run YOLO detection on this frame
        results = model(frame, verbose=False)
        faces: List[BBox] = []

        for r in results:
            if r.boxes is None:
                continue
            for box in r.boxes:
                # Only keep detections of the 'person' class (class 0 in COCO)
                if box.cls is not None:
                    cls_id = int(box.cls[0].item())
                    if cls_id != 0:
                        continue

                x1, y1, x2, y2 = box.xyxy[0].tolist()
                conf = float(box.conf[0].item())
                if conf < 0.5:
                    continue

                x1_i = max(0, int(x1))
                y1_i = max(0, int(y1))
                x2_i = min(width - 1, int(x2))
                y2_i = min(height - 1, int(y2))

                if x2_i <= x1_i or y2_i <= y1_i:
                    continue

                faces.append((x1_i, y1_i, x2_i - x1_i, y2_i - y1_i))

        if faces:
            last_faces = faces
            frames_since_last_detection = 0
            faces_to_blur = faces
        else:
            frames_since_last_detection += 1
            if last_faces and frames_since_last_detection <= max_frames_keep:
                faces_to_blur = last_faces
            else:
                faces_to_blur = []

        # Apply blur to head/face region only (upper part of the person box)
        for (x, y, w, h) in faces_to_blur:
            # Focus on the top part of the box (approximate head region)
            head_height = int(h * 0.5)  # top 50% of the box

            # Small expansion so we cover hair/edges but not full body
            expand_x = 0.15
            expand_y = 0.15

            pad_x = int(w * expand_x)
            pad_y = int(head_height * expand_y)

            x0 = max(0, x - pad_x)
            y0 = max(0, y - pad_y)
            x1 = min(width, x + w + pad_x)
            y1 = min(height, y + head_height + pad_y)

            face_roi = frame[y0:y1, x0:x1]
            if face_roi.size == 0:
                continue

            blurred_face = cv2.GaussianBlur(face_roi, (51, 51), 30)
            frame[y0:y1, x0:x1] = blurred_face

        out.write(frame)

        if frame_index % 30 == 0:
            print(f"[blur_faces.py] Processed frame {frame_index}")

    cap.release()
    out.release()
    print(f"[blur_faces.py] Finished. Total frames: {frame_index}")


if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python scripts/blur_faces.py input_video.mp4 output_video.mp4")
        sys.exit(1)

    blur_faces_in_video(sys.argv[1], sys.argv[2])


