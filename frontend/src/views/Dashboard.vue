<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue';
import { RouterLink } from 'vue-router';
import Card from '@/components/ui/Card.vue';
import { Users, ClipboardCheck, Building2, AlertTriangle, Bell, Trophy, ArrowRight } from 'lucide-vue-next';
import { Line } from 'vue-chartjs';
import 'chart.js/auto';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/auth';
import GuardDashboard from '@/views/GuardDashboard.vue';

const authStore = useAuthStore();

interface DashboardStats {
    totalEmployees: number;
    totalEvaluations: number;
    activeClients: number;
    pendingActions: number;
    sites: number;
    attendanceToday: number;
}

interface TopPerformer {
    id: number;
    first_name: string;
    last_name: string;
    position: string;
    avg_score: number;
    eval_count: number;
}

const stats = ref<DashboardStats>({
    totalEmployees: 0,
    totalEvaluations: 0,
    activeClients: 0,
    pendingActions: 0,
    sites: 0,
    attendanceToday: 0
});

const announcements = ref<any[]>([]);
const topPerformers = ref<TopPerformer[]>([]);

// Chart Data - reactive so it updates when API returns
const chartData = reactive({
    labels: ['Loading...'],
    datasets: [
        {
            label: 'Guards',
            data: [0],
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            fill: true,
            tension: 0.4
        },
        {
            label: 'Clients',
            data: [0],
            borderColor: '#a855f7',
            backgroundColor: 'rgba(168, 85, 247, 0.1)',
            fill: true,
            tension: 0.4
        },
        {
            label: 'Sites',
            data: [0],
            borderColor: '#22c55e',
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            fill: true,
            tension: 0.4
        }
    ]
});

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
        const [statsRes, annRes, chartRes, perfRes] = await Promise.all([
            api.get('/dashboard/stats'),
            api.get('/announcements'),
            api.get('/dashboard/chart').catch(() => ({ data: { data: null } })),
            api.get('/dashboard/top-performers').catch(() => ({ data: { data: [] } }))
        ]);

        const data = statsRes.data.data || statsRes.data;
        stats.value = {
            totalEmployees: data.employees || 0,
            totalEvaluations: data.evaluations || 0,
            activeClients: data.clients || 0,
            pendingActions: data.scheduledShifts || 0,
            sites: data.sites || 0,
            attendanceToday: data.attendanceToday || 0
        };

        announcements.value = annRes.data.data?.data || annRes.data.data || [];
        topPerformers.value = perfRes.data.data || [];

        // Update chart with real data
        const chart = chartRes.data.data;
        if (chart && chart.labels && chartData.datasets[0] && chartData.datasets[1] && chartData.datasets[2]) {
            chartData.labels = chart.labels;
            chartData.datasets[0].data = chart.guardsData;
            chartData.datasets[1].data = chart.clientsData;
            chartData.datasets[2].data = chart.sitesData;
        }
        }
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
    }
});
</script>

<template>
    <GuardDashboard v-if="authStore.user?.role === 'employee'" />
    
    <div v-else class="space-y-6">
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
                                ↗ Active guards
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
                            <p class="text-gray-500 text-sm">Total Evaluations</p>
                            <p class="text-3xl font-bold text-white mt-1 group-hover:text-purple-400 transition-colors">{{ stats.totalEvaluations }}</p>
                            <p class="text-gray-400 text-xs mt-2">Performance reviews</p>
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
                            <p class="text-gray-500 text-xs mt-2">{{ stats.sites }} sites covered</p>
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
                        <p class="text-orange-400 text-xs mt-2">{{ stats.pendingActions > 0 ? 'pending shifts' : 'all clear' }}</p>
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
                    <RouterLink to="/announcements" class="text-xs text-gray-500 hover:text-white flex items-center gap-1 transition-colors">
                        View All <ArrowRight class="w-3 h-3" />
                    </RouterLink>
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
                    <RouterLink to="/evaluation" class="text-xs text-gray-500 hover:text-white flex items-center gap-1 transition-colors">
                        View All <ArrowRight class="w-3 h-3" />
                    </RouterLink>
                </div>
                <div v-if="topPerformers.length" class="space-y-2">
                    <div 
                        v-for="(perf, idx) in topPerformers" 
                        :key="perf.id"
                        class="flex items-center justify-between p-2 rounded-lg hover:bg-white/5"
                    >
                        <div class="flex items-center gap-3">
                            <div :class="[
                                'w-7 h-7 rounded-full flex items-center justify-center font-bold text-sm',
                                idx === 0 ? 'bg-gold-500 text-dark-900' : 
                                idx === 1 ? 'bg-gray-400 text-dark-900' : 
                                idx === 2 ? 'bg-orange-600 text-dark-900' : 'bg-dark-700 text-white'
                            ]">
                                {{ idx + 1 }}
                            </div>
                            <div>
                                <p class="text-sm text-white font-medium">{{ perf.first_name }} {{ perf.last_name }}</p>
                                <p class="text-xs text-gray-500">{{ perf.position }}</p>
                            </div>
                        </div>
                        <span :class="[
                            'font-bold',
                            perf.avg_score >= 80 ? 'text-green-400' : perf.avg_score >= 60 ? 'text-gold-500' : 'text-red-400'
                        ]">
                            {{ Math.round(perf.avg_score) }}%
                        </span>
                    </div>
                </div>
                <p v-else class="text-gray-500 text-sm pt-4">No performance data available yet.</p>
            </Card>
        </div>

        <!-- Monthly Activity Chart -->
        <Card class-name="p-6">
            <h3 class="text-lg font-bold text-white mb-6">Monthly Activity</h3>
            <div class="h-[300px] w-full">
                <Line :data="chartData" :options="chartOptions" />
            </div>
        </Card>
        </Card>
    </div>
</template>
