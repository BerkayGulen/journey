"""Playwright drive at a phone viewport: check the app stays usable (responsive)."""
import os
from playwright.sync_api import sync_playwright

OUT = os.path.join(os.path.dirname(__file__), "shots")
os.makedirs(OUT, exist_ok=True)

W, H = 390, 844  # iPhone-ish portrait


def shot(page, name):
    path = os.path.join(OUT, name)
    page.screenshot(path=path)
    print("shot:", path)


with sync_playwright() as p:
    browser = p.chromium.launch()
    ctx = browser.new_context(
        viewport={"width": W, "height": H}, has_touch=True, is_mobile=True
    )
    page = ctx.new_page()
    page.goto("http://localhost:3000", wait_until="networkidle")
    page.wait_for_timeout(900)

    # 1. Welcome — sidebars + wordmark should fit, no horizontal overflow
    shot(page, "m01_welcome.png")
    scroll_w = page.evaluate("document.documentElement.scrollWidth")
    print("welcome scrollWidth vs viewport:", scroll_w, "/", W)
    print("hover:none ->", page.evaluate("window.matchMedia('(hover: none)').matches"))

    # 2a. First tap on the right edge -> sidebar EXPANDS + reveals labels
    page.touchscreen.tap(W - 6, 60)
    page.wait_for_timeout(700)
    shot(page, "m02a_history_expanded.png")
    # 2b. Second tap on the (now labelled) active strip -> history detail
    page.touchscreen.tap(W - 30, 60)
    page.wait_for_timeout(1200)
    shot(page, "m02_history.png")
    print("history scrollWidth:", page.evaluate("document.documentElement.scrollWidth"))

    # 3. Tap a course column in the history detail -> expand breakdown
    page.touchscreen.tap(60, 420)
    page.wait_for_timeout(900)
    shot(page, "m03_history_col.png")

    # 4. Back to welcome
    page.keyboard.press("Escape")
    page.wait_for_timeout(900)

    # 5a. First tap on the left edge -> carousel EXPANDS + reveals labels
    page.touchscreen.tap(20, 420)
    page.wait_for_timeout(700)
    shot(page, "m04a_left_expanded.png")
    # 5b. Second tap on a labelled block -> split overlay
    page.touchscreen.tap(80, 420)
    page.wait_for_timeout(900)
    shot(page, "m04_split.png")

    # 6. Choose Private Chat -> idea dump
    try:
        page.get_by_text("Private Chat", exact=True).click(timeout=4000)
        page.wait_for_timeout(1500)
        shot(page, "m05_ideadump.png")

        # 7. Type a dump + submit -> conversation (check no sidebar overlap)
        ta = page.get_by_placeholder("everything in my head right now…")
        ta.click()
        ta.type("a vacuum cleaner. the cord. the noise. emptying the bin.", delay=4)
        page.keyboard.press("Enter")
        page.wait_for_timeout(7000)
        shot(page, "m06_conversation.png")
        print("conversation scrollWidth:", page.evaluate("document.documentElement.scrollWidth"))
    except Exception as e:
        print("workspace step skipped:", e)

    ctx.close()
    browser.close()
    print("done")
