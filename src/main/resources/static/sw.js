// 최소 서비스워커: 오프라인 캐싱은 하지 않고, PWA 설치 조건(매니페스트 + fetch 핸들러가 있는
// 서비스워커)만 만족시킨다. 캐싱을 하면 배포할 때마다 예전 JS/CSS가 남아있는 문제가 생기기 쉬워서
// 일부러 네트워크 그대로 통과시키는 방식으로 둔다.

self.addEventListener('install', () => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
    event.respondWith(fetch(event.request));
});
