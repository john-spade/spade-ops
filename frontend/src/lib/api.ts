import axios, { type InternalAxiosRequestConfig, type AxiosResponse, AxiosError } from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'https://api.spadesecurityservices.com/api',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Request interceptor for API calls
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const savedUser = sessionStorage.getItem('user');
        if (savedUser) {
            const user = JSON.parse(savedUser);
            if (user.token) {
                config.headers.Authorization = `Bearer ${user.token}`;
            }
        }
        return config;
    },
    (error: any) => {
        return Promise.reject(error);
    }
);

// Response interceptor for API calls
api.interceptors.response.use(
    (response: AxiosResponse) => {
        return response;
    },
    async (error: any) => {
        if (error.response?.status === 401) {
            sessionStorage.removeItem('user');
            window.location.href = '/';
        }
        return Promise.reject(error);
    }
);

export default api;

export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data: T;
}
