<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import Card from '@/components/ui/Card.vue';
import { Briefcase, Building, Calendar, Award } from 'lucide-vue-next';
import api from '@/lib/api';

const route = useRoute();
const employee = ref<any>(null);
const evaluations = ref<any[]>([]);
const loading = ref(true);

onMounted(async () => {
    try {
        const empId = route.params.id;
        const [empRes, evalRes] = await Promise.all([
            api.get(`/employees/${empId}`),
            api.get(`/evaluations?employee_id=${empId}`)
        ]);
        employee.value = empRes.data.data;
        evaluations.value = evalRes.data.data?.data || evalRes.data.data || [];
    } catch (error) {
        console.error('Failed to fetch employee:', error);
    } finally {
        loading.value = false;
    }
});
</script>

<template>
    <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="animate-spin w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full"></div>
    </div>
    <div v-else-if="employee" class="space-y-6">
        <!-- Header -->
        <Card class-name="p-6">
            <div class="flex items-center gap-6">
                <div class="w-20 h-20 rounded-full bg-gold-500/20 flex items-center justify-center text-gold-500 font-bold text-2xl">
                    {{ employee.first_name?.[0] }}{{ employee.last_name?.[0] }}
                </div>
                <div>
                    <h1 class="text-2xl font-bold text-white">{{ employee.first_name }} {{ employee.last_name }}</h1>
                    <p class="text-gray-500">{{ employee.position }}</p>
                    <span :class="employee.status === 'active' ? 'badge-success' : 'badge-warning'" class="mt-2 inline-block">
                        {{ employee.status }}
                    </span>
                </div>
            </div>
        </Card>

        <!-- Details -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card class-name="p-6">
                <h3 class="text-lg font-bold text-white mb-4">Information</h3>
                <div class="space-y-4">
                    <div class="flex items-center gap-3">
                        <Briefcase class="w-5 h-5 text-gray-500" />
                        <span class="text-gray-400">{{ employee.position }}</span>
                    </div>
                    <div class="flex items-center gap-3">
                        <Building class="w-5 h-5 text-gray-500" />
                        <span class="text-gray-400">{{ employee.department || 'N/A' }}</span>
                    </div>
                    <div class="flex items-center gap-3">
                        <Calendar class="w-5 h-5 text-gray-500" />
                        <span class="text-gray-400">Hired: {{ employee.date_hired }}</span>
                    </div>
                </div>
            </Card>

            <Card class-name="p-6">
                <h3 class="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Award class="w-5 h-5 text-gold-500" />
                    Recent Evaluations
                </h3>
                <div v-if="evaluations.length" class="space-y-3">
                    <div v-for="ev in evaluations.slice(0, 5)" :key="ev.id" class="flex justify-between items-center p-3 bg-dark-900 rounded-lg">
                        <span class="text-gray-400 text-sm">{{ ev.evaluation_date }}</span>
                        <span class="text-gold-500 font-bold">{{ ev.score }}%</span>
                    </div>
                </div>
                <p v-else class="text-gray-500 text-sm">No evaluations yet</p>
            </Card>
        </div>
    </div>
    <div v-else class="text-center py-12 text-gray-500">Employee not found</div>
</template>
