<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { RouterLink } from 'vue-router';
import Card from '@/components/ui/Card.vue';
import Button from '@/components/ui/Button.vue';
import { Plus, Loader2 } from 'lucide-vue-next';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/auth';

interface Evaluation {
    id: number;
    employee_id: number;
    employee?: { first_name: string; last_name: string };
    score: number;
    comments: string;
    evaluation_date: string;
}

const authStore = useAuthStore();
const evaluations = ref<Evaluation[]>([]);
const loading = ref(true);

// Only supervisors can add evaluations
const canAddEvaluation = authStore.user?.role === 'supervisor';

const fetchEvaluations = async () => {
    loading.value = true;
    try {
        const response = await api.get('/evaluations');
        evaluations.value = response.data.data?.data || response.data.data || [];
    } catch (error) {
        console.error('Failed to fetch evaluations:', error);
    } finally {
        loading.value = false;
    }
};

onMounted(fetchEvaluations);
</script>

<template>
    <div class="space-y-6">
        <div class="flex justify-between items-center">
            <div>
                <h1 class="text-2xl font-bold text-white">Evaluation History</h1>
                <p class="text-gray-500">View all guard performance evaluations</p>
            </div>
            <RouterLink v-if="canAddEvaluation" to="/evaluation/new">
                <Button>
                    <Plus class="w-4 h-4" /> New Evaluation
                </Button>
            </RouterLink>
        </div>

        <!-- Table -->
        <Card class-name="overflow-hidden">
            <div v-if="loading" class="flex justify-center items-center py-12">
                <Loader2 class="w-8 h-8 text-gold-500 animate-spin" />
            </div>
            <table v-else class="w-full">
                <thead class="bg-dark-900">
                    <tr>
                        <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Guard</th>
                        <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                        <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Comments</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="ev in evaluations" :key="ev.id" class="table-row">
                        <td class="px-6 py-4 text-white font-medium">
                            {{ ev.employee?.first_name }} {{ ev.employee?.last_name }}
                        </td>
                        <td class="px-6 py-4 text-gray-400">{{ ev.evaluation_date }}</td>
                        <td class="px-6 py-4">
                            <span :class="[
                                'font-bold',
                                ev.score >= 80 ? 'text-green-400' : ev.score >= 60 ? 'text-gold-500' : 'text-red-400'
                            ]">
                                {{ ev.score }}%
                            </span>
                        </td>
                        <td class="px-6 py-4 text-gray-500 max-w-xs truncate">{{ ev.comments }}</td>
                    </tr>
                    <tr v-if="evaluations.length === 0">
                        <td colspan="4" class="px-6 py-12 text-center text-gray-500">No evaluations found</td>
                    </tr>
                </tbody>
            </table>
        </Card>
    </div>
</template>
