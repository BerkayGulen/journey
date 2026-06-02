"""Playwright drive: exercise the new right-sidebar semester spine + history view."""
import os
import sys
from playwright.sync_api import sync_playwright

OUT = os.path.join(os.path.dirname(__file__), "shots")
os.makedirs(OUT, exist_ok=True)

REDUCED = "--reduced" in sys.argv
PREFIX = "hr" if REDUCED else "h"


def shot(page, name):
    path = os.path.join(OUT, name)
    page.screenshot(path=path)
    print("shot:", path)


with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(
        viewport={"width": 1440, "height": 810},
        reduced_motion="reduce" if REDUCED else "no-preference",
    )
    page.goto("http://localhost:3000", wait_until="networkidle")
    page.wait_for_timeout(800)

    W = 1440
    # Sidebar is full height (8 strips ≈ 100px each). Active semesters are the
    # top 3 (~y 50); locked ones below (~y 700).
    ACTIVE_Y = 50
    LOCKED_Y = 700

    # 1. Welcome — collapsed right strips (lower band: 3 vivid + 5 muted)
    shot(page, f"{PREFIX}01_welcome_spine.png")

    # 2. Hover the right sidebar -> expands left; hover an ACTIVE strip
    page.mouse.move(W - 4, ACTIVE_Y)
    page.wait_for_timeout(800)
    shot(page, f"{PREFIX}02_spine_active_label.png")

    # 3. Hover a LOCKED strip -> "Locked" label
    page.mouse.move(W - 4, LOCKED_Y)
    page.wait_for_timeout(700)
    shot(page, f"{PREFIX}03_spine_locked_label.png")

    # 4. Click the first active semester -> history detail
    page.mouse.move(W - 4, ACTIVE_Y)
    page.wait_for_timeout(400)
    page.mouse.click(W - 4, ACTIVE_Y)
    page.wait_for_timeout(1200)
    shot(page, f"{PREFIX}04_history_detail.png")

    # 5. Click a course column -> widen + breakdown
    page.mouse.click(400, 400)
    page.wait_for_timeout(900)
    shot(page, f"{PREFIX}05_column_expanded.png")

    # 6. Escape -> back to welcome
    page.keyboard.press("Escape")
    page.wait_for_timeout(900)
    shot(page, f"{PREFIX}06_back_to_welcome.png")

    # 7. Re-open and use the "← Journey" wordmark to go back
    page.mouse.move(W - 4, ACTIVE_Y)
    page.wait_for_timeout(500)
    page.mouse.click(W - 4, ACTIVE_Y)
    page.wait_for_timeout(1100)
    page.get_by_text("← Journey", exact=True).click()
    page.wait_for_timeout(900)
    shot(page, f"{PREFIX}07_wordmark_back.png")

    browser.close()
    print("done")
