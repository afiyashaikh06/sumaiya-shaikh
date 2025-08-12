#!/usr/bin/env python3
import argparse
import sys
from pathlib import Path
from typing import Optional, Tuple

import cv2
import numpy as np


def parse_hex_color(color_str: str) -> Tuple[int, int, int]:
    s = color_str.strip().lstrip('#')
    if len(s) == 3:
        s = ''.join([c * 2 for c in s])
    if len(s) != 6:
        raise ValueError(f"Invalid color string: {color_str}")
    r = int(s[0:2], 16)
    g = int(s[2:4], 16)
    b = int(s[4:6], 16)
    return (b, g, r)  # OpenCV uses BGR


def load_image(path: Path) -> np.ndarray:
    img = cv2.imread(str(path), cv2.IMREAD_COLOR)
    if img is None:
        raise FileNotFoundError(f"Could not read image: {path}")
    return img


def save_image(path: Path, img: np.ndarray) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    if not cv2.imwrite(str(path), img):
        raise IOError(f"Failed to write image to: {path}")


def detect_largest_face_rect(image_bgr: np.ndarray) -> Optional[Tuple[int, int, int, int]]:
    gray = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2GRAY)
    # Use built-in OpenCV Haar cascade
    cascade_path = cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
    face_cascade = cv2.CascadeClassifier(cascade_path)
    faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, flags=cv2.CASCADE_SCALE_IMAGE, minSize=(40, 40))
    if len(faces) == 0:
        return None
    # Choose the largest face by area
    x, y, w, h = max(faces, key=lambda r: r[2] * r[3])
    return (x, y, w, h)


def create_face_ellipse_mask(image_shape: Tuple[int, int, int], face_rect: Optional[Tuple[int, int, int, int]]) -> np.ndarray:
    h, w = image_shape[:2]
    mask = np.zeros((h, w), dtype=np.uint8)

    if face_rect is None:
        # Fallback: center ellipse if face not detected
        cx, cy = w // 2, int(h * 0.42)
        axes = (int(w * 0.18), int(h * 0.24))
        angle = 0
    else:
        x, y, fw, fh = face_rect
        cx, cy = x + fw // 2, y + int(fh * 0.55)
        axes = (int(fw * 0.50), int(fh * 0.65))
        angle = 0

    cv2.ellipse(mask, (cx, cy), axes, angle, 0, 360, 255, thickness=-1)
    return mask


def compute_average_color_under_mask(image_bgr: np.ndarray, mask: np.ndarray) -> Tuple[int, int, int]:
    masked = cv2.bitwise_and(image_bgr, image_bgr, mask=mask)
    num_pixels = int(np.count_nonzero(mask))
    if num_pixels == 0:
        # Default soft warm tone
        return (200, 210, 220)
    sum_bgr = masked.reshape(-1, 3)[mask.reshape(-1) > 0].mean(axis=0)
    bgr = tuple(int(c) for c in sum_bgr)
    # Slightly brighten for a clean flat look
    bgr = tuple(min(255, int(c * 1.05 + 8)) for c in bgr)
    return bgr  # type: ignore


def apply_flat_face_fill(image_bgr: np.ndarray, mask: np.ndarray, color_bgr: Tuple[int, int, int]) -> np.ndarray:
    colored = np.full_like(image_bgr, color_bgr, dtype=np.uint8)
    face_flat = cv2.bitwise_and(colored, colored, mask=mask)
    inv_mask = cv2.bitwise_not(mask)
    background = cv2.bitwise_and(image_bgr, image_bgr, mask=inv_mask)
    result = cv2.add(background, face_flat)
    return result


def apply_blur_face(image_bgr: np.ndarray, mask: np.ndarray, sigma: float = 25.0) -> np.ndarray:
    # Create a blurred version and blend with mask
    ksize = 0  # Let OpenCV pick based on sigma
    blurred = cv2.GaussianBlur(image_bgr, (ksize, ksize), sigmaX=sigma, sigmaY=sigma)
    face_blur = cv2.bitwise_and(blurred, blurred, mask=mask)
    inv_mask = cv2.bitwise_not(mask)
    background = cv2.bitwise_and(image_bgr, image_bgr, mask=inv_mask)
    result = cv2.add(background, face_blur)
    return result


def kmeans_posterize(image_bgr: np.ndarray, k: int = 6, attempts: int = 3) -> np.ndarray:
    small = cv2.resize(image_bgr, (0, 0), fx=0.5, fy=0.5, interpolation=cv2.INTER_AREA)
    Z = small.reshape((-1, 3)).astype(np.float32)
    criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 12, 1.0)
    _, labels, centers = cv2.kmeans(Z, k, None, criteria, attempts, cv2.KMEANS_PP_CENTERS)
    centers = np.uint8(centers)
    res = centers[labels.flatten()]
    posterized_small = res.reshape(small.shape)
    posterized = cv2.resize(posterized_small, (image_bgr.shape[1], image_bgr.shape[0]), interpolation=cv2.INTER_NEAREST)
    return posterized


def process_image(
    input_path: Path,
    output_path: Path,
    mode: str = 'flat',
    color: Optional[str] = None,
    posterize_background: bool = False,
    blur_sigma: float = 25.0,
) -> None:
    image = load_image(input_path)
    face_rect = detect_largest_face_rect(image)
    mask = create_face_ellipse_mask(image.shape, face_rect)

    if color is None or color.lower() == 'auto':
        color_bgr = compute_average_color_under_mask(image, mask)
    else:
        color_bgr = parse_hex_color(color)

    if mode == 'flat':
        result = apply_flat_face_fill(image, mask, color_bgr)
    elif mode == 'blur':
        result = apply_blur_face(image, mask, sigma=blur_sigma)
    else:
        raise ValueError("mode must be one of: 'flat', 'blur'")

    if posterize_background:
        inv_mask = cv2.bitwise_not(mask)
        poster = kmeans_posterize(result, k=6)
        bg_poster = cv2.bitwise_and(poster, poster, mask=inv_mask)
        fg_face = cv2.bitwise_and(result, result, mask=mask)
        result = cv2.add(bg_poster, fg_face)

    save_image(output_path, result)


def build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(description="Create faceless-art style images by removing facial features.")
    p.add_argument('-i', '--input', required=True, type=Path, help='Path to input image')
    p.add_argument('-o', '--output', required=True, type=Path, help='Path to output image')
    p.add_argument('--mode', choices=['flat', 'blur'], default='flat', help="Style: 'flat' solid color fill, or 'blur' Gaussian blur of face")
    p.add_argument('--color', default='auto', help="Hex color for face fill (e.g. '#f2d3b5'). Use 'auto' to infer from image")
    p.add_argument('--posterize-background', action='store_true', help='Posterize background for a stylized look')
    p.add_argument('--blur-sigma', type=float, default=25.0, help='Sigma for blur when mode=blur')
    return p


def main(argv: Optional[list] = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)

    try:
        process_image(
            input_path=args.input,
            output_path=args.output,
            mode=args.mode,
            color=args.color,
            posterize_background=args.posterize_background,
            blur_sigma=args.blur_sigma,
        )
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        return 1
    return 0


if __name__ == '__main__':
    raise SystemExit(main())