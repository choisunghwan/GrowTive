// /static/app/apiClient.js

// ───────────────────────────────
// 공통 Axios 초기화
// ───────────────────────────────
export function setupAxios() {
    axios.defaults.baseURL = ''; // 같은 도메인

    // ✅ 요청 인터셉터: FormData면 Content-Type 제거(브라우저가 boundary 자동 설정)
    axios.interceptors.request.use((cfg) => {
        const isForm = (typeof FormData !== 'undefined') && cfg.data instanceof FormData;
        const isBlob = (typeof Blob !== 'undefined') && cfg.data instanceof Blob;

        // JSON 바디에는 기본 Content-Type 부여 (이미 지정되어 있으면 건드리지 않음)
        if (!isForm && !isBlob && cfg.method && ['post', 'put', 'patch'].includes(cfg.method.toLowerCase())) {
            cfg.headers = cfg.headers || {};
            if (!cfg.headers['Content-Type']) {
                cfg.headers['Content-Type'] = 'application/json';
            }
        }

        // FormData 업로드는 명시적으로 제거 (중복/잘못된 헤더 방지)
        if (isForm && cfg.headers) {
            delete cfg.headers['Content-Type'];
        }

        return cfg;
    });

    axios.interceptors.response.use(
        (res) => res,
        (err) => Promise.reject(err)
    );
}

// 간단 래퍼
export const api = {
    get: (url, config) => axios.get(url, config),
    post: (url, data, config) => axios.post(url, data, config),
    put: (url, data, config) => axios.put(url, data, config),
    del: (url, config) => axios.delete(url, config),
};
