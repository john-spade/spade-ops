<script setup lang="ts">
import { onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import Sidebar from '@/components/layout/Sidebar.vue';
import Header from '@/components/layout/Header.vue';

const route = useRoute();
const authStore = useAuthStore();

const isAuthPage = computed(() => route.path === '/');

onMounted(() => {
    authStore.init();
});
</script>

<template>
    <div class="min-h-screen bg-dark-900">
        <template v-if="isAuthPage">
            <RouterView />
        </template>
        <template v-else>
            <Sidebar />
            <main class="ml-64 bg-dark-900 min-h-screen flex flex-col">
                <Header />
                <div class="p-8 flex-1 overflow-y-auto">
                    <RouterView />
                </div>
            </main>
        </template>
    </div>
</template>
