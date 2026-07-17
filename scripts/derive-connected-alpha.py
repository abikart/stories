#!/usr/bin/env python3
"""Derive a native-alpha VP9 WebM from a white-matte story video.

Only neutral near-white pixels connected to the frame boundary become
transparent. Disconnected highlights and pale details inside the illustration
remain opaque. Frames stream between ffmpeg processes, so the compiler does not
materialize a large temporary image sequence.
"""

from __future__ import annotations

import argparse
import json
import subprocess
import sys
from fractions import Fraction
from pathlib import Path

import numpy as np
from scipy import ndimage


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("input", type=Path)
    parser.add_argument("output", type=Path)
    parser.add_argument("--floor", type=int, default=238)
    parser.add_argument("--chroma", type=int, default=18)
    parser.add_argument("--feather", type=float, default=2.25)
    parser.add_argument("--crf", type=int, default=30)
    return parser.parse_args()


def run_json(command: list[str]) -> dict:
    result = subprocess.run(command, check=True, capture_output=True, text=True)
    return json.loads(result.stdout)


def read_exact(stream, size: int) -> bytes:
    chunks: list[bytes] = []
    remaining = size
    while remaining:
        chunk = stream.read(remaining)
        if not chunk:
            break
        chunks.append(chunk)
        remaining -= len(chunk)
    return b"".join(chunks)


def alpha_for_frame(
    rgb: np.ndarray,
    floor: int,
    chroma: int,
    feather: float,
) -> np.ndarray:
    minimum = rgb.min(axis=2)
    spread = rgb.max(axis=2) - minimum
    neutral_white = (minimum >= floor) & (spread <= chroma)

    labels, _ = ndimage.label(
        neutral_white,
        structure=np.array([[0, 1, 0], [1, 1, 1], [0, 1, 0]], dtype=np.uint8),
    )
    border_labels = np.unique(np.concatenate((
        labels[0, :], labels[-1, :], labels[:, 0], labels[:, -1],
    )))
    border_labels = border_labels[border_labels != 0]
    connected_matte = np.isin(labels, border_labels) if border_labels.size else np.zeros_like(neutral_white)

    if feather <= 0:
        return np.where(connected_matte, 0, 255).astype(np.uint8)

    distance_inside_art = ndimage.distance_transform_edt(~connected_matte)
    return np.clip(distance_inside_art * (255.0 / feather), 0, 255).astype(np.uint8)


def main() -> None:
    args = parse_args()
    if not args.input.is_file():
        raise SystemExit(f"input not found: {args.input}")
    if not 0 <= args.floor <= 255 or not 0 <= args.chroma <= 255:
        raise SystemExit("--floor and --chroma must be in 0..255")
    if args.feather < 0:
        raise SystemExit("--feather must be non-negative")

    probe = run_json([
        "ffprobe", "-v", "error", "-select_streams", "v:0",
        "-show_entries", "stream=width,height,avg_frame_rate,nb_frames:format=duration",
        "-of", "json", str(args.input),
    ])
    stream = probe["streams"][0]
    width = int(stream["width"])
    height = int(stream["height"])
    frame_rate = Fraction(stream["avg_frame_rate"])
    fps = float(frame_rate)
    estimated_frames = int(stream.get("nb_frames") or round(float(probe["format"]["duration"]) * fps))
    frame_bytes = width * height * 3

    args.output.parent.mkdir(parents=True, exist_ok=True)
    decoder = subprocess.Popen([
        "ffmpeg", "-v", "error", "-i", str(args.input),
        "-f", "rawvideo", "-pix_fmt", "rgb24", "pipe:1",
    ], stdout=subprocess.PIPE)
    encoder = subprocess.Popen([
        "ffmpeg", "-y", "-v", "error",
        "-f", "rawvideo", "-pix_fmt", "rgba",
        "-s:v", f"{width}x{height}", "-r", str(frame_rate), "-i", "pipe:0",
        "-an", "-c:v", "libvpx-vp9", "-pix_fmt", "yuva420p",
        "-b:v", "0", "-crf", str(args.crf), "-deadline", "good",
        "-cpu-used", "4", "-row-mt", "1", "-auto-alt-ref", "0",
        "-metadata:s:v:0", "alpha_mode=1", str(args.output),
    ], stdin=subprocess.PIPE)

    if decoder.stdout is None or encoder.stdin is None:
        raise SystemExit("failed to create ffmpeg pipes")

    frame_index = 0
    alpha_total = 0
    try:
        while True:
            payload = read_exact(decoder.stdout, frame_bytes)
            if not payload:
                break
            if len(payload) != frame_bytes:
                raise RuntimeError(f"short frame {frame_index}: {len(payload)} of {frame_bytes} bytes")
            rgb = np.frombuffer(payload, dtype=np.uint8).reshape((height, width, 3))
            alpha = alpha_for_frame(rgb, args.floor, args.chroma, args.feather)
            alpha_total += int(np.count_nonzero(alpha < 255))
            rgba = np.empty((height, width, 4), dtype=np.uint8)
            rgba[:, :, :3] = rgb
            rgba[:, :, 3] = alpha
            encoder.stdin.write(rgba.tobytes())
            frame_index += 1
            if frame_index % 24 == 0 or frame_index == estimated_frames:
                print(f"{frame_index}/{estimated_frames} frames", file=sys.stderr)
    finally:
        decoder.stdout.close()
        encoder.stdin.close()

    decoder_status = decoder.wait()
    encoder_status = encoder.wait()
    if decoder_status or encoder_status:
        raise SystemExit(f"ffmpeg failed: decoder={decoder_status}, encoder={encoder_status}")
    if frame_index == 0:
        raise SystemExit("no frames decoded")

    pixels = frame_index * width * height
    print(json.dumps({
        "input": str(args.input),
        "output": str(args.output),
        "width": width,
        "height": height,
        "frameRate": str(frame_rate),
        "frames": frame_index,
        "floor": args.floor,
        "chroma": args.chroma,
        "feather": args.feather,
        "pixelsWithDerivedAlphaPercent": round(alpha_total * 100 / pixels, 3),
    }, indent=2))


if __name__ == "__main__":
    main()
