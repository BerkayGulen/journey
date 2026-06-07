"""Verify the General Looks revisions: ID 208 emerald, argument-mode opacity,
collapsible chat sidebar (three-line handle → open on click)."""
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
    page = browser.new_page(viewport={"width": 1440, "height": 810})
    page.goto("http://localhost:3000", wait_until="networkidle")
    page.wait_for_timeout(800)

    # ID 208 emerald: expand the left sidebar to reveal the course blocks.
    page.mouse.move(30, 400)
    page.wait_for_timeout(900)
    shot(page, "rev_01_left_sidebar_id208.png")

    # Into the Private Chat.
    page.mouse.click(40, 400)
    page.wait_for_timeout(700)
    page.get_by_text("Private Chat", exact=True).click()
    page.wait_for_timeout(1400)

    ta = page.get_by_placeholder("everything in my head right now…")
    ta.click()
    ta.type(
        "a vacuum cleaner. the cord getting in the way. how my grandmother "
        "couldn't use it because of her back.",
        delay=2,
    )
    page.keyboard.press("Enter")
    page.wait_for_timeout(8000)

    # A second turn so there are several bubbles to judge opacity on.
    inp = page.get_by_placeholder("your thinking…")
    inp.click()
    inp.type("the cord. it physically limits where i can clean.", delay=2)
    page.keyboard.press("Enter")
    page.wait_for_timeout(7000)

    # Flip to ARGUMENT mode — check bubble + blob opacity (sidebar still closed).
    page.get_by_text("start argument", exact=True).click()
    page.wait_for_timeout(2000)
    shot(page, "rev_02_argument_closed_sidebar.png")

    inp = page.get_by_placeholder("your thinking…")
    inp.click()
    inp.type("because the cord is the most obvious flaw.", delay=2)
    page.keyboard.press("Enter")
    page.wait_for_timeout(7000)
    shot(page, "rev_03_argument_bubbles.png")

    # Open the collapsed sidebar via the three-line handle.
    page.get_by_label("Open milestones").click()
    page.wait_for_timeout(900)
    page.mouse.move(1380, 220)
    page.wait_for_timeout(700)
    shot(page, "rev_04_sidebar_open_argument.png")

    # Close it again → back to three lines.
    page.get_by_label("Close milestones").click()
    page.wait_for_timeout(700)
    shot(page, "rev_05_sidebar_closed_again.png")

    # Back to reflection, open sidebar on the light background.
    page.get_by_text("return to reflection", exact=True).click()
    page.wait_for_timeout(1800)
    page.get_by_label("Open milestones").click()
    page.wait_for_timeout(700)
    page.mouse.move(1380, 220)
    page.wait_for_timeout(700)
    shot(page, "rev_06_sidebar_open_socratic.png")

    browser.close()
    print("done")
