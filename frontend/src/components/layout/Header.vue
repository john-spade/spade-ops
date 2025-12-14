<script setup lang="ts">
import { Bell, Mail, Search } from 'lucide-vue-next';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
</script>

<template>
    <header class="flex justify-between items-center h-16 px-8 border-b border-white/5 bg-dark-900 sticky top-0 z-40">
        <!-- Search Bar (Optional) -->
        <div class="relative w-96">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input 
                type="text" 
                placeholder="Search..." 
                class="w-full pl-10 pr-4 py-2 bg-dark-800 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gold-500/50 transition-colors"
            >
        </div>

        <!-- Right Side Icons -->
        <div class="flex items-center gap-4">
            <button class="relative p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                <Mail class="w-5 h-5" />
                <span class="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full border-2 border-dark-900"></span>
            </button>
            <button class="relative p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                <Bell class="w-5 h-5" />
                <span class="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-dark-900"></span>
            </button>
            
            <div class="h-8 w-px bg-white/10 mx-2"></div>

            <div class="flex items-center gap-3">
                <div class="text-right hidden md:block">
                    <p class="text-sm font-medium text-white">{{ authStore.user?.name || 'Admin User' }}</p>
                    <p class="text-xs text-gray-500">{{ authStore.user?.role || 'Administrator' }}</p>
                </div>
            </div>
        </div>
    </header>
</template>
