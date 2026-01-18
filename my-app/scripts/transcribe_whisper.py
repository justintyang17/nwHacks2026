import sys
import json

import whisper


def main() -> None:
    # Ensure stdout uses UTF-8 so that all Unicode characters survive
    # when piping output back to Node on Windows and other platforms.
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        # Older Python versions may not support reconfigure; ignore.
        pass

    if len(sys.argv) < 2:
        print(
            "Usage: python scripts/transcribe_whisper.py <input_video_path> [target_lang]",
            file=sys.stderr,
        )
        sys.exit(1)

    input_path = sys.argv[1]

    # Optional: desired subtitle language (e.g. "en" for English). For now we
    # only use this to enable Whisper's built‑in translate‑to‑English mode.
    target_lang = sys.argv[2].strip().lower() if len(sys.argv) >= 3 else None

    # Load a Whisper model; "small" is a reasonable tradeoff between speed and quality.
    # You can change this to "base" or "medium" depending on your hardware.
    model = whisper.load_model("small")

    # Whisper will handle extracting audio from the video if ffmpeg is installed.
    # If target_lang is English, use translate mode so non‑English speech is
    # translated to English while preserving timestamps.
    if target_lang in ("en", "eng", "english"):
        result = model.transcribe(input_path, task="translate", language="en")
    else:
        result = model.transcribe(input_path)

    segments = []
    for seg in result.get("segments", []):
        segments.append(
            {
                "start": float(seg.get("start", 0.0)),
                "end": float(seg.get("end", 0.0)),
                "text": seg.get("text", "").strip(),
            }
        )

    print(json.dumps({"segments": segments}, ensure_ascii=False))


if __name__ == "__main__":
    main()


