/**
 * main.js
 *
 * 📌 Growtive SPA 엔트리 포인트
 * - 앱 최초 로드 시 실행
 * - 전역 설정 초기화
 * - 로그인 상태 확인
 * - 라우터 시작
 */

import { navigate } from './router.js';
import { setupAxios } from './apiClient.js';
import authStore from '../store/authStore.js';
import { renderTopbarUser } from '../ui/topbar-user.js';
/**
 * axios 전역 설정
 * - withCredentials
 * - 공통 에러 처리 등
 */
setupAxios();

/**
 * 활성 메뉴 하이라이트 처리
 * (상단 메뉴 / 사이드바 현재 페이지 표시)
 */
function highlightActive() {
    const hash = location.hash || '#/dashboard';

    // 🔐 로그인/회원가입 화면에서는 topbar/sidebar를 숨기고 폼만 보여준다
    const isAuthPage = hash.startsWith('#/login') || hash.startsWith('#/register');
    document.body.classList.toggle('auth-view', isAuthPage);

    // sidebar
    document.querySelectorAll('#sidebar a').forEach(a => {
        const route = a.getAttribute('href');
        a.classList.toggle('active', route === hash);
    });
}

/**
 * 🚀 앱 부팅 함수
 * - DOM 로드 후 1회 실행
 * - 서버 세션 → authStore 동기화
 * - 첫 페이지 렌더링
 */
async function boot() {
    // ⭐ 핵심 1: 로그인 세션 확인
    // 서버(HttpSession)에 로그인 정보가 있으면 authStore.user에 저장됨
    await authStore.load();

    // 🔝 상단바 유저 표시
    renderTopbarUser();

    // ⭐ 핵심 2: 기본 해시 없으면 대시보드로
    if (!location.hash) {
        location.hash = '#/dashboard';
    }

    // 메뉴 활성화
    highlightActive();

    // 첫 페이지 렌더링
    navigate();
}

/**
 * 해시 변경 시 페이지 전환
 */
window.addEventListener('hashchange', () => {
    highlightActive();
    navigate();
});

/**
 * 최초 DOM 로드 시 앱 시작
 */
window.addEventListener('DOMContentLoaded', boot);
