import axios from 'axios';

const api = axios.create({
    baseURL: '/api/v1',
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    },
    withCredentials: true,
    withXSRFToken: true,
});

api.interceptors.request.use((config) => {
    const locale = localStorage.getItem('bonyan_locale') ?? 'ar';
    config.headers['Accept-Language'] = locale;
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;
        const url = error.config?.url ?? '';

        if (status === 401 && url.includes('/admin/') && !url.includes('/admin/login')) {
            const loginPath = '/admin/login';
            if (!window.location.pathname.startsWith(loginPath)) {
                window.location.assign(loginPath);
            }
        }

        return Promise.reject(error);
    },
);

export async function ensureCsrfCookie(): Promise<void> {
    await axios.get('/sanctum/csrf-cookie', { withCredentials: true });
}

export default api;
