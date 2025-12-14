<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { RouterLink } from 'vue-router';
import Card from '@/components/ui/Card.vue';
import { Users, ClipboardCheck, Building2, AlertTriangle, Bell, Trophy, ArrowRight } from 'lucide-vue-next';
import { Line } from 'vue-chartjs';
import 'chart.js/auto';
import api from '@/lib/api';

// Chart.js components are automatically registered by 'chart.js/auto'

interface DashboardStats {
    totalEmployees: number;
    totalEvaluations: number;
    activeClients: number;
    pendingActions: number;
}

const stats = ref<DashboardStats>({
    totalEmployees: 0,
    totalEvaluations: 0,
    activeClients: 0,
    pendingActions: 3 // Mocked as per screenshot "3 urgent"
});

const announcements = ref<any[]>([]);

// Chart Data
const chartData = {
    labels: ['Oct 15', 'Oct 30', 'Nov 15', 'Nov 30', 'Dec 15', 'Dec 30'],
    datasets: [
        {
            label: 'Guards',
            data: [65, 70, 75, 80, 85, 90],
            borderColor: '#3b82f6', // blue-500
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            fill: true,
            tension: 0.4
        },
        {
            label: 'Clients',
            data: [40, 42, 45, 48, 50, 52],
            borderColor: '#a855f7', // purple-500
            backgroundColor: 'rgba(168, 85, 247, 0.1)',
            fill: true,
            tension: 0.4
        },
        {
            label: 'Sites',
            data: [25, 28, 30, 32, 35, 38],
            borderColor: '#22c55e', // green-500
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            fill: true,
            tension: 0.4
        }
    ]
};

const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: 'top' as const,
            labels: { color: '#9ca3af', usePointStyle: true, boxWidth: 6 }
        },
        tooltip: {
            mode: 'index' as const,
            intersect: false,
            backgroundColor: '#1f2937',
            titleColor: '#fff',
            bodyColor: '#9ca3af',
            borderColor: 'rgba(255,255,255,0.1)',
            borderWidth: 1
        }
    },
    scales: {
        x: {
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: { color: '#6b7280' }
        },
        y: {
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: { color: '#6b7280' }
        }
    },
    interaction: {
        mode: 'nearest' as const,
        axis: 'x' as const,
        intersect: false
    }
};

onMounted(async () => {
    try {
        const [empRes, evalRes, clientRes, annRes] = await Promise.all([
            api.get('/employees?per_page=1'),
            api.get('/evaluations?per_page=1'),
            api.get('/clients?per_page=1'),
            api.get('/announcements')
        ]);

        stats.value = {
            totalEmployees: empRes.data.data?.total || empRes.data.total || 0,
            totalEvaluations: evalRes.data.data?.total || evalRes.data.total || 0,
            activeClients: clientRes.data.data?.total || clientRes.data.total || 0,
            pendingActions: 3 // Mocked
        };

        announcements.value = annRes.data.data?.data || annRes.data.data || [];
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
    }
});
</script>

