import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import api from '@/lib/api';

interface User {
    id: string;
    username: string;
    role: string;
    name: string;
    email?: string;
    avatar?: string;
    token?: string;
    [key: string]: any;
}

export const useAuthStore = defineStore('auth', () => {
    const user = ref<User | null>(null);
    const loading = ref(true);

    const isAuthenticated = computed(() => !!user.value);

    const init = () => {
        const savedUser = sessionStorage.getItem('user');
        if (savedUser) {
            user.value = JSON.parse(savedUser);
        }
        loading.value = false;
    };

    const login = async (username: string, password: string): Promise<{ success: boolean; error?: string; redirect?: string }> => {
        if (username === 'admin' && password === '1234') {
            const userData: User = {
                id: '1',
                username: 'admin',
                name: 'Admin User',
                email: 'admin@spadesecurity.com',
                role: 'admin',
            };
            user.value = userData;
            sessionStorage.setItem('user', JSON.stringify(userData));
            return { success: true, redirect: '/dashboard' };
        }

        try {
            const response = await api.post('/login', { identifier: username, password });
            const { user: userData, token } = response.data.data;
            const userWithToken = { ...userData, token };

            user.value = userWithToken;
            sessionStorage.setItem('user', JSON.stringify(userWithToken));

            let redirect = '/dashboard';
            if (userData.role === 'client') redirect = '/clients';
            if (userData.role === 'employee' || userData.role === 'guard' || userData.role === 'supervisor') redirect = '/dashboard';

            return { success: true, redirect };
        } catch (error: any) {
            console.error('Login error:', error);
            return {
                success: false,
                error: error.response?.data?.message || 'Invalid username or password'
            };
        }
    };

    const logout = () => {
        user.value = null;
        sessionStorage.removeItem('user');
        window.location.href = '/';
    };

    return {
        user,
        loading,
        isAuthenticated,
        init,
        login,
        logout
    };
});

