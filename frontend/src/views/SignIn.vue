<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { Lock, User, AlertCircle, CheckCircle } from 'lucide-vue-next';
import Button from '@/components/ui/Button.vue';
import Input from '@/components/ui/Input.vue';

const router = useRouter();
const authStore = useAuthStore();

const username = ref('');
const password = ref('');
const error = ref('');
const success = ref('');
const isLoading = ref(false);

const handleLogin = async (e: Event) => {
    e.preventDefault();
    error.value = '';
    success.value = '';
    isLoading.value = true;

    const result = await authStore.login(username.value, password.value);

    if (result.success) {
        success.value = 'Login successful! Redirecting...';
        setTimeout(() => {
            router.push(result.redirect || '/dashboard');
        }, 1000);
    } else {
        error.value = result.error || 'Invalid credentials';
    }

    isLoading.value = false;
};
</script>

<template>
    <div class="min-h-screen bg-dark-900 flex items-center justify-center p-4">
        <div class="w-full max-w-md">
            <!-- Logo -->
            <div class="text-center mb-8">
                <div class="flex justify-center mb-4">
                    <div class="flex items-center gap-2">
                        <span class="text-3xl font-bold tracking-wider text-white">SPADE</span>
                        <div class="w-8 h-8 gold-gradient rounded flex items-center justify-center">
                            <span class="text-dark-900 font-black text-sm">♠</span>
                        </div>
                    </div>
                </div>
                <p class="text-gray-500 text-sm">Security Services</p>
                <p class="text-gold-500/60 text-xs mt-1">Operations Management Platform</p>
            </div>

            <!-- Login Form -->
            <div class="glass-panel p-8">
                <form @submit="handleLogin" class="space-y-5">
                    <div class="relative">
                        <User class="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                        <Input
                            type="text"
                            placeholder="User ID or Email"
                            v-model="username"
                            class-name="pl-10"
                            required
                        />
                    </div>

                    <div class="relative">
                        <Lock class="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                        <Input
                            type="password"
                            placeholder="Password"
                            v-model="password"
                            class-name="pl-10"
                            required
                        />
                    </div>

                    <div v-if="error" class="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                        <AlertCircle class="w-4 h-4 flex-shrink-0" />
                        {{ error }}
                    </div>

                    <div v-if="success" class="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-sm">
                        <CheckCircle class="w-4 h-4 flex-shrink-0" />
                        {{ success }}
                    </div>

                    <Button type="submit" :disabled="isLoading" class="w-full">
                        {{ isLoading ? 'Signing in...' : 'Sign In' }}
                    </Button>
                </form>

                <p class="text-center text-gray-600 text-xs mt-6">
                    © 2024 Spade Security Services. All rights reserved.
                </p>
            </div>
        </div>
    </div>
</template>
