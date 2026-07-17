#!/usr/bin/env python3
"""Normalize a border-connected raster matte to one declared solid color."""

from __future__ import annotations

import argparse
from collections import deque
from pathlib import Path

from PIL import Image


def parse_hex_color(value: str) -> tuple[int, int, int]:
    normalized = value.removeprefix("#")
    if len(normalized) != 6:
        raise argparse.ArgumentTypeError("matte color must be a six-digit hex value")
    try:
        return tuple(int(normalized[index : index + 2], 16) for index in (0, 2, 4))
    except ValueError as error:
        raise argparse.ArgumentTypeError("matte color must be a six-digit hex value") from error


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Replace only border-connected pixels near the declared story matte, "
            "preserving disconnected highlights inside the artwork."
        )
    )
    parser.add_argument("input", type=Path)
    parser.add_argument("output", type=Path)
    parser.add_argument(
        "--matte-color",
        type=parse_hex_color,
        default=parse_hex_color("#FFFFFF"),
        help="Exact output matte as six-digit hex (default: #FFFFFF)",
    )
    parser.add_argument(
        "--tolerance",
        type=int,
        default=10,
        help="Maximum per-channel distance from the matte (default: 10)",
    )
    return parser.parse_args()


def is_near_matte(
    pixel: tuple[int, int, int],
    matte: tuple[int, int, int],
    tolerance: int,
) -> bool:
    return max(abs(channel - target) for channel, target in zip(pixel, matte)) <= tolerance


def normalize(
    input_path: Path,
    output_path: Path,
    matte: tuple[int, int, int],
    tolerance: int,
) -> int:
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
        if is_near_matte(pixels[x, y], matte, tolerance):
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
        if pixels[x, y] != matte:
            pixels[x, y] = matte
            changed += 1

        for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
            if 0 <= nx < width and 0 <= ny < height:
                enqueue(nx, ny)

    output_path.parent.mkdir(parents=True, exist_ok=True)
    image.save(output_path, format="PNG", optimize=True)
    return changed


def main() -> None:
    args = parse_args()
    if not 0 <= args.tolerance <= 255:
        raise SystemExit("--tolerance must be between 0 and 255")

    changed = normalize(
        args.input,
        args.output,
        args.matte_color,
        args.tolerance,
    )
    matte_hex = "#" + "".join(f"{channel:02X}" for channel in args.matte_color)
    print(f"normalized {changed} pixels to {matte_hex} -> {args.output}")


if __name__ == "__main__":
    main()
