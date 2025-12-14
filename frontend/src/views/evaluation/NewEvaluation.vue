<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import Card from '@/components/ui/Card.vue';
import Button from '@/components/ui/Button.vue';
import { ClipboardCheck, Save, AlertCircle, Check, Loader2 } from 'lucide-vue-next';
import api from '@/lib/api';

const router = useRouter();
const selectedGuard = ref('');
const comments = ref('');
const submitted = ref(false);
const loading = ref(false);
const employees = ref<any[]>([]);
const scores = ref<Record<string, number>>({});

const EVALUATION_CRITERIA = [
    { id: 'professionalism', name: 'Professionalism', description: 'Conduct, demeanor, and professional behavior', weight: 25 },
    { id: 'punctuality', name: 'Punctuality', description: 'Arrival time and attendance reliability', weight: 20 },
    { id: 'alertness', name: 'Alertness', description: 'Vigilance and situational awareness', weight: 20 },
    { id: 'communication', name: 'Communication', description: 'Clear and effective communication', weight: 15 },
    { id: 'appearance', name: 'Appearance', description: 'Uniform, grooming, and presentation', weight: 10 },
    { id: 'incident_handling', name: 'Incident Handling', description: 'Response to emergencies and incidents', weight: 10 },
];

const totalScore = computed(() => {
    let total = 0;
    EVALUATION_CRITERIA.forEach(c => {
        const score = scores.value[c.id] || 0;
        total += (score / 5) * c.weight;
    });
    return Math.round(total);
});

const allRated = computed(() => Object.keys(scores.value).length >= EVALUATION_CRITERIA.length);

const handleScoreChange = (id: string, score: number) => {
    scores.value = { ...scores.value, [id]: score };
};

const handleSubmit = async () => {
    if (!selectedGuard.value) return;
    loading.value = true;
    try {
        await api.post('/evaluations', {
            employee_id: selectedGuard.value,
            score: totalScore.value,
            comments: comments.value,
            evaluation_date: new Date().toISOString().split('T')[0]
        });
        submitted.value = true;
        setTimeout(() => router.push('/evaluation'), 2000);
    } catch (error) {
        console.error('Failed to submit evaluation', error);
    } finally {
        loading.value = false;
    }
};

onMounted(async () => {
    try {
        const response = await api.get('/employees');
        employees.value = response.data.data?.data || response.data.data || [];
    } catch (error) {
        console.error('Failed to fetch employees:', error);
    }
});
</script>

<template>
    <div v-if="submitted" class="flex items-center justify-center min-h-[60vh]">
        <Card class-name="p-8 text-center max-w-md">
            <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
                <Check class="w-8 h-8 text-green-500" />
            </div>
            <h2 class="text-2xl font-bold text-white mb-2">Evaluation Submitted!</h2>
            <p class="text-gray-500 mb-4">
                Final Score: <span class="text-gold-500 font-bold text-2xl">{{ totalScore }}%</span>
            </p>
            <p class="text-sm text-gray-500">Redirecting to Evaluation Hub...</p>
        </Card>
    </div>

    <div v-else class="space-y-6 max-w-4xl">
        <div>
            <h1 class="text-2xl font-bold text-white flex items-center gap-2">
                <ClipboardCheck class="w-6 h-6 text-gold-500" /> New Evaluation
            </h1>
            <p class="text-gray-500">Submit a performance evaluation for a security guard</p>
        </div>

        <!-- Guard Selection -->
        <Card class-name="p-6">
            <h2 class="text-lg font-bold text-white mb-4">Select Guard</h2>
            <select
                v-model="selectedGuard"
                class="w-full px-4 py-3 bg-dark-900 border border-white/10 rounded-lg text-white"
            >
                <option value="">Select a guard...</option>
                <option v-for="g in employees" :key="g.id" :value="g.id">
                    {{ g.first_name }} {{ g.last_name }}
                </option>
            </select>
        </Card>

        <!-- Rating Criteria -->
        <Card class-name="p-6">
            <h2 class="text-lg font-bold text-white mb-4">Performance Rating</h2>
            <div class="space-y-6">
                <div v-for="criteria in EVALUATION_CRITERIA" :key="criteria.id" class="p-4 bg-dark-900/50 rounded-lg">
                    <div class="flex justify-between items-start mb-3">
                        <div>
                            <p class="text-white font-medium">{{ criteria.name }}</p>
                            <p class="text-sm text-gray-500">{{ criteria.description }}</p>
                        </div>
                        <span class="text-xs text-gold-500 bg-gold-500/10 px-2 py-1 rounded">{{ criteria.weight }}% weight</span>
                    </div>
                    <div class="flex gap-2">
                        <button
                            v-for="score in [1, 2, 3, 4, 5]"
                            :key="score"
                            @click="handleScoreChange(criteria.id, score)"
                            :class="[
                                'flex-1 py-3 rounded-lg font-bold transition-all',
                                scores[criteria.id] === score ? 'bg-gold-500 text-dark-900' : 'bg-dark-800 text-gray-400 hover:bg-dark-700'
                            ]"
                        >
                            {{ score }}
                        </button>
                    </div>
                </div>
            </div>
        </Card>

        <!-- Comments -->
        <Card class-name="p-6">
            <h2 class="text-lg font-bold text-white mb-4">Additional Comments</h2>
            <textarea
                v-model="comments"
                placeholder="Enter any additional observations or feedback..."
                class="w-full px-4 py-3 bg-dark-900 border border-white/10 rounded-lg text-white min-h-[120px] resize-none"
            ></textarea>
        </Card>

        <!-- Summary & Submit -->
        <Card class-name="p-6 bg-gradient-to-r from-gold-500/10 to-transparent">
            <div class="flex justify-between items-center">
                <div>
                    <p class="text-gray-400">Total Score</p>
                    <p class="text-4xl font-bold text-gold-500">{{ totalScore }}%</p>
                </div>
                <div class="flex gap-3">
                    <Button variant="outline" @click="router.push('/evaluation')">Cancel</Button>
                    <Button @click="handleSubmit" :disabled="!selectedGuard || !allRated || loading">
                        <Loader2 v-if="loading" class="w-4 h-4 animate-spin" />
                        <Save v-else class="w-4 h-4" />
                        Submit Evaluation
                    </Button>
                </div>
            </div>
            <div v-if="!allRated" class="mt-4 flex items-center gap-2 text-orange-400 text-sm">
                <AlertCircle class="w-4 h-4" />
                Please rate all criteria before submitting
            </div>
        </Card>
    </div>
</template>
