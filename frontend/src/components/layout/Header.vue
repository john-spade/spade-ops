<script setup lang="ts">
import { ref } from 'vue';
import { RouterLink } from 'vue-router';
import { Bell, Mail, Search, LogOut, Settings, User, ChevronDown } from 'lucide-vue-next';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
const showDropdown = ref(false);
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
                <span class="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full border-2 border-dark-900"></span>
            </RouterLink>
            
            <!-- Notifications -->
            <button class="relative p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                <Bell class="w-5 h-5" />
            </button>
            
            <div class="h-8 w-px bg-white/10 mx-2"></div>

            <!-- User Dropdown -->
            <div class="relative">
                <button 
                    @click="showDropdown = !showDropdown"
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
                    @click="showDropdown = false"
                    class="absolute right-0 top-full mt-2 w-48 bg-dark-800 border border-white/10 rounded-lg shadow-xl py-2 z-50"
                >
                    <RouterLink 
                        to="/settings" 
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
