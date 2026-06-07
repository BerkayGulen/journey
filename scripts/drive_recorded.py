"""Verify the ID 202 read-only recorded Private Chat (and that others still
open the idea-dump). Reduced motion freezes the carousel: ID202=202, FFD202=67.
"""
import os
from playwright.sync_api import sync_playwright

OUT = os.path.join(os.path.dirname(__file__), "shots")


def shot(page, name):
    path = os.path.join(OUT, "rec_" + name)
    page.screenshot(path=path)
    print("shot:", path)


def open_private(page, course_y):
    page.goto("http://localhost:3000", wait_until="networkidle")
    page.wait_for_timeout(500)
    page.mouse.move(12, course_y)
    page.wait_for_timeout(400)
    page.mouse.click(12, course_y)
    page.wait_for_timeout(500)
    page.get_by_text("Private Chat", exact=True).click()
    page.wait_for_timeout(1200)


with sync_playwright() as p:
    browser = p.chromium.launch()
    context = browser.new_context(
        viewport={"width": 1440, "height": 810}, reduced_motion="reduce"
    )
    page = context.new_page()

    # ── ID 202 → read-only recorded transcript ──────────────────────────────
    open_private(page, 202)
    shot(page, "202_01_top.png")                 # caption + first turns, no input
    has_input = page.get_by_placeholder("your thinking…").count()
    print("ID202 input boxes (expect 0):", has_input)

    # Scroll down inside the transcript to reveal a milestone marker.
    page.mouse.move(720, 400)
    page.mouse.wheel(0, 1600)
    page.wait_for_timeout(600)
    shot(page, "202_02_scrolled_milestone.png")

    # Mode toggle remains active → clicking "start argument" flashes a note.
    page.get_by_text("start argument", exact=True).click()
    page.wait_for_timeout(500)
    shot(page, "202_03_adversarial_note.png")

    # ── FFD 202 → still the idea-dump (unchanged) ───────────────────────────
    open_private(page, 67)
    shot(page, "ffd_01_ideadump.png")
    has_dump = page.get_by_placeholder("everything in my head right now…").count()
    print("FFD202 idea-dump boxes (expect 1):", has_dump)

    browser.close()
    print("done")
