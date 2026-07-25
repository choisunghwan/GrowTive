// resources/static/app/ui/pwa.js
// 서비스워커 등록 (PWA 설치 가능하게 하기 위함)

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(() => {
            // 등록 실패해도 앱 사용에는 지장 없음 (설치 배너만 안 뜨는 정도)
        });
    });
}
