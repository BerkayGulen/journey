"""Verify the studio vs non-studio Classroom split.

Reduced motion freezes the sidebar carousel so courses sit at known y positions
(135px blocks from the top): FFD202=67 · ID202=202 · ID204=337 · ID208=472 ·
GEEC207=607 · ITL202=742. The app bar prints the selected course code so each
screenshot is self-identifying.
"""
import os
from playwright.sync_api import sync_playwright

OUT = os.path.join(os.path.dirname(__file__), "shots")
os.makedirs(OUT, exist_ok=True)


def shot(page, name):
    path = os.path.join(OUT, "ct_" + name)
    page.screenshot(path=path)
    print("shot:", path)


def enter_classroom(page, course_y):
    """From the welcome screen, pick the course at course_y → Classroom Chat."""
    page.goto("http://localhost:3000", wait_until="networkidle")
    page.wait_for_timeout(500)
    page.mouse.move(12, course_y)          # hover → expand + grow target block
    page.wait_for_timeout(400)
    page.mouse.click(12, course_y)         # select that course
    page.wait_for_timeout(500)
    page.get_by_text("Classroom Chat", exact=True).click()
    page.wait_for_timeout(900)


with sync_playwright() as p:
    browser = p.chromium.launch()
    context = browser.new_context(
        viewport={"width": 1440, "height": 810}, reduced_motion="reduce"
    )
    page = context.new_page()

    # ── ID 204 (non-studio): Announcements default · Assignments · Selected Works
    enter_classroom(page, 337)
    shot(page, "204_01_announcements.png")        # default layer
    page.get_by_text("Assignments", exact=True).click()
    page.wait_for_timeout(700)
    shot(page, "204_02_assignments.png")          # accordion, first open
    page.get_by_text("Assignment 2", exact=True).click()
    page.wait_for_timeout(500)
    shot(page, "204_03_assignment2_expanded.png")
    page.get_by_text("Selected Works", exact=True).click()
    page.wait_for_timeout(700)
    shot(page, "204_04_selected_placeholders.png")  # placeholder covers
    page.get_by_text("Exhibition Board", exact=True).first.click()
    page.wait_for_timeout(700)
    shot(page, "204_05_selected_discussion.png")    # imageless work → note + thread

    # ── ID 202 (studio): unchanged — Studio Wall default
    enter_classroom(page, 202)
    page.mouse.move(720, 440)
    page.wait_for_timeout(700)
    shot(page, "202_01_studio_wall.png")           # nav must read Studio Wall

    # ── FFD 202 (non-studio): Selected Works empty state
    enter_classroom(page, 67)
    shot(page, "ffd_01_announcements.png")
    page.get_by_text("Selected Works", exact=True).click()
    page.wait_for_timeout(700)
    shot(page, "ffd_02_selected_empty.png")        # "Nothing posted yet."

    browser.close()
    print("done")
