"""Convert the white-background journeyLogo.jpeg into a transparent-background PNG.

The ink is keyed to black with alpha = darkness, so the white background drops
out (anti-aliased). The result can be tinted white on dark surfaces with a CSS
`invert()` filter — no blend modes / no visible box on any background.
"""
import os

from PIL import Image

ICONS = os.path.join(os.path.dirname(__file__), "..", "public", "icons")
src = os.path.join(ICONS, "journeyLogo.jpeg")
dst = os.path.join(ICONS, "journeyLogo.png")

lum = Image.open(src).convert("L")  # luminance
# White bg (high luminance) -> transparent; dark ink -> opaque. Clamp the very
# light values to fully transparent so no faint JPEG haze remains.
alpha = lum.point(lambda p: 0 if p > 235 else 255 - p)
zero = Image.new("L", lum.size, 0)  # pure black ink channels
rgba = Image.merge("RGBA", (zero, zero, zero, alpha))
rgba.save(dst)
print("wrote", dst, rgba.size)
