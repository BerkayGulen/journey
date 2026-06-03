"""Convert the white-background logo.jpg (round Journey mark) into a transparent PNG.

Same keying as make_logo_png.py: ink -> black with alpha = darkness, white bg
drops out (anti-aliased). The result tints white on dark surfaces via CSS
invert() — no blend modes, no visible box. Used by components/JourneyMark.tsx.
"""
import os

from PIL import Image

ICONS = os.path.join(os.path.dirname(__file__), "..", "public", "icons")
src = os.path.join(ICONS, "logo.jpg")
dst = os.path.join(ICONS, "logo.png")

lum = Image.open(src).convert("L")  # luminance
alpha = lum.point(lambda p: 0 if p > 235 else 255 - p)
zero = Image.new("L", lum.size, 0)  # pure black ink channels
rgba = Image.merge("RGBA", (zero, zero, zero, alpha))
rgba.save(dst)
print("wrote", dst, rgba.size)
