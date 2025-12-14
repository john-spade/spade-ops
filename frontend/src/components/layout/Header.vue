<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { RouterLink } from 'vue-router';
import { Bell, Mail, Search, LogOut, Settings, ChevronDown, Check, Loader2 } from 'lucide-vue-next';
import { useAuthStore } from '@/stores/auth';
import api from '@/lib/api';

interface Notification {
    id: number;
    title: string;
    content: string;
    type: string;
    is_read: boolean;
    created_at: string;
}

const authStore = useAuthStore();
const showDropdown = ref(false);
const showNotifications = ref(false);

const unreadMessages = ref(0);
const unreadNotifications = ref(0);
const notifications = ref<Notification[]>([]);
const loadingNotifications = ref(false);

let pollInterval: ReturnType<typeof setInterval> | null = null;

const fetchUnreadCounts = async () => {
    try {
        const [msgRes, notifRes] = await Promise.all([
            api.get('/messages/unread-count').catch(() => ({ data: { data: { count: 0 } } })),
            api.get('/notifications/unread-count').catch(() => ({ data: { data: { count: 0 } } }))
        ]);
        unreadMessages.value = msgRes.data.data?.count || 0;
        unreadNotifications.value = notifRes.data.data?.count || 0;
    } catch (error) {
        // Silently fail
    }
};

const fetchNotifications = async () => {
    loadingNotifications.value = true;
    try {
        const response = await api.get('/notifications');
        notifications.value = response.data.data || [];
    } catch (error) {
        notifications.value = [];
    } finally {
        loadingNotifications.value = false;
    }
};

const markAllRead = async () => {
    try {
        await api.put('/notifications/read-all');
        notifications.value = notifications.value.map(n => ({ ...n, is_read: true }));
        unreadNotifications.value = 0;
    } catch (error) {
        console.error('Failed to mark all as read:', error);
    }
};

const toggleNotifications = async () => {
    showNotifications.value = !showNotifications.value;
    showDropdown.value = false;
    if (showNotifications.value) {
        await fetchNotifications();
    }
};

const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
};

onMounted(() => {
    fetchUnreadCounts();
    // Poll every 30 seconds
    pollInterval = setInterval(fetchUnreadCounts, 30000);
});

onUnmounted(() => {
    if (pollInterval) clearInterval(pollInterval);
});
</script>

<template>
    <header class="flex justify-between items-center h-16 px-8 border-b border-white/5 bg-dark-900 sticky top-0 z-40">
        <!-- Search Bar -->
        <div class="relative w-96">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input 
                type="text" 
                placeholder="Search..." 
                class="w-full pl-10 pr-4 py-2 bg-dark-800 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gold-500/50 transition-colors"
            >
        </div>

        <!-- Right Side -->
        <div class="flex items-center gap-4">
            <!-- Messages -->
            <RouterLink to="/messages" class="relative p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                <Mail class="w-5 h-5" />
                <span 
                    v-if="unreadMessages > 0" 
                    class="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-blue-500 rounded-full flex items-center justify-center text-[10px] text-white font-bold px-1"
                >
                    {{ unreadMessages > 99 ? '99+' : unreadMessages }}
                </span>
            </RouterLink>
            
            <!-- Notifications -->
            <div class="relative">
                <button 
                    @click="toggleNotifications"
                    class="relative p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                >
                    <Bell class="w-5 h-5" />
                    <span 
                        v-if="unreadNotifications > 0" 
                        class="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 rounded-full flex items-center justify-center text-[10px] text-white font-bold px-1"
                    >
                        {{ unreadNotifications > 99 ? '99+' : unreadNotifications }}
                    </span>
                </button>

                <!-- Notifications Dropdown -->
                <div 
                    v-if="showNotifications" 
                    class="absolute right-0 top-full mt-2 w-80 bg-dark-800 border border-white/10 rounded-lg shadow-xl z-50 overflow-hidden"
                >
                    <div class="flex justify-between items-center p-3 border-b border-white/10">
                        <span class="text-white font-medium">Notifications</span>
                        <button 
                            v-if="unreadNotifications > 0"
                            @click="markAllRead"
                            class="text-xs text-gold-500 hover:text-gold-400 flex items-center gap-1"
                        >
                            <Check class="w-3 h-3" />
                            Mark all read
                        </button>
                    </div>
                    <div class="max-h-80 overflow-y-auto">
                        <div v-if="loadingNotifications" class="flex justify-center py-8">
                            <Loader2 class="w-5 h-5 text-gold-500 animate-spin" />
                        </div>
                        <div v-else-if="notifications.length === 0" class="py-8 text-center text-gray-500 text-sm">
                            No notifications yet
                        </div>
                        <div 
                            v-else
                            v-for="notif in notifications" 
                            :key="notif.id"
                            :class="['p-3 border-b border-white/5 hover:bg-white/5 transition-colors', !notif.is_read ? 'bg-gold-500/5' : '']"
                        >
                            <p class="text-sm text-white">{{ notif.title }}</p>
                            <p v-if="notif.content" class="text-xs text-gray-500 mt-1 line-clamp-2">{{ notif.content }}</p>
                            <p class="text-xs text-gray-600 mt-1">{{ formatTime(notif.created_at) }}</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="h-8 w-px bg-white/10 mx-2"></div>

            <!-- User Dropdown -->
            <div class="relative">
                <button 
                    @click="showDropdown = !showDropdown; showNotifications = false"
                    class="flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg transition-colors"
                >
                    <div class="w-8 h-8 rounded-full bg-gold-500/20 flex items-center justify-center text-gold-500 font-bold text-sm">
                        {{ authStore.user?.name?.charAt(0)?.toUpperCase() || 'A' }}
                    </div>
                    <div class="text-left hidden md:block">
                        <p class="text-sm font-medium text-white">{{ authStore.user?.name || 'Admin User' }}</p>
                        <p class="text-xs text-gray-500 capitalize">{{ authStore.user?.role || 'admin' }}</p>
                    </div>
                    <ChevronDown class="w-4 h-4 text-gray-500" />
                </button>

                <!-- Dropdown Menu -->
                <div 
                    v-if="showDropdown" 
                    class="absolute right-0 top-full mt-2 w-48 bg-dark-800 border border-white/10 rounded-lg shadow-xl py-2 z-50"
                >
                    <RouterLink 
                        to="/settings" 
                        @click="showDropdown = false"
                        class="flex items-center gap-2 px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                    >
                        <Settings class="w-4 h-4" />
                        Settings
                    </RouterLink>
                    <button 
                        @click="authStore.logout()"
                        class="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                    >
                        <LogOut class="w-4 h-4" />
                        Sign Out
                    </button>
                </div>
            </div>
        </div>
    </header>
</template>
