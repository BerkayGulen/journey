"""Verify the Private Chat top-right course label (code + name + 'Private Chat'),
that it hides when Milestones opens, and that it stays legible on the dark
adversarial background. Reduced motion freezes the carousel: ID202=202, FFD202=67.
"""
import os
from playwright.sync_api import sync_playwright

OUT = os.path.join(os.path.dirname(__file__), "shots")


def shot(page, name):
    path = os.path.join(OUT, "pcl_" + name)
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

    # ID 202 recorded — label top-right + handle below it.
    open_private(page, 202)
    shot(page, "202_label.png")
    # Open Milestones → label should hide, panel takes the right column.
    page.get_by_label("Open milestones").click()
    page.wait_for_timeout(600)
    shot(page, "202_milestones_open.png")

    # FFD 202 live → idea-dump → converse → adversarial: label legible on dark bg.
    open_private(page, 67)
    ta = page.get_by_placeholder("everything in my head right now…")
    ta.click()
    ta.type("the cord on a vacuum cleaner keeps getting in the way.", delay=2)
    page.keyboard.press("Enter")
    page.wait_for_timeout(6000)
    page.get_by_text("start argument", exact=True).click()
    page.wait_for_timeout(1800)
    shot(page, "ffd_adversarial_label.png")

    browser.close()
    print("done")
