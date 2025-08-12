# Faceless Art Tool

Create a faceless-art style image from a photo by replacing the facial features with a clean, flat fill or a soft blur.

## Setup

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## Usage

```bash
python faceless_art.py -i input.jpg -o output.jpg --mode flat --color auto --posterize-background
```

Options:
- `--mode`:
  - `flat`: fill the face with a solid color (default)
  - `blur`: blur the facial region
- `--color`:
  - `auto`: infer a pleasant color from the face region (default)
  - or supply a hex, e.g. `#f2d3b5`
- `--posterize-background`: apply a stylized color reduction to the background
- `--blur-sigma`: blur strength when `--mode blur` is used

If no face is detected, the tool gracefully falls back to an ellipse near the top-center of the image.

