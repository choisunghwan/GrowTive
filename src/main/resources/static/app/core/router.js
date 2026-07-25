/*가계부(캘린더) 페이지 - 홈*/
import { mount } from '../ui/mount.js';
import LedgerPage from '../pages/ledger/ledger.page.js';

/*재무 대시보드 페이지(돈 흐름 + 반복 항목 설정)*/
import DashboardPage from '../pages/dashboard/dashboard.page.js';

/*회원가입,로그인 페이지*/
import RegisterPage from '../pages/auth/register.page.js';
import LoginPage from '../pages/auth/login.page.js';

/*관리자 - 회원관리 페이지*/
import AdminMembersPage from '../pages/admin/members.page.js';

/*친구*/
import FriendsPage from '../pages/friends/friends.page.js';

/*친구 캘린더 비교*/
import ComparePage from '../pages/compare/compare.page.js';

/*서비스 소개*/
import AboutPage from '../pages/about/about.page.js';

const routes = {
    /*홈 = 가계부*/
    '#/': LedgerPage,
    '#/dashboard': LedgerPage,
    '#/money/dashboard': DashboardPage,
    /*로그인*/
    '#/login': LoginPage,
    '#/register': RegisterPage,
    /*관리자*/
    '#/admin/members': AdminMembersPage,
    /*친구*/
    '#/friends': FriendsPage,
    '#/compare': ComparePage,
    /*서비스 소개 - 로그인 없이도 볼 수 있음*/
    '#/about': AboutPage,
};

/**
 * 로그인 해야만 접속 가능
 * @type {string[]}
 */
const authRequiredRoutes = [
    '#/dashboard',
    '#/money/dashboard',
    '#/admin/members',
    '#/friends',
    '#/compare',
];

export async function navigate() {
    const hash = location.hash || '#/login';
    const base = hash.split('?')[0];
    const Page = routes[base] || NotFound;

    const needAuth = authRequiredRoutes.includes(base);

    // 🔐 로그인 페이지는 무조건 통과
    if (needAuth) {
        try {
            await axios.get('/api/auth/me');
        } catch (e) {
            if (base !== '#/login') {
                location.hash = '#/login';
            }
            mount(LoginPage); // ✅ 강제로 로그인 페이지 렌더
            return;
        }
    }

    mount(Page);
}
function NotFound() {
    return {
        title: '페이지를 찾을 수 없어요',
        render: () => `<div class="card">
                            <h2>404 Not Found </h2>
                            <p>(router.js 파일을 확인 해주세요.)</p></div>`,
        onMounted: () => {}
    };
}
