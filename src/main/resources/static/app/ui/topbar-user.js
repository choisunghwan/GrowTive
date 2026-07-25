import authStore from '../store/authStore.js';
import { stopTopbarSalaryTicker } from './salary-ticker.js';

function renderAdminNav() {
    const isAdmin = authStore.user?.role === 'ADMIN';
    const title = document.getElementById('adminMenuTitle');
    const list = document.getElementById('adminMenuList');
    if (title) title.style.display = isAdmin ? '' : 'none';
    if (list) list.style.display = isAdmin ? '' : 'none';
}

async function logout() {
    try {
        await axios.post('/api/auth/logout');

        // 1️⃣ 프론트 상태 초기화
        authStore.clear();
        stopTopbarSalaryTicker();

        // 2️⃣ ⭐ 상단바 즉시 다시 그리기
        renderTopbarUser();

        // 3️⃣ 로그인 페이지 이동
        location.hash = '#/login';
    } catch (e) {
        alert('로그아웃 실패');
    }
}

export function renderTopbarUser() {
    const el = document.getElementById('topbar-user');
    if (!el) return;

    renderAdminNav();

    // 모바일에서는 로그아웃을 사이드바 메뉴로 옮겼다 (topbar가 좁아서)
    const sidebarLogoutBtn = document.getElementById('sidebarLogoutBtn');
    if (sidebarLogoutBtn) {
        sidebarLogoutBtn.onclick = (e) => { e.preventDefault(); logout(); };
    }

    // ❌ 로그인 안 된 상태
    if (!authStore.user) {
        el.innerHTML = `<a href="#/login">로그인</a>`;
        return;
    }

    // ✅ 로그인 된 상태
    el.innerHTML = `
        <span class="topbar-username">
            👤 ${authStore.user.displayName}님
        </span>
        <button id="logout-btn" class="topbar-logout">
            로그아웃
        </button>
    `;

    // ✅ 로그아웃 클릭 이벤트
    document.getElementById('logout-btn').addEventListener('click', logout);
}
