#!/usr/bin/env python3
"""Normalize a border-connected neutral near-white raster matte to #FFFFFF."""

from __future__ import annotations

import argparse
from collections import deque
from pathlib import Path

from PIL import Image


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Replace only border-connected neutral near-white pixels with pure "
            "white, preserving disconnected highlights inside the artwork."
        )
    )
    parser.add_argument("input", type=Path)
    parser.add_argument("output", type=Path)
    parser.add_argument(
        "--floor",
        type=int,
        default=245,
        help="Minimum RGB channel value considered near-white (default: 245)",
    )
    parser.add_argument(
        "--chroma",
        type=int,
        default=12,
        help="Maximum channel spread considered neutral (default: 12)",
    )
    return parser.parse_args()


def is_neutral_near_white(pixel: tuple[int, int, int], floor: int, chroma: int) -> bool:
    return min(pixel) >= floor and max(pixel) - min(pixel) <= chroma


def normalize(input_path: Path, output_path: Path, floor: int, chroma: int) -> int:
    with Image.open(input_path) as source:
        image = source.convert("RGB")

    width, height = image.size
    pixels = image.load()
    queue: deque[tuple[int, int]] = deque()
    visited = bytearray(width * height)

    def enqueue(x: int, y: int) -> None:
        index = y * width + x
        if visited[index]:
            return
        visited[index] = 1
        if is_neutral_near_white(pixels[x, y], floor, chroma):
            queue.append((x, y))

    for x in range(width):
        enqueue(x, 0)
        enqueue(x, height - 1)
    for y in range(1, height - 1):
        enqueue(0, y)
        enqueue(width - 1, y)

    changed = 0
    while queue:
        x, y = queue.popleft()
        if pixels[x, y] != (255, 255, 255):
            pixels[x, y] = (255, 255, 255)
            changed += 1

        for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
            if 0 <= nx < width and 0 <= ny < height:
                enqueue(nx, ny)

    output_path.parent.mkdir(parents=True, exist_ok=True)
    image.save(output_path, format="PNG", optimize=True)
    return changed


def main() -> None:
    args = parse_args()
    if not 0 <= args.floor <= 255:
        raise SystemExit("--floor must be between 0 and 255")
    if not 0 <= args.chroma <= 255:
        raise SystemExit("--chroma must be between 0 and 255")

    changed = normalize(args.input, args.output, args.floor, args.chroma)
    print(f"normalized {changed} pixels -> {args.output}")


if __name__ == "__main__":
    main()
