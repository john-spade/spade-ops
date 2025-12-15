<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Building2, Calendar, FileText, CheckCircle, AlertCircle } from 'lucide-vue-next';
import Card from '@/components/ui/Card.vue';
import api from '@/lib/api';

interface ClientStats {
    client: {
        name: string;
        contact_person: string;
        email: string;
        status: string;
    } | null;
    contractStatus: {
        start: string;
        end: string;
        status: string;
        daysRemaining: number;
    };
}

const stats = ref<ClientStats | null>(null);
const loading = ref(true);

const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
    });
};

onMounted(async () => {
    try {
        const response = await api.get('/dashboard/client-stats');
        stats.value = response.data.data;
    } catch (error) {
        console.error('Failed to fetch client stats:', error);
    } finally {
        loading.value = false;
    }
});
</script>

<template>
    <div class="space-y-8">
        <div>
            <h1 class="text-2xl font-bold text-white">Client Dashboard</h1>
            <p class="text-gray-500">Welcome back, {{ stats?.client?.contact_person || 'Partner' }}</p>
        </div>

        <div v-if="stats && stats.client" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <!-- Contract Status -->
            <Card class-name="p-6 border-l-4 border-l-blue-500 bg-dark-800/50">
                <div class="flex items-start justify-between">
                    <div>
                        <p class="text-gray-400 text-sm font-medium uppercase tracking-wider">Contract Status</p>
                        <div class="mt-4 space-y-2">
                             <div class="flex items-center gap-2">
                                <span :class="[
                                    'px-2 py-1 rounded text-xs font-bold uppercase',
                                    stats.client.status === 'active' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
                                ]">
                                    {{ stats.client.status }}
                                </span>
                             </div>
                             <p class="text-white text-lg font-medium mt-2">{{ stats.client.name }}</p>
                        </div>
                    </div>
                    <div class="p-3 bg-blue-500/10 rounded-lg">
                        <FileText class="w-6 h-6 text-blue-500" />
                    </div>
                </div>
            </Card>

            <!-- Contract Period -->
            <Card class-name="p-6 border-l-4 border-l-gold-500 bg-dark-800/50">
                <div class="flex items-start justify-between">
                    <div>
                        <p class="text-gray-400 text-sm font-medium uppercase tracking-wider">Contract Period</p>
                        <div class="mt-4 space-y-3">
                            <div class="flex items-center gap-2 text-sm text-gray-300">
                                <span class="text-gray-500">Start:</span>
                                {{ formatDate(stats.contractStatus.start) }}
                            </div>
                            <div class="flex items-center gap-2 text-sm text-gray-300">
                                <span class="text-gray-500">End:</span>
                                {{ formatDate(stats.contractStatus.end) }}
                            </div>
                             <div v-if="stats.contractStatus.daysRemaining > 0" class="text-xs text-gold-500 mt-2">
                                {{ stats.contractStatus.daysRemaining }} days remaining
                            </div>
                             <div v-else class="text-xs text-red-500 mt-2">
                                Contract Expired
                            </div>
                        </div>
                    </div>
                    <div class="p-3 bg-gold-500/10 rounded-lg">
                        <Calendar class="w-6 h-6 text-gold-500" />
                    </div>
                </div>
            </Card>

             <!-- Quick Actions / Support -->
            <Card class-name="p-6 border-l-4 border-l-purple-500 bg-dark-800/50">
                <div class="flex items-start justify-between">
                    <div>
                        <p class="text-gray-400 text-sm font-medium uppercase tracking-wider">Support</p>
                        <p class="text-white mt-4 text-sm">Need assistance? Contact your account manager.</p>
                        <div class="mt-4">
                            <a href="mailto:support@spade.com" class="text-purple-400 hover:text-purple-300 text-sm font-medium">Contact Support &rarr;</a>
                        </div>
                    </div>
                    <div class="p-3 bg-purple-500/10 rounded-lg">
                        <Building2 class="w-6 h-6 text-purple-500" />
                    </div>
                </div>
            </Card>
        </div>

        <div v-else class="text-center py-12">
            <p class="text-gray-500">Loading client data...</p>
        </div>
    </div>
</template>
