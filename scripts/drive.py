"""Playwright drive: walk the welcome → split → idea-dump flow and screenshot."""
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

    # 1. Welcome (unchanged baseline)
    shot(page, "01_welcome.png")

    # 2. Hover the left sidebar to expand, then screenshot
    page.mouse.move(30, 400)
    page.wait_for_timeout(700)
    shot(page, "02_sidebar_hover.png")

    # 3. Click a course block -> split overlay (Classroom / Private)
    page.mouse.click(40, 400)
    page.wait_for_timeout(700)
    shot(page, "03_split.png")

    # 4. Choose Private Chat -> entering -> idea-dump intro
    page.get_by_text("Private Chat", exact=True).click()
    page.wait_for_timeout(1400)
    shot(page, "04_ideadump_empty.png")

    # 5. Type the brain-dump
    ta = page.get_by_placeholder("everything in my head right now…")
    ta.click()
    ta.type(
        "a vacuum cleaner. the noise. the cord getting in the way. how you have "
        "to move furniture. how my grandmother couldn't use it because of her "
        "back. the dustbin you always forget to empty.",
        delay=4,
    )
    page.wait_for_timeout(400)
    shot(page, "05_ideadump_typed.png")

    # 6. Submit (Enter) -> conversing: student bubble + AI blob enters
    page.keyboard.press("Enter")
    page.wait_for_timeout(1100)
    shot(page, "06_ai_entering.png")

    # 7. Socratic reply streaming in
    page.wait_for_timeout(1600)
    shot(page, "07_socratic_streaming.png")

    # 8. Reply finished
    page.wait_for_timeout(7000)
    shot(page, "08_socratic_done.png")

    # 9. A second student turn via the "your thinking…" pill
    inp = page.get_by_placeholder("your thinking…")
    inp.click()
    inp.type("the cord. it physically limits where i can clean.", delay=4)
    page.keyboard.press("Enter")
    page.wait_for_timeout(6000)
    shot(page, "09_turn2.png")

    # 10. Flip to Adversarial mode via the icon-free trigger
    page.get_by_text("start argument", exact=True).click()
    page.wait_for_timeout(900)
    shot(page, "10_adversarial_transition.png")
    page.wait_for_timeout(1200)
    shot(page, "11_adversarial.png")

    # 11. An adversarial turn — challenging reply
    inp = page.get_by_placeholder("your thinking…")
    inp.click()
    inp.type("because the cord is the most obvious flaw.", delay=4)
    page.keyboard.press("Enter")
    page.wait_for_timeout(7000)
    shot(page, "12_adversarial_reply.png")

    # 12. Return to reflection (flip back)
    page.get_by_text("return to reflection", exact=True).click()
    page.wait_for_timeout(1800)
    shot(page, "13_back_to_socratic.png")

    # 13. Workspace sidebar — collapsed (mouse parked at center)
    page.mouse.move(700, 400)
    page.wait_for_timeout(700)
    shot(page, "14_sidebar_collapsed.png")

    # 14. Hover the sidebar -> Problem Definition sub-steps expand
    page.mouse.move(1380, 220)
    page.wait_for_timeout(800)
    shot(page, "15_sidebar_expanded.png")

    # 15. Same sidebar on the dark adversarial background
    page.get_by_text("start argument", exact=True).click()
    page.wait_for_timeout(1700)
    page.mouse.move(1380, 220)
    page.wait_for_timeout(500)
    shot(page, "16_sidebar_adversarial.png")

    browser.close()
    print("done")
