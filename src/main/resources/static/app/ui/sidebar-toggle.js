// resources/static/app/ui/sidebar-toggle.js
// 모바일에서 사이드바를 기본적으로 접어두고, 햄버거 버튼으로 열고 닫는다.
// 데스크톱에서는 별도로 사이드바를 아이콘만 남기고 접었다 펼 수 있다(폭을 넓게 쓰고 싶을 때).

(function () {
    const COLLAPSE_KEY = "growtive-sidebar-collapsed";

    function initDesktopCollapse() {
        const collapseBtn = document.getElementById("sidebar-collapse-btn");
        if (!collapseBtn) return;

        if (localStorage.getItem(COLLAPSE_KEY) === "1") {
            document.body.classList.add("sidebar-collapsed");
        }

        collapseBtn.addEventListener("click", () => {
            const collapsed = document.body.classList.toggle("sidebar-collapsed");
            localStorage.setItem(COLLAPSE_KEY, collapsed ? "1" : "0");
        });
    }

    function initSidebarToggle() {
        initDesktopCollapse();

        const btn = document.getElementById("sidebar-toggle");
        const sidebar = document.getElementById("sidebar");
        if (!btn || !sidebar) return;

        function closeSidebar() {
            sidebar.classList.remove("is-open");
            btn.setAttribute("aria-expanded", "false");
        }

        function toggleSidebar() {
            const isOpen = sidebar.classList.toggle("is-open");
            btn.setAttribute("aria-expanded", String(isOpen));
        }

        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            toggleSidebar();
        });

        // 메뉴에서 링크 클릭하면 (모바일에서) 자동으로 닫힘
        sidebar.addEventListener("click", (e) => {
            if (e.target.closest("a")) {
                closeSidebar();
            }
        });

        // 메뉴 바깥 영역을 클릭하면 닫힘
        document.addEventListener("click", (e) => {
            if (!sidebar.classList.contains("is-open")) return;
            if (sidebar.contains(e.target) || btn.contains(e.target)) return;
            closeSidebar();
        });

        // 라우트 변경 시에도 닫힘
        window.addEventListener("hashchange", closeSidebar);

        // 데스크톱 폭으로 리사이즈되면 상태 초기화
        window.addEventListener("resize", () => {
            if (window.innerWidth > 768) {
                closeSidebar();
            }
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initSidebarToggle);
    } else {
        initSidebarToggle();
    }
})();
