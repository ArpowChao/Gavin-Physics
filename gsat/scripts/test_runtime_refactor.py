import os
from pathlib import Path

from playwright.sync_api import sync_playwright


def main():
    base_url = os.environ.get("PHYSICS_TEST_URL", "http://127.0.0.1:8799")
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1440, "height": 1000})
        errors = []
        page.on("pageerror", lambda error: errors.append(str(error)))
        page.goto(f"{base_url}/gsat_physics_review.html", wait_until="networkidle")

        assert page.locator('script[data-physics-runtime="three"]').count() == 0
        assert page.evaluate("typeof window.THREE") == "undefined"

        clock_counts = page.evaluate(
            """
            () => {
                const run = hz => {
                    const clock = PhysicsRuntime.createFixedClock({ stepHz: 120 });
                    let steps = 0;
                    for (let i = 0; i <= hz; i++) clock.advance(i * 1000 / hz, () => steps++);
                    return steps;
                };
                return { at60: run(60), at144: run(144) };
            }
            """
        )
        assert abs(clock_counts["at60"] - clock_counts["at144"]) <= 1, clock_counts

        page.evaluate("navigateTo('topic-N21')")
        page.wait_for_selector("#gen-sim-canvas")
        initial_phi = page.evaluate("generatorState.phi")
        page.wait_for_timeout(250)
        default_2d = page.evaluate(
            "({active: document.getElementById('genmode-2d').classList.contains('active'), raf: Boolean(generatorState.raf), phi: generatorState.phi})"
        )
        assert default_2d["active"], default_2d
        assert default_2d["raf"], default_2d
        assert default_2d["phi"] != initial_phi, (initial_phi, default_2d)

        page.locator("#genmode-3dgen").click()
        page.wait_for_function("window.THREE && gen3DState.renderer")
        assert page.locator('script[data-physics-runtime="three"]').count() == 1
        page.locator("#gen3d-play-btn").click()
        assert not page.evaluate("gen3DState.playing")
        stepped_from = page.evaluate("gen3DState.phi")
        page.locator("button[onclick='stepGen3D(1)']").click()
        assert page.evaluate("gen3DState.phi") != stepped_from

        page.locator("#genmode-3dind").click()
        page.wait_for_function("induction3D.renderer")
        assert page.locator("#ind3d-canvas").is_visible()

        # Re-enter both WebGL modes after disposal. Each must receive a fresh canvas/context.
        for _ in range(2):
            page.locator("#genmode-3dgen").click()
            page.wait_for_function("gen3DState.renderer")
            assert page.locator("#gen3d-canvas").is_visible()
            page.locator("#genmode-3dind").click()
            page.wait_for_function("induction3D.renderer")
            assert page.locator("#ind3d-canvas").is_visible()

        page.locator("#genmode-2d").click()
        page.wait_for_function("generatorState.raf")
        assert page.locator("#gen-sim-canvas").is_visible()
        page.evaluate("navigateTo('home')")
        page.wait_for_selector(".home-hero")
        cleanup = page.evaluate(
            "({genRenderer: gen3DState.renderer, genScene: gen3DState.scene, indRenderer: induction3D.renderer, indScene: induction3D.scene})"
        )
        assert cleanup == {"genRenderer": None, "genScene": None, "indRenderer": None, "indScene": None}, cleanup

        page.evaluate("navigateTo('tool-lab')")
        page.wait_for_selector("#wave-relation-canvas", state="attached")
        assert page.locator("#lab-wave").evaluate("el => el.classList.contains('active')")
        if not page.locator("#lab-wave").is_visible():
            visibility = page.locator("#lab-wave").evaluate(
                "el => ({display:getComputedStyle(el).display, visibility:getComputedStyle(el).visibility, rect:el.getBoundingClientRect().toJSON(), main:el.closest('main') && getComputedStyle(el.closest('main')).display})"
            )
            raise AssertionError(visibility)
        lab_text = page.locator("#lab-wave").inner_text()
        assert " px" not in lab_text
        assert page.locator("#wave-formula-readout").inner_text().strip()
        assert page.locator("#wave-invariant-readout").inner_text().strip()

        page.evaluate("navigateTo('tool-exams')")
        page.wait_for_selector(".exam-year-placeholder")
        initial_exam_items = page.locator(".exam-item").count()
        placeholders = page.locator(".exam-year-placeholder").count()
        assert initial_exam_items > 0
        assert placeholders >= 4
        first_load = page.locator(".exam-year-load").first
        first_load.click()
        page.wait_for_timeout(100)
        assert page.locator(".exam-item").count() > initial_exam_items

        page.set_viewport_size({"width": 390, "height": 844})
        page.evaluate("navigateTo('tool-lab')")
        page.wait_for_selector(".lab-switcher")
        mobile_tabs = page.locator(".lab-switcher").evaluate(
            "el => ({height: el.getBoundingClientRect().height, scrollWidth: el.scrollWidth, clientWidth: el.clientWidth, wrap: getComputedStyle(el).flexWrap})"
        )
        assert mobile_tabs["height"] < 90, mobile_tabs
        assert mobile_tabs["scrollWidth"] > mobile_tabs["clientWidth"], mobile_tabs
        assert mobile_tabs["wrap"] == "nowrap", mobile_tabs

        page.evaluate("navigateTo('lab-N18')")
        page.wait_for_selector("#dipole-sim-box")
        mobile_n18 = page.evaluate(
            """() => {
                const wrap = document.querySelector('.dipole-svg-wrap');
                const grid = document.querySelector('.em-direction-grid');
                return {
                    scrollWidth: wrap.scrollWidth,
                    clientWidth: wrap.clientWidth,
                    directionColumns: getComputedStyle(grid).gridTemplateColumns
                };
            }"""
        )
        assert mobile_n18["scrollWidth"] > mobile_n18["clientWidth"], mobile_n18
        assert " " not in mobile_n18["directionColumns"], mobile_n18

        reduced = browser.new_page(
            viewport={"width": 900, "height": 700},
            reduced_motion="reduce",
        )
        reduced.goto(f"{base_url}/gsat_physics_review.html#lab-N18", wait_until="domcontentloaded")
        reduced.wait_for_function("typeof renderRoute === 'function'")
        reduced.wait_for_selector(".charge-group")
        reduced.wait_for_timeout(100)
        animations = reduced.locator(".charge-group, .dipole-wave-group, .uniform-charge-group").evaluate_all(
            "els => els.map(el => getComputedStyle(el).animationPlayState)"
        )
        assert all(state == "paused" for state in animations), animations
        assert reduced.locator("#btn-dipole-play").is_enabled()
        reduced.locator("#btn-dipole-play").evaluate("button => button.click()")
        motion_before = reduced.locator(".charge-group").evaluate("el => getComputedStyle(el).transform")
        reduced.wait_for_timeout(350)
        motion_after = reduced.locator(".charge-group").evaluate("el => getComputedStyle(el).transform")
        assert motion_before != motion_after, (motion_before, motion_after)
        reduced_motion_state = reduced.locator("#dipole-sim-box").evaluate(
            "el => ({className: el.className, stage4: el.classList.contains('stage-4'), userEnabled: el.classList.contains('user-motion-enabled'), paused: el.classList.contains('paused')})"
        )
        assert reduced_motion_state == {
            "className": "dipole-sim-container stage-4 user-motion-enabled",
            "stage4": True,
            "userEnabled": True,
            "paused": False,
        }, reduced_motion_state
        reduced.wait_for_selector("#hertz-fire-btn")
        assert reduced.locator("#hertz-auto-btn").is_disabled()
        reduced.locator("#hertz-fire-btn").evaluate("button => button.click()")
        reduced_result = reduced.evaluate(
            "({phase: hertzExperimentState.phase, running: hertzExperimentState.running, detected: hertzExperimentState.detected})"
        )
        assert reduced_result == {"phase": 1, "running": False, "detected": True}, reduced_result
        reduced.evaluate("navigateTo('home')")
        assert reduced.evaluate("hertzExperimentState === null")
        reduced.close()

        local_file = browser.new_page(viewport={"width": 1000, "height": 760})
        local_url = f"{Path('gsat_physics_review.html').resolve().as_uri()}#lab-N18"
        local_file.goto(local_url, wait_until="domcontentloaded")
        local_file.wait_for_selector(".hertz-video-fallback")
        assert local_file.locator(".hertz-video-frame iframe").count() == 0
        assert "youtube.com/watch?v=26Cs4CRwUj8" in local_file.locator(".hertz-video-fallback").get_attribute("href")
        assert "錯誤 153" in local_file.locator(".hertz-video-fallback").inner_text()
        local_file.close()

        assert not errors, errors
        print({
            "fixedClockSteps": clock_counts,
            "initialExamItems": initial_exam_items,
            "lazyYearPlaceholders": placeholders,
            "mobileTabs": mobile_tabs,
            "mobileN18": mobile_n18,
            "pageErrors": errors,
        })
        browser.close()


if __name__ == "__main__":
    main()
