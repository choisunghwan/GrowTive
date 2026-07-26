// src/main/resources/static/app/pages/auth/register.page.js

import { authVisualHtml } from './auth-visual.js';

export default function RegisterPage() {

    return {

        title: 'Register',

        render() {

            return `
                <div class="auth-shell">
                    ${authVisualHtml()}

                    <div class="auth-panel">
                        <div class="auth-panel-inner">
                            <div class="auth-tabs">
                                <a href="#/login" class="auth-tab">로그인</a>
                                <a href="#/register" class="auth-tab is-active">회원가입</a>
                            </div>

                            <h2 class="auth-welcome">환영해요 🎉</h2>
                            <p class="auth-welcome-sub">새 계정을 만들어보세요</p>

                            <form id="register-form" class="auth-form">

                                <input
                                    type="text"
                                    id="username"
                                    class="auth-input"
                                    placeholder="아이디"
                                    required
                                />

                                <input
                                    type="password"
                                    id="password"
                                    class="auth-input"
                                    placeholder="비밀번호"
                                    required
                                />

                                <input
                                    type="text"
                                    id="displayName"
                                    class="auth-input"
                                    placeholder="이름"
                                    required
                                />

                                <input
                                    type="email"
                                    id="email"
                                    class="auth-input"
                                    placeholder="이메일"
                                    required
                                />

                                <button type="submit" class="auth-submit-btn">
                                    회원가입
                                </button>

                            </form>

                            <p class="auth-desc"> 이미 계정이 있으신가요?
                                <a href="#/login">로그인으로 돌아가기</a>
                            </p>
                        </div>
                    </div>
                </div>
            `;
        },

        onMounted() {

            const form = document.getElementById('register-form');

            form.addEventListener('submit', async (e) => {

                e.preventDefault();

                const username = document.getElementById('username').value.trim();
                const password = document.getElementById('password').value.trim();
                const displayName = document.getElementById('displayName').value.trim();
                const email = document.getElementById('email').value.trim();

                try {

                    await axios.post('/api/auth/register', {
                        username,
                        password,
                        displayName,
                        email
                    });

                    alert('회원가입 완료');

                    location.hash = '#/login';

                } catch (err) {

                    alert('회원가입 실패');
                    console.error(err);

                }

            });

        }

    };

}