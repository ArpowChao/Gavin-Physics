import os

from playwright.sync_api import sync_playwright


def main():
    base_url = os.environ.get("PHYSICS_TEST_URL", "http://127.0.0.1:8799")
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1440, "height": 1000})
        page.set_default_timeout(10_000)
        errors = []
        page.on("pageerror", lambda error: errors.append(str(error)))
        page.goto(f"{base_url}/gsat_physics_review.html#topic-N21", wait_until="networkidle")

        page.wait_for_selector("#gen-sim-canvas")
        phi_before = page.evaluate("generatorState.phi")
        page.wait_for_timeout(250)
        assert page.evaluate("Boolean(generatorState.raf)")
        assert page.evaluate("generatorState.phi") != phi_before

        # 2D controls
        page.locator("#gen-play-btn").click()
        assert not page.evaluate("generatorState.playing")
        stepped_from = page.evaluate("generatorState.phi")
        page.locator("button[onclick='stepGen(1)']").click()
        assert page.evaluate("generatorState.phi") != stepped_from
        direction = page.evaluate("generatorState.dir")
        page.locator("button[onclick='flipGenDir()']").click()
        assert page.evaluate("generatorState.dir") == -direction
        pole_direction = page.evaluate("generatorState.poleDir")
        page.locator("button[onclick='swapGen2DPoles()']").click()
        assert page.evaluate("generatorState.poleDir") == -pole_direction
        page.locator("#gen2d-collector-dc").click()
        assert not page.evaluate("generatorState.slipRings")
        page.locator("#gen2d-speed-slider").fill("2.4")
        assert page.evaluate("generatorState.omega") == 2.4
        page.locator("button[onclick='resetGen2D()']").click()
        assert page.evaluate("generatorState.phi") == 0

        # 3D generator controls
        page.locator("#genmode-3dgen").click()
        page.wait_for_function("gen3DState.renderer")
        assert page.locator("#gen3d-canvas").is_visible()
        page.locator("#gen3d-play-btn").click()
        assert not page.evaluate("gen3DState.playing")
        stepped_from = page.evaluate("gen3DState.phi")
        page.locator("button[onclick='stepGen3D(1)']").click()
        assert page.evaluate("gen3DState.phi") != stepped_from
        direction = page.evaluate("gen3DState.dir")
        page.locator("button[onclick='flipGen3DDir()']").click()
        assert page.evaluate("gen3DState.dir") == -direction
        pole_direction = page.evaluate("gen3DState.poleDir")
        page.locator("button[onclick='swapGen3DPoles()']").click()
        assert page.evaluate("gen3DState.poleDir") == -pole_direction
        page.locator("#gen3d-collector-dc").click()
        assert not page.evaluate("gen3DState.slipRings")
        page.locator("#gen3d-speed-slider").fill("2.2")
        assert page.evaluate("gen3DState.omega") == 2.2

        # 3D induction controls and repeated context recreation.
        page.locator("#genmode-3dind").click()
        page.wait_for_function("induction3D.renderer")
        assert page.locator("#ind3d-canvas").is_visible()
        page.locator("#ind3d-play").click()
        assert not page.evaluate("induction3D.playing")
        induction_direction = page.evaluate("induction3D.dir")
        page.locator("button[onclick='induction3D.dir *= -1']").click()
        assert page.evaluate("induction3D.dir") == -induction_direction

        for _ in range(3):
            page.locator("#genmode-3dgen").click()
            page.wait_for_function("gen3DState.renderer")
            assert page.locator("#gen3d-canvas").is_visible()
            page.locator("#genmode-3dind").click()
            page.wait_for_function("induction3D.renderer")
            assert page.locator("#ind3d-canvas").is_visible()

        page.locator("#genmode-2d").click()
        page.wait_for_function("generatorState.raf")
        page.locator("#gen-play-btn").click()
        phi_before = page.evaluate("generatorState.phi")
        page.wait_for_timeout(250)
        assert page.evaluate("generatorState.phi") != phi_before

        page.evaluate("navigateTo('home')")
        page.wait_for_selector(".home-hero")
        cleanup = page.evaluate(
            "({raf: generatorState.raf, genRenderer: gen3DState.renderer, indRenderer: induction3D.renderer})"
        )
        assert cleanup == {"raf": None, "genRenderer": None, "indRenderer": None}, cleanup
        assert not errors, errors

        print({"modeSwitches": 8, "pageErrors": errors, "cleanup": cleanup})
        browser.close()


if __name__ == "__main__":
    main()
