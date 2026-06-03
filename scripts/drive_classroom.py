"""Playwright drive: welcome → Classroom (shared amplifier studio) flow.

Exercises the refinement update — darker Classroom split half, portal-logo app
bar (no arrow), Studio Wall pan + artifact discussion, Assignment Space with the
Project Brief view + phase timeline, and Selected Works (renamed). Pass --reduced
to run under prefers-reduced-motion.
"""
import os
import sys
from playwright.sync_api import sync_playwright

OUT = os.path.join(os.path.dirname(__file__), "shots")
os.makedirs(OUT, exist_ok=True)
REDUCED = "--reduced" in sys.argv
PREFIX = "cr_reduced_" if REDUCED else "cr_"


def shot(page, name):
    path = os.path.join(OUT, PREFIX + name)
    page.screenshot(path=path)
    print("shot:", path)


with sync_playwright() as p:
    browser = p.chromium.launch()
    ctx_kwargs = {"viewport": {"width": 1440, "height": 810}}
    if REDUCED:
        ctx_kwargs["reduced_motion"] = "reduce"
    context = browser.new_context(**ctx_kwargs)
    page = context.new_page()
    page.goto("http://localhost:3000", wait_until="networkidle")
    page.wait_for_timeout(700)

    # 1. Expand the left sidebar, click a course → split overlay (darker top half).
    page.mouse.move(30, 400)
    page.wait_for_timeout(600)
    page.mouse.click(40, 400)
    page.wait_for_timeout(600)
    shot(page, "01_split.png")

    # 2. Choose Classroom Chat (top half) → the studio.
    page.get_by_text("Classroom Chat", exact=True).click()
    page.wait_for_timeout(1000)
    page.mouse.move(720, 440)
    page.wait_for_timeout(700)
    shot(page, "02_studio_wall.png")

    # 3. Click an artifact (visible at the centered start) → discussion panel.
    page.get_by_text("Megaphone geometry", exact=True).click()
    page.wait_for_timeout(700)
    shot(page, "03_discussion.png")

    # 4. Add a thought.
    ta = page.get_by_placeholder("add a thought…")
    ta.click()
    ta.type("A horn flares; a megaphone barely does — yet both shape where the sound goes.", delay=3)
    page.keyboard.press("Enter")
    page.wait_for_timeout(500)
    shot(page, "04_discussion_added.png")

    # 5. Close (Escape) → back to the wall, then pan by dragging the background.
    page.keyboard.press("Escape")
    page.wait_for_timeout(500)
    page.mouse.move(720, 600)
    page.mouse.down()
    page.mouse.move(520, 460, steps=12)
    page.mouse.up()
    page.wait_for_timeout(500)
    shot(page, "05_wall_panned.png")

    # 6. Assignments layer — phase timeline + Project Brief button.
    page.get_by_text("Assignments", exact=True).click()
    page.wait_for_timeout(700)
    shot(page, "06_assignments.png")

    # 7. Open the Project Brief, then return.
    page.get_by_text("Project Brief", exact=True).click()
    page.wait_for_timeout(600)
    shot(page, "07_project_brief.png")
    page.get_by_text("← Back", exact=True).click()
    page.wait_for_timeout(500)

    # 8. Upload a revision (mocked).
    page.get_by_text("Upload revision", exact=True).first.click()
    page.wait_for_timeout(400)
    shot(page, "08_assignment_uploaded.png")

    # 9. Selected Works (renamed) layer.
    page.get_by_text("Selected Works", exact=True).click()
    page.wait_for_timeout(700)
    shot(page, "09_selected_works.png")

    # 10. Open a selected work → detail + instructor note + discussion.
    page.get_by_text("Amplifier Concept Exploration", exact=True).click()
    page.wait_for_timeout(700)
    shot(page, "10_selected_detail.png")
    page.keyboard.press("Escape")
    page.wait_for_timeout(400)

    # 11. Escape again → back to welcome.
    page.keyboard.press("Escape")
    page.wait_for_timeout(900)
    shot(page, "11_back_to_welcome.png")

    browser.close()
    print("done")
