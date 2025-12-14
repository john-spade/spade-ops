<script setup lang="ts">
import { ref, computed } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import {
    LayoutDashboard,
    Users,
    ClipboardCheck,
    Building2,
    Settings,
    ChevronDown,
    LogOut,
    Sun,
    Moon,
    Users2,
    Calendar,
    Wallet
} from 'lucide-vue-next';

interface NavItem {
    label: string;
    href: string;
    icon: any;
    roles?: string[];
    children?: { label: string; href: string; roles?: string[] }[];
}

const route = useRoute();
const authStore = useAuthStore();
const isDark = ref(true);
const expanded = ref<string | null>('HRMS');

// Full navigation - roles determine visibility
const allNavItems: NavItem[] = [
    { 
        label: 'Dashboard', 
        href: '/dashboard', 
        icon: LayoutDashboard,
        roles: ['admin', 'supervisor', 'employee', 'client']
    },
    {
        label: 'HRMS',
        href: '/hrms',
        icon: Users,
        roles: ['admin', 'supervisor'],
        children: [
            { label: 'Employees', href: '/employees' },
            { label: 'Applicants', href: '/hrms/applicants' },
            { label: 'Attendance', href: '/hrms/attendance' },
            { label: 'Shifts', href: '/hrms/shifts' },
            { label: 'Sites', href: '/hrms/sites' },
            { label: 'Payroll', href: '/hrms/payroll' },
        ]
    },
    {
        label: 'My DTR',
        href: '/hrms/attendance',
        icon: Calendar,
        roles: ['employee']
    },
    {
        label: 'My Payroll',
        href: '/hrms/payroll',
        icon: Wallet,
        roles: ['employee']
    },
    {
        label: 'Evaluation',
        href: '/evaluation',
        icon: ClipboardCheck,
        roles: ['admin', 'supervisor', 'client'],
        children: [
            { label: 'History', href: '/evaluation', roles: ['admin', 'supervisor', 'client'] },
            { label: 'New Evaluation', href: '/evaluation/new', roles: ['supervisor'] },
        ]
    },
    {
        label: 'Clients',
        href: '/clients',
        icon: Building2,
        roles: ['admin', 'supervisor'],
        children: [
            { label: 'All Clients', href: '/clients' },
        ]
    },
    {
        label: 'My Contract',
        href: '/clients',
        icon: Building2,
        roles: ['client']
    },
    { label: 'Partners', href: '/partners', icon: Users2, roles: ['admin'] },
    { label: 'Settings', href: '/settings', icon: Settings, roles: ['admin'] },
];

// Filter nav by role
const navItems = computed(() => {
    const userRole = authStore.user?.role || 'admin';
    return allNavItems.filter(item => {
        if (!item.roles) return true;
        return item.roles.includes(userRole);
    }).map(item => {
        if (item.children) {
            return {
                ...item,
                children: item.children.filter(child => {
                    if (!child.roles) return true;
                    return child.roles.includes(userRole);
                })
            };
        }
        return item;
    });
});

const isActive = (href: string) => route.path === href || route.path.startsWith(href + '/');

const toggleExpand = (label: string) => {
    expanded.value = expanded.value === label ? null : label;
};

const toggleTheme = () => {
    isDark.value = !isDark.value;
    document.documentElement.classList.toggle('light-mode', !isDark.value);
};
</script>

<template>
    <aside class="fixed left-0 top-0 h-screen w-64 bg-dark-800 border-r border-white/10 flex flex-col z-50">
        <!-- Logo -->
        <div class="p-6 border-b border-white/10">
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-lg gold-gradient flex items-center justify-center">
                    <span class="text-dark-900 font-black text-lg">S</span>
                </div>
                <div>
                    <h1 class="text-lg font-bold text-white">SPADE OPS</h1>
                    <p class="text-xs text-gray-500">Operations Platform</p>
                </div>
            </div>
        </div>

        <!-- Navigation -->
        <nav class="flex-1 p-4 overflow-y-auto">
            <ul class="space-y-1">
                <li v-for="item in navItems" :key="item.label">
                    <div v-if="item.children">
                        <button
                            @click="toggleExpand(item.label)"
                            :class="['w-full sidebar-link justify-between', isActive(item.href) ? 'active' : '']"
                        >
                            <span class="flex items-center gap-3">
                                <component :is="item.icon" class="w-5 h-5" />
                                {{ item.label }}
                            </span>
                            <ChevronDown :class="['w-4 h-4 transition-transform', expanded === item.label ? 'rotate-180' : '']" />
                        </button>
                        <ul v-if="expanded === item.label" class="mt-1 ml-8 space-y-1 border-l border-white/10 pl-4">
                            <li v-for="child in item.children" :key="child.href">
                                <RouterLink
                                    :to="child.href"
                                    :class="['block py-2 text-sm', route.path === child.href ? 'text-gold-500' : 'text-gray-500 hover:text-white']"
                                >
                                    {{ child.label }}
                                </RouterLink>
                            </li>
                        </ul>
                    </div>
                    <RouterLink v-else :to="item.href" :class="['sidebar-link', isActive(item.href) ? 'active' : '']">
                        <component :is="item.icon" class="w-5 h-5" />
                        {{ item.label }}
                    </RouterLink>
                </li>
            </ul>
        </nav>

        <!-- User Profile -->
        <div class="p-4 border-t border-white/10">
            <div class="flex items-center gap-3 p-3 rounded-lg bg-dark-900/50">
                <div class="w-10 h-10 rounded-full bg-gold-500/20 flex items-center justify-center text-gold-500 font-bold">
                    {{ authStore.user?.avatar || 'AD' }}
                </div>
                <div class="flex-1">
                    <p class="text-sm font-medium text-white">{{ authStore.user?.name || 'Admin User' }}</p>
                    <p class="text-xs text-gray-500 capitalize">{{ authStore.user?.role || 'Administrator' }}</p>
                </div>
            </div>

            <div class="flex gap-2 mt-3">
                <button
                    @click="toggleTheme"
                    class="flex-1 p-2 rounded-lg bg-dark-900 border border-white/10 text-gray-400 hover:text-gold-500 hover:border-gold-500/30 transition-colors flex items-center justify-center gap-2"
                >
                    <Sun v-if="isDark" class="w-4 h-4" />
                    <Moon v-else class="w-4 h-4" />
                    <span class="text-xs">{{ isDark ? 'Light' : 'Dark' }}</span>
                </button>
                <button
                    @click="authStore.logout"
                    class="flex-1 p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 hover:border-red-500/30 transition-colors flex items-center justify-center gap-2"
                >
                    <LogOut class="w-4 h-4" />
                    <span class="text-xs">Sign Out</span>
                </button>
            </div>
        </div>
    </aside>
</template>
