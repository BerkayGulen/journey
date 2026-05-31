"""Verify the workspace under prefers-reduced-motion + the reset-to-welcome path."""
import os
from playwright.sync_api import sync_playwright

OUT = os.path.join(os.path.dirname(__file__), "shots")
os.makedirs(OUT, exist_ok=True)


def shot(page, name):
    path = os.path.join(OUT, name)
    page.screenshot(path=path)
    print("shot:", path)


with sync_playwright() as p:
    browser = p.chromium.launch()
    ctx = browser.new_context(
        viewport={"width": 1440, "height": 810}, reduced_motion="reduce"
    )
    page = ctx.new_page()
    page.goto("http://localhost:3000", wait_until="networkidle")
    page.wait_for_timeout(600)

    # Into Private Chat
    page.mouse.click(40, 400)
    page.wait_for_timeout(400)
    page.get_by_text("Private Chat", exact=True).click()
    page.wait_for_timeout(600)

    # Brain-dump (reduced motion → reply arrives whole, not streamed)
    ta = page.get_by_placeholder("everything in my head right now…")
    ta.click()
    ta.type("a vacuum cleaner. the cord. the noise. forgetting to empty it.", delay=2)
    page.keyboard.press("Enter")
    page.wait_for_timeout(1500)
    shot(page, "r1_conversing.png")

    # Adversarial flip should be instant under reduced motion
    page.get_by_text("start argument", exact=True).click()
    page.wait_for_timeout(600)
    shot(page, "r2_adversarial.png")

    # Reset to welcome via Escape
    page.keyboard.press("Escape")
    page.wait_for_timeout(700)
    shot(page, "r3_welcome.png")

    browser.close()
    print("done")