<template>
    <div class="space-y-6">
        <div>
            <h1 class="text-2xl font-bold text-white">Dashboard</h1>
            <p class="text-gray-500">Welcome back! Here's what's happening today.</p>
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <RouterLink to="/employees">
                <Card class-name="p-6 border-l-4 border-l-blue-500 hover:bg-dark-800 transition-colors group">
                    <div class="flex justify-between items-start">
                        <div>
                            <p class="text-gray-500 text-sm">Total Employees</p>
                            <p class="text-3xl font-bold text-white mt-1 group-hover:text-blue-400 transition-colors">{{ stats.totalEmployees }}</p>
                            <p class="text-green-400 text-xs mt-2 flex items-center gap-1">
                                ↗ +3 this month
                            </p>
                        </div>
                        <div class="p-3 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                            <Users class="w-6 h-6 text-blue-500" />
                        </div>
                    </div>
                </Card>
            </RouterLink>

            <RouterLink to="/evaluation">
                <Card class-name="p-6 border-l-4 border-l-purple-500 hover:bg-dark-800 transition-colors group">
                    <div class="flex justify-between items-start">
                        <div>
                            <p class="text-gray-500 text-sm">Evaluations This Month</p>
                            <p class="text-3xl font-bold text-white mt-1 group-hover:text-purple-400 transition-colors">{{ stats.totalEvaluations }}</p>
                            <p class="text-gray-400 text-xs mt-2">Avg Score: 88%</p>
                        </div>
                        <div class="p-3 bg-purple-500/10 rounded-lg group-hover:bg-purple-500/20 transition-colors">
                            <ClipboardCheck class="w-6 h-6 text-purple-500" />
                        </div>
                    </div>
                </Card>
            </RouterLink>

            <RouterLink to="/clients">
                <Card class-name="p-6 border-l-4 border-l-green-500 hover:bg-dark-800 transition-colors group">
                    <div class="flex justify-between items-start">
                        <div>
                            <p class="text-gray-500 text-sm">Active Clients</p>
                            <p class="text-3xl font-bold text-white mt-1 group-hover:text-green-400 transition-colors">{{ stats.activeClients }}</p>
                            <p class="text-gray-500 text-xs mt-2">-- sites covered</p>
                        </div>
                        <div class="p-3 bg-green-500/10 rounded-lg group-hover:bg-green-500/20 transition-colors">
                            <Building2 class="w-6 h-6 text-green-500" />
                        </div>
                    </div>
                </Card>
            </RouterLink>

            <Card class-name="p-6 border-l-4 border-l-orange-500 hover:bg-dark-800 transition-colors group cursor-pointer">
                <div class="flex justify-between items-start">
                    <div>
                        <p class="text-gray-500 text-sm">Pending Actions</p>
                        <p class="text-3xl font-bold text-white mt-1 group-hover:text-orange-400 transition-colors">{{ stats.pendingActions }}</p>
                        <p class="text-orange-400 text-xs mt-2">3 urgent</p>
                    </div>
                    <div class="p-3 bg-orange-500/10 rounded-lg group-hover:bg-orange-500/20 transition-colors">
                        <AlertTriangle class="w-6 h-6 text-orange-500" />
                    </div>
                </div>
            </Card>
        </div>

        <!-- Middle Section: Announcements & Top Performers -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Announcements -->
            <Card class-name="p-6 min-h-[160px]">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-bold text-white flex items-center gap-2">
                        <Bell class="w-5 h-5 text-gold-500" />
                        Announcements
                    </h3>
                    <button class="text-xs text-gray-500 hover:text-white flex items-center gap-1 transition-colors">
                        View All <ArrowRight class="w-3 h-3" />
                    </button>
                </div>
                <div v-if="announcements.length" class="space-y-3">
                    <div v-for="ann in announcements.slice(0, 2)" :key="ann.id" class="p-3 bg-dark-900 rounded-lg border border-white/5">
                        <p class="text-sm font-medium text-white">{{ ann.title }}</p>
                        <p class="text-xs text-gray-500 mt-1">{{ ann.content?.substring(0, 60) }}...</p>
                    </div>
                </div>
                <p v-else class="text-gray-500 text-sm pt-4">No announcements.</p>
            </Card>

            <!-- Top Performers -->
            <Card class-name="p-6 min-h-[160px]">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-bold text-white flex items-center gap-2">
                        <Trophy class="w-5 h-5 text-gold-500" />
                        Top Performers
                    </h3>
                    <button class="text-xs text-gray-500 hover:text-white flex items-center gap-1 transition-colors">
                        View All <ArrowRight class="w-3 h-3" />
                    </button>
                </div>
                <p class="text-gray-500 text-sm pt-4">No performance data available yet.</p>
            </Card>
        </div>

        <!-- Monthly Activity Chart -->
        <Card class-name="p-6">
            <h3 class="text-lg font-bold text-white mb-6">Monthly Activity</h3>
            <div class="h-[300px] w-full">
                <Line :data="chartData" :options="chartOptions" />
            </div>
        </Card>
    </div>
</template>
