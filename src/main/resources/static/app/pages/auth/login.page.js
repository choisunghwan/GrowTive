// src/main/resources/static/app/pages/auth/login.page.js

// ✅ 전역 로그인 상태 저장소
import authStore from '../../store/authStore.js';

// ✅ 상단바 유저 표시 렌더링 함수
import { renderTopbarUser } from '../../ui/topbar-user.js';
import { initTopbarSalaryTicker } from '../../ui/salary-ticker.js';

export default function LoginPage() {
    return {
        title: 'Login',

        /**
         * 📌 화면 렌더링 역할
         * - HTML 문자열 반환
         * - JSP/Thymeleaf 대신 SPA 방식
         */
        render() {
            return `
                <div class="login-container">
                    <h1 class="login-title">
                        <img src="/assets/img/icon-192.png?v=2" alt="" class="login-title-icon">
                        GROWTIVE
                    </h1>

                    <form id="login-form" class="login-form">

                        <!-- 아이디 입력 -->
                        <input
                            type="text"
                            id="userId"
                            class="login-input"
                            placeholder="아이디를 입력하세요"
                            required
                        />

                        <!-- 비밀번호 입력 -->
                        <input
                            type="password"
                            id="password"
                            class="login-input"
                            placeholder="비밀번호를 입력하세요"
                            required
                        />

                        <!-- 아이디 기억하기 / 로그인 유지 -->
                        <div class="login-remember-row">
                            <label class="login-remember">
                                <input type="checkbox" id="rememberId"> 아이디 기억하기
                            </label>
                            <label class="login-remember">
                                <input type="checkbox" id="keepLoggedIn"> 로그인 유지
                            </label>
                        </div>

                        <!-- 로그인 버튼 -->
                        <button type="submit" class="login-btn">
                            로그인
                        </button>

                    </form>

                    <div class="login-divider"><span>또는</span></div>

                    <a href="/oauth2/authorization/kakao" class="kakao-login-btn">
                        <span class="kakao-login-icon">💬</span> 카카오로 로그인
                    </a>

                    <p class="login-desc">
                        계정 아이디와 비밀번호를 입력하세요
                    </p>
                    
                    <!-- 회원가입 이동 -->
                    <p class="login-desc"> 계정이 없으신가요?
                        <a href="#/register">회원가입</a>
                    </p>

                    <!-- 서비스 소개 -->
                    <p class="login-desc">
                        <a href="#/about">GROWTIVE가 궁금하신가요? 서비스 소개 보기</a>
                    </p>

                </div>
            `;
        },

        /**
         * 📌 렌더링 후 실행되는 훅
         * - DOM 접근
         * - 이벤트 바인딩
         */
        onMounted() {

            const REMEMBER_KEY = 'growtive-remembered-id';

            const form = document.getElementById('login-form');
            const userIdInput = document.getElementById('userId');
            const passwordInput = document.getElementById('password');
            const rememberInput = document.getElementById('rememberId');
            const keepLoggedInInput = document.getElementById('keepLoggedIn');

            const rememberedId = localStorage.getItem(REMEMBER_KEY);
            if (rememberedId) {
                userIdInput.value = rememberedId;
                rememberInput.checked = true;
                passwordInput.focus();
            }

            form.addEventListener('submit', async (e) => {

                e.preventDefault();

                const userId = userIdInput.value.trim();
                const password = passwordInput.value.trim();

                // 입력값 검증
                if (!userId || !password) {
                    alert('아이디와 비밀번호를 입력하세요');
                    return;
                }

                try {

                    /**
                     * 1️⃣ 서버 로그인 요청
                     * - AuthController → AuthService → DB 조회
                     * - 로그인 성공 시 HttpSession 생성
                     */
                    await axios.post('/api/auth/login', {
                        username: userId,
                        password: password,
                        rememberMe: keepLoggedInInput.checked
                    });

                    if (rememberInput.checked) {
                        localStorage.setItem(REMEMBER_KEY, userId);
                    } else {
                        localStorage.removeItem(REMEMBER_KEY);
                    }

                    /**
                     * 2️⃣ 서버 세션 → 프론트 전역 상태 동기화
                     * - 현재 로그인 유저 정보 조회
                     */
                    await authStore.load();

                    /**
                     * 3️⃣ 상단바 사용자 정보 즉시 갱신
                     * - 새로고침 없이 UI 업데이트
                     */
                    renderTopbarUser();
                    initTopbarSalaryTicker();

                    /**
                     * 4️⃣ 로그인 후 이동
                     */
                    location.hash = '#/dashboard';

                } catch (err) {

                    /**
                     * 로그인 실패 처리
                     */
                    alert('아이디 또는 비밀번호가 올바르지 않습니다.');
                    console.error(err);

                }

            });
        }
    };
}