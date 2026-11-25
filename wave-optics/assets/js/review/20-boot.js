// 互動實驗室檢視與頁面啟動
// （由 wave_optics_review.html 拆出；與其他 assets/js/review/*.js 共用全域範圍，載入順序見頁面）
        /* =====================================================================
         * 互動實驗室的兩個檢視
         * ===================================================================*/
        /* renderLabIndex is in assets/js/learner-ui.js. */

        /* renderSingleLabView is in assets/js/learner-ui.js. */

        /* =====================================================================
         * 啟動
         * ===================================================================*/
        /* 開發用：?selftest=1 會載入互動實驗的自動化視覺健檢（正常瀏覽不受影響） */
        if (/[?&]selftest=1/.test(location.search)) {
            const st = document.createElement('script');
            st.src = 'scripts/lab-selftest.js?v=aquarium_20261021';
            document.head.appendChild(st);
        }

        if ('scrollRestoration' in history) {
            history.scrollRestoration = 'manual';
        }

        const syncLocationRoute = () => { const route = routeFromLocation(); if (route !== lastRenderedRoute) renderRoute(route); };
        window.addEventListener('popstate', syncLocationRoute);
        window.addEventListener('hashchange', syncLocationRoute);

        document.addEventListener('DOMContentLoaded', () => {
            if (window.WavePageStatus.failed) {
                window.WavePageStatus.fail();
                return;
            }
            try {
                buildNodeSidebar();
                const initial = routeFromLocation();
                history.replaceState({ waveRoute: initial }, '', `#${encodeURIComponent(initial)}`);
                renderRoute(initial);
            } catch (error) {
                console.error('學習頁面啟動失敗', error);
                window.WavePageStatus.fail();
            }
        });
