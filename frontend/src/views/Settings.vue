<script setup lang="ts">
import { ref } from 'vue';
import Card from '@/components/ui/Card.vue';
import Button from '@/components/ui/Button.vue';
import { Settings as SettingsIcon, Sun, Moon, User, Bell, Shield, Palette } from 'lucide-vue-next';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
const isDark = ref(true);
const notifications = ref(true);

const toggleTheme = () => {
    isDark.value = !isDark.value;
    document.documentElement.classList.toggle('light-mode', !isDark.value);
};
</script>

<template>
    <div class="space-y-6 max-w-4xl">
        <div>
            <h1 class="text-2xl font-bold text-white flex items-center gap-2">
                <SettingsIcon class="w-6 h-6 text-gold-500" /> Settings
            </h1>
            <p class="text-gray-500">Manage your account and preferences</p>
        </div>

        <!-- Profile -->
        <Card class-name="p-6">
            <h3 class="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <User class="w-5 h-5 text-gold-500" /> Profile
            </h3>
            <div class="flex items-center gap-4">
                <div class="w-16 h-16 rounded-full bg-gold-500/20 flex items-center justify-center text-gold-500 font-bold text-xl">
                    {{ authStore.user?.name?.[0] || 'A' }}
                </div>
                <div>
                    <p class="text-white font-medium">{{ authStore.user?.name || 'Admin User' }}</p>
                    <p class="text-gray-500">{{ authStore.user?.email || 'admin@spadesecurity.com' }}</p>
                    <p class="text-xs text-gold-500 capitalize mt-1">{{ authStore.user?.role || 'Admin' }}</p>
                </div>
            </div>
        </Card>

        <!-- Appearance -->
        <Card class-name="p-6">
            <h3 class="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Palette class="w-5 h-5 text-gold-500" /> Appearance
            </h3>
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-white">Theme</p>
                    <p class="text-sm text-gray-500">Switch between dark and light mode</p>
                </div>
                <button
                    @click="toggleTheme"
                    class="p-3 rounded-lg bg-dark-900 border border-white/10 text-gray-400 hover:text-gold-500 transition-colors"
                >
                    <Sun v-if="isDark" class="w-5 h-5" />
                    <Moon v-else class="w-5 h-5" />
                </button>
            </div>
        </Card>

        <!-- Notifications -->
        <Card class-name="p-6">
            <h3 class="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Bell class="w-5 h-5 text-gold-500" /> Notifications
            </h3>
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-white">Email Notifications</p>
                    <p class="text-sm text-gray-500">Receive updates via email</p>
                </div>
                <button
                    @click="notifications = !notifications"
                    :class="[
                        'w-12 h-6 rounded-full transition-colors relative',
                        notifications ? 'bg-gold-500' : 'bg-dark-900 border border-white/10'
                    ]"
                >
                    <span
                        :class="[
                            'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform',
                            notifications ? 'left-7' : 'left-1'
                        ]"
                    ></span>
                </button>
            </div>
        </Card>

        <!-- Security -->
        <Card class-name="p-6">
            <h3 class="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Shield class="w-5 h-5 text-gold-500" /> Security
            </h3>
            <div class="space-y-4">
                <Button variant="outline">Change Password</Button>
                <Button variant="outline" class="text-red-400 border-red-500/20 hover:bg-red-500/10" @click="authStore.logout">
                    Sign Out
                </Button>
            </div>
        </Card>
    </div>
</template>
