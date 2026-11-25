import os

from playwright.sync_api import sync_playwright


def click_js(locator):
    locator.evaluate("element => element.click()")


def set_control(control):
    control_type = control.get_attribute("type") or ""
    if control_type == "checkbox":
        control.set_checked(not control.is_checked(), force=True)
        return
    if control.evaluate("element => element.tagName") == "SELECT":
        values = control.locator("option").evaluate_all("options => options.map(option => option.value)")
        current = control.input_value()
        target = next((value for value in values if value != current), current)
        control.select_option(target)
        return
    if control_type == "range":
        current = control.input_value()
        target = control.get_attribute("max")
        if target == current:
            target = control.get_attribute("min")
        control.fill(target, force=True)
        control.dispatch_event("input")
        control.dispatch_event("change")


def main():
    base_url = os.environ.get("PHYSICS_TEST_URL", "http://127.0.0.1:8831")
    page_errors = []
    console_errors = []

    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1440, "height": 1000}, accept_downloads=True)
        page.on("pageerror", lambda error: page_errors.append(f"{page.url}: {error}"))
        page.on("console", lambda message: console_errors.append(message.text) if message.type == "error" else None)
        page.on("dialog", lambda dialog: dialog.accept())
        page.goto(f"{base_url}/gsat_physics_review.html", wait_until="networkidle")

        # Routing, history, and the removed dead route.
        page.evaluate("navigateTo('node-N07')")
        assert page.evaluate("lastRenderedRoute") == "node-N07"
        page.evaluate("navigateTo('node-N08')")
        page.evaluate("goBackInApp()")
        page.wait_for_function("lastRenderedRoute === 'node-N07'")
        page.evaluate("renderRoute('tool-videos')")
        page.wait_for_function("lastRenderedRoute === 'home'")

        # Every interactive-lab tab, plus every visible tab-local button and control.
        page.evaluate("navigateTo('tool-lab')")
        page.wait_for_selector(".lab-switcher")
        lab_names = page.locator(".lab-switch-btn").evaluate_all("buttons => buttons.map(button => button.dataset.lab)")
        lab_button_clicks = 0
        lab_control_changes = 0
        for lab_name in lab_names:
            tab = page.locator(f'.lab-switch-btn[data-lab="{lab_name}"]')
            click_js(tab)
            assert tab.evaluate("element => element.classList.contains('active')")
            panel = page.locator(f"#lab-{lab_name}")
            assert panel.evaluate("element => element.classList.contains('active')")
            for control in panel.locator("input:visible, select:visible").all():
                set_control(control)
                lab_control_changes += 1
            for button in panel.locator("button:visible").all():
                if button.is_enabled():
                    click_js(button)
                    lab_button_clicks += 1

        page.evaluate("navigateTo('home')")
        assert page.evaluate("getViewLifecycleDiagnostics().disposerCount") == 0
        assert page.evaluate("window.labAnimationFrame === null")

        # Dedicated N18 concept/Hertz lab: charge states, direction rule, apparatus, and cleanup.
        page.evaluate("navigateTo('lab-N18')")
        page.wait_for_selector("#hertz-history-canvas")
        assert page.locator("#dipole-sim-box").count() == 1
        assert page.locator("#btn-dipole-play").is_enabled()
        assert page.locator("#dipole-sim-box").evaluate(
            "element => element.classList.contains('stage-4') && !element.classList.contains('paused')"
        )
        motion_before = page.locator(".charge-group").evaluate("el => getComputedStyle(el).transform")
        page.wait_for_timeout(350)
        motion_after = page.locator(".charge-group").evaluate("el => getComputedStyle(el).transform")
        assert motion_before != motion_after, (motion_before, motion_after)
        click_js(page.locator("#btn-dipole-play"))
        assert page.locator("#dipole-sim-box").evaluate("element => element.classList.contains('paused')")
        click_js(page.locator("#btn-stage-1"))
        click_js(page.locator("#btn-dipole-play"))
        assert page.locator("#dipole-sim-box").evaluate(
            "element => element.classList.contains('stage-3') && !element.classList.contains('paused')"
        )
        for stage in (1, 2, 3, 4):
            click_js(page.locator(f"#btn-stage-{stage}"))
            assert page.locator("#dipole-sim-box").evaluate(
                f"element => element.classList.contains('stage-{stage}')"
            )
            if stage == 2:
                assert page.locator(".uniform-charge-group").evaluate("el => getComputedStyle(el).display !== 'none'")
            if stage == 3:
                assert page.locator(".dipole-wave-b").evaluate("el => getComputedStyle(el).display === 'none'")
            if stage == 4:
                assert page.locator(".dipole-wave-b").evaluate("el => getComputedStyle(el).display !== 'none'")
        assert "E × B" in page.locator("#dipole-sim-readout").inner_text()
        assert page.locator("#em-wave-direction-rule").count() == 1
        direction_text = page.locator("#em-wave-direction-rule").inner_text()
        assert "拇指 E、四指 B、掌面法向 c" in direction_text
        assert "坡印亭" not in direction_text and "vec k" not in direction_text
        direction_markers = page.locator("#em-wave-direction-rule marker")
        assert direction_markers.count() == 3
        assert direction_markers.evaluate_all(
            "markers => markers.every(marker => marker.getAttribute('markerUnits') === 'userSpaceOnUse')"
        ), "Direction arrowheads must use fixed SVG units instead of scaling with stroke width"
        dipole = page.locator("#dipole-sim-box")
        paused_before = dipole.evaluate("element => element.classList.contains('paused')")
        click_js(page.locator('[onclick="toggleDipolePlay()"]'))
        assert dipole.evaluate("element => element.classList.contains('paused')") != paused_before
        assert "youtube-nocookie.com/embed/26Cs4CRwUj8" in page.locator(".hertz-video-frame iframe").get_attribute("src")
        guide_text = page.locator(".hertz-guide-card").inner_text()
        assert "電容端板" in guide_text and "高壓脈衝電源" in guide_text and "單匝共振環" in guide_text
        assert page.locator(".hertz-apparatus-legend span").count() == 3
        assert page.locator("#hertz-distance-out").text_content() == "3 m"
        assert page.locator("#hertz-coupling-out").text_content() == "11%"
        click_js(page.locator("#hertz-fire-btn"))
        page.wait_for_function("hertzExperimentState && hertzExperimentState.phase >= 0.76", timeout=5000)
        assert "火花" in page.locator("#hertz-spark-out").text_content()
        angle = page.locator("#hertz-angle")
        angle.fill("90", force=True)
        angle.dispatch_event("input")
        assert page.locator("#hertz-coupling-out").text_content() == "0%"
        assert page.locator("#hertz-spark-out").text_content() == "未觀察到火花"
        click_js(page.locator("#hertz-auto-btn"))
        click_js(page.locator("#hertz-reset-btn"))
        page.evaluate("navigateTo('home')")
        assert page.evaluate("hertzExperimentState === null")
        assert page.evaluate("getViewLifecycleDiagnostics().disposerCount") == 0

        # N18 core summary keeps qualitative Maxwell content and the charge-acceleration conclusion.
        page.evaluate("navigateTo('node-N18')")
        node_text = page.locator("#main-content").inner_text()
        assert "馬克士威統整電與磁的四個定律" in node_text
        assert page.locator(".maxwell-four-list > div").count() == 4
        assert page.locator(".maxwell-four-text").count() == 4
        assert page.locator(".maxwell-four-text").evaluate_all(
            "elements => elements.every(element => element.clientWidth > 120 && getComputedStyle(element).writingMode === 'horizontal-tb')"
        )
        assert "依課綱只需理解" not in node_text
        assert "有加速度的電荷會發射電磁波" in node_text
        assert "帶電粒子有加速度" in node_text
        assert "靜止" in node_text and "等速運動" in node_text and "向外發射電磁波" in node_text
        assert "理論計算的電磁波速度" in node_text
        for out_of_scope_symbol in ("μ₀", "ε₀", "∇", "高斯定律", "坡印亭"):
            assert out_of_scope_symbol not in node_text
        page.evaluate("navigateTo('topic-N18')")
        assert page.locator("#dipole-sim-box").count() == 0
        assert page.locator("#maxwell-wave-supplement").count() == 1
        supplement_text = page.locator("#maxwell-wave-supplement").inner_text()
        assert "高中必修不需要知道方程式長相" in supplement_text
        assert "∇" not in supplement_text and "μ₀" not in supplement_text and "ε₀" not in supplement_text
        spectrum = page.locator("#em-spectrum-applications")
        assert spectrum.count() == 1
        spectrum_text = spectrum.inner_text()
        for expected in (
            "世代不是單一頻率",
            "較寬頻寬",
            "AM 526.5～1606.5 kHz",
            "FM 88～108 MHz",
            "微波爐網孔",
            "2.45 GHz",
            "紅外線",
            "940 nm",
            "可見光看起來直線傳播",
            "UVA 315～400 nm",
            "UVB 280～315 nm",
            "UVC 100～280 nm",
            "X 射線醫學造影",
            "晶體繞射",
        ):
            assert expected in spectrum_text
        assert "5G 頻率一定比 4G 高" not in spectrum_text
        assert page.locator(".spectrum-story-card").count() == 7
        spectrum_images = page.locator(".spectrum-photo-frame img")
        assert spectrum_images.count() == 8
        assert spectrum_images.evaluate_all(
            "images => images.every(image => "
            "image.getAttribute('src').startsWith('assets/images/em-spectrum/') && "
            "image.getAttribute('loading') === 'lazy' && "
            "image.hasAttribute('width') && image.hasAttribute('height') && "
            "image.naturalWidth > 200 && image.naturalHeight > 150)"
        )
        assert page.locator(".uv-band-row").count() == 3
        assert page.locator(".spectrum-credit a[href*='commons.wikimedia.org']").count() == 8
        assert page.locator(".diffraction-scale-card").count() == 3
        diffraction_link = page.locator("[data-spectrum-link='N17']")
        assert diffraction_link.count() == 1
        click_js(diffraction_link)
        assert page.evaluate("getViewLifecycleDiagnostics().route") == "node-N17"
        diffraction_text = page.locator("#main-content").inner_text()
        assert "繞射與尺度" in diffraction_text
        assert "障礙物／狹縫尺度" in diffraction_text
        assert page.locator(".n17-explanation-list").count() == 2
        assert page.locator(".n17-explanation-row").count() == 6
        assert page.locator(".n17-explanation-text").evaluate_all(
            "elements => elements.every(element => "
            "element.clientWidth > 120 && "
            "element.scrollWidth <= element.clientWidth && "
            "getComputedStyle(element).writingMode === 'horizontal-tb' && "
            "getComputedStyle(element).wordBreak !== 'break-all')"
        )

        # Rutherford controls.
        page.evaluate("navigateTo('topic-N06')")
        slider = page.locator("#rutherford-b-slider")
        slider.fill(slider.get_attribute("max"), force=True)
        slider.dispatch_event("input")
        click_js(page.locator("#rutherford-btn-fire"))
        assert page.locator("#rutherford-particles-group").evaluate("element => element.childElementCount") > 0
        click_js(page.locator("#rutherford-btn-clear"))
        assert page.locator("#rutherford-particles-group").evaluate("element => element.childElementCount") == 0

        # One complete workflow for every question-bank interaction type.
        page.evaluate("navigateTo('tool-quiz')")
        question_types = page.evaluate(
            """() => Object.fromEntries(['single', 'multi', 'short'].map(type => [type, questionBank.findIndex(question => question.type === type)]))"""
        )
        for question_type in ("single", "multi"):
            index = question_types[question_type]
            card = page.locator(f"#bank-card-bk{index}")
            correct = page.evaluate(
                "index => questionBank[index].opts.map((option, optionIndex) => option.c ? optionIndex : -1).filter(index => index >= 0)",
                index,
            )
            for option_index in correct:
                click_js(card.locator(".quiz-opt-item").nth(option_index))
            click_js(page.locator(f"#bank-submit-bk{index}"))
            assert card.locator(".quiz-feedback-box").is_visible()
        short_index = question_types["short"]
        short_card = page.locator(f"#bank-card-bk{short_index}")
        click_js(short_card.locator('[onclick^="toggleWritingMode"]'))
        assert page.locator(f"#board-wrap-bk{short_index}").is_visible()
        click_js(short_card.locator('[onclick^="bankReveal"]'))
        assert short_card.locator(".quiz-feedback-box").is_visible()

        # Historical choice question and handwritten reference-answer/rubric workflow.
        page.evaluate("navigateTo('tool-exams')")
        page.evaluate("show99 = true; setExamYear(examPractice.find(item => !examSolutions[`${item.year}_${item.q}`]?.hand).year)")
        choice_item = page.locator(".exam-item").filter(has=page.locator(".exam-opt-btn")).first
        click_js(choice_item.locator(".exam-head"))
        click_js(choice_item.locator(".exam-opt-btn").first)
        click_js(choice_item.locator(".exam-sol-btn"))
        assert choice_item.locator(".exam-sol").is_visible()

        hand_key = page.evaluate("Object.keys(examSolutions).find(key => examSolutions[key].hand)")
        hand_year, hand_question = hand_key.split("_", 1)
        page.evaluate("year => setExamYear(year)", hand_year)
        hand_item = page.locator(".exam-item").filter(has_text=f"第 {hand_question} 題").first
        click_js(hand_item.locator(".exam-head"))
        assert hand_item.locator(".exam-opt-btn").count() == 0
        click_js(hand_item.locator(".exam-sol-btn"))
        assert hand_item.locator(".exam-hand-answer").is_visible()
        assert hand_item.locator(".exam-rubric").is_visible()

        # Taxonomy, statistics, and local record operations.
        page.evaluate("navigateTo('tool-taxonomy')")
        queue = page.locator(".taxonomy-queue-item")
        click_js(queue.nth(1))
        assert queue.nth(1).evaluate("element => element.classList.contains('active')")
        node_pick = page.locator(".taxonomy-node-pick").first
        selected_before = node_pick.evaluate("element => element.classList.contains('selected')")
        click_js(node_pick)
        assert page.locator(".taxonomy-node-pick").first.evaluate("element => element.classList.contains('selected')") != selected_before
        click_js(page.locator('[onclick="taxonomyMarkConfirmed()"]'))

        page.evaluate("navigateTo('tool-stats')")
        sort_control = page.locator('[onclick^="toggleStatsSort"]').first
        sort_before = page.evaluate("statsSortKey")
        click_js(sort_control)
        assert page.evaluate("statsSortKey") != sort_before or sort_control.get_attribute("onclick").find(sort_before) >= 0

        page.evaluate("navigateTo('home')")
        page.wait_for_timeout(120)
        diagnostics = page.evaluate("getViewLifecycleDiagnostics()")
        assert diagnostics["disposerCount"] == 0, diagnostics
        assert not diagnostics["mathJaxScheduled"], diagnostics
        assert not page_errors, page_errors
        assert not console_errors, console_errors

        print({
            "labTabs": len(lab_names),
            "labButtons": lab_button_clicks,
            "labControls": lab_control_changes,
            "questionTypes": sorted(question_types),
            "handwrittenKey": hand_key,
            "diagnostics": diagnostics,
            "pageErrors": page_errors,
        })
        browser.close()


if __name__ == "__main__":
    main()
