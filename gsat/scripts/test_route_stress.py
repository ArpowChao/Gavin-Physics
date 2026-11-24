import os
import time

from playwright.sync_api import sync_playwright


def main():
    base_url = os.environ.get("PHYSICS_TEST_URL", "http://127.0.0.1:8832")
    page_errors = []
    console_errors = []

    routes = [
        "home", "module-1", "node-N03", "topic-N03", "tool-contexts",
        "module-5", "node-N14", "lab-N14", "tool-lab", "home",
        "module-6", "node-N21", "topic-N21", "home", "lab-N21",
        "home", "module-7", "node-N23", "lab-N23", "topic-N23",
        "tool-summary", "tool-quiz", "bank-N03", "tool-exams", "exams-N07",
        "tool-taxonomy", "tool-mock", "tool-stats", "tool-wrong", "tool-buster",
        "lab-N18", "topic-N18", "node-N06", "topic-N06", "node-N28",
        "lab-N28", "topic-N28", "node-N07", "lab-N07", "home",
        "module-2", "node-N05", "topic-N05", "module-3", "node-N11",
        "module-4", "node-N20", "topic-N20", "tool-contexts", "home",
    ]

    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1280, "height": 850})
        page.on("pageerror", lambda error: page_errors.append(str(error)))
        page.on("console", lambda message: console_errors.append(message.text) if message.type == "error" else None)
        page.goto(f"{base_url}/gsat_physics_review.html", wait_until="networkidle")

        started = time.perf_counter()
        snapshots = []
        for index, route in enumerate(routes):
            page.evaluate("route => renderRoute(route)", route)
            page.wait_for_timeout(35)
            assert page.evaluate("lastRenderedRoute") == route
            assert page.locator("#main-content").evaluate("element => element.childElementCount") > 0
            if index % 10 == 9:
                snapshots.append(page.evaluate("getViewLifecycleDiagnostics()"))

        duration = time.perf_counter() - started
        page.wait_for_timeout(200)

        # The default 2D generator and opt-in Three.js view must still initialize after
        # the rapid route sequence, then dispose on exit.
        page.evaluate("renderRoute('topic-N21')")
        page.wait_for_function("generatorState.raf", timeout=20000)
        page.locator("#genmode-3dgen").click()
        page.wait_for_function("window.THREE && gen3DState.renderer", timeout=20000)
        assert page.locator('script[data-physics-runtime="three"]').count() == 1
        page.evaluate("renderRoute('home')")
        page.wait_for_function("gen3DState.renderer === null")

        # The dedicated Hertz route must release its RAF, observer, and control listeners.
        page.evaluate("renderRoute('lab-N18')")
        page.wait_for_function("hertzExperimentState && hertzExperimentState.destroyed === false")
        page.locator("#hertz-fire-btn").click()
        page.evaluate("renderRoute('home')")
        page.wait_for_function("hertzExperimentState === null")

        # All tab-local listeners and RAF callbacks must leave with the interactive lab.
        page.evaluate("renderRoute('lab-N21')")
        page.wait_for_selector("#induction-canvas")
        active_diagnostics = page.evaluate("getViewLifecycleDiagnostics()")
        assert active_diagnostics["disposerCount"] > 0, active_diagnostics
        page.evaluate("renderRoute('home')")
        page.wait_for_timeout(150)
        final_diagnostics = page.evaluate("getViewLifecycleDiagnostics()")
        assert final_diagnostics["disposerCount"] == 0, final_diagnostics
        assert not final_diagnostics["generatorRenderer"], final_diagnostics
        assert not final_diagnostics["inductionRenderer"], final_diagnostics
        assert not final_diagnostics["mathJaxScheduled"], final_diagnostics
        assert not page_errors, page_errors
        assert not console_errors, console_errors

        print({
            "routes": len(routes),
            "durationSeconds": round(duration, 2),
            "snapshots": snapshots,
            "activeLab": active_diagnostics,
            "final": final_diagnostics,
            "pageErrors": page_errors,
        })
        browser.close()


if __name__ == "__main__":
    main()
