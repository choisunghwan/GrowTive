// resources/static/app/ui/theme-toggle.js

(function () {
    const STORAGE_KEY = "growtive-theme";

    const ICON_MOON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
    const ICON_SUN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>';

    function applyTheme(theme) {
        const root = document.documentElement;

        if (theme === "dark") {
            root.classList.add("dark");
        } else {
            root.classList.remove("dark");
        }
    }

    function updateButtonIcon(btn, theme) {
        if (!btn) return;
        // 라이트 모드일 때는 🌙 아이콘 보여주고,
        // 다크 모드일 때는 ☀️ 아이콘 보여줌
        const icon = document.getElementById("theme-toggle-icon");
        const label = document.getElementById("themeToggleLabel");
        if (icon) {
            icon.innerHTML = theme === "dark" ? ICON_SUN : ICON_MOON;
        } else {
            btn.textContent = theme === "dark" ? "☀️" : "🌙";
        }
        if (label) {
            label.textContent = theme === "dark" ? "라이트 모드" : "다크 모드";
        }
    }

    function getPreferredTheme() {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored === "dark" || stored === "light") {
            return stored;
        }

        // 저장된 값이 없다면 시스템 다크모드 선호 여부 사용
        if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
            return "dark";
        }

        return "light";
    }

    function initThemeToggle() {
        const btn = document.getElementById("theme-toggle");
        if (!btn) return;

        // 초기 테마 결정 + 적용
        let currentTheme = getPreferredTheme();
        applyTheme(currentTheme);
        updateButtonIcon(btn, currentTheme);

        // 클릭 시 토글
        btn.addEventListener("click", () => {
            currentTheme = currentTheme === "dark" ? "light" : "dark";
            applyTheme(currentTheme);
            updateButtonIcon(btn, currentTheme);
            localStorage.setItem(STORAGE_KEY, currentTheme);
        });
    }

    // DOM 로드 후 자동 실행
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initThemeToggle);
    } else {
        initThemeToggle();
    }
})();
