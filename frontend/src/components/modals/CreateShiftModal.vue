<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { X, Loader2 } from 'lucide-vue-next';
import Button from '@/components/ui/Button.vue';
import api from '@/lib/api';

const props = defineProps<{
    isOpen: boolean;
}>();

const emit = defineEmits(['close', 'refresh']);

const loading = ref(false);
const employees = ref<any[]>([]);
const sites = ref<any[]>([]);

const form = ref({
    employee_id: '',
    site_id: '',
    start_time: '',
    end_time: '',
    status: 'scheduled',
    guaranteed_hours: 8
});

const loadOptions = async () => {
    try {
        const [empRes, siteRes] = await Promise.all([
            api.get('/employees'),
            api.get('/sites')
        ]);
        employees.value = empRes.data.data?.data || empRes.data.data || [];
        sites.value = siteRes.data.data?.data || siteRes.data.data || [];
    } catch (error) {
        console.error('Failed to load options:', error);
    }
};

onMounted(loadOptions);

const handleSubmit = async () => {
    loading.value = true;
    try {
        await api.post('/shifts', form.value);
        emit('refresh');
        emit('close');
        // Reset form partial
        form.value.start_time = '';
        form.value.end_time = '';
    } catch (error) {
        console.error('Failed to create shift:', error);
        alert('Failed to create shift.');
    } finally {
        loading.value = false;
    }
};
</script>

<template>
    <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div class="bg-dark-800 border border-white/10 rounded-xl w-full max-w-lg shadow-2xl">
            <div class="flex justify-between items-center p-6 border-b border-white/10">
                <h2 class="text-xl font-bold text-white">Assign Shift</h2>
                <button @click="$emit('close')" class="text-gray-400 hover:text-white">
                    <X class="w-5 h-5" />
                </button>
            </div>

            <form @submit.prevent="handleSubmit" class="p-6 space-y-6">
                <div class="space-y-2">
                    <label class="text-sm font-medium text-gray-400">Employee</label>
                    <select v-model="form.employee_id" required class="w-full px-4 py-2 bg-dark-900 border border-white/10 rounded-lg text-white focus:border-gold-500 outline-none">
                        <option value="" disabled>Select Employee</option>
                        <option v-for="e in employees" :key="e.id" :value="e.id">
                            {{ e.first_name }} {{ e.last_name }}
                        </option>
                    </select>
                </div>

                <div class="space-y-2">
                    <label class="text-sm font-medium text-gray-400">Site</label>
                    <select v-model="form.site_id" required class="w-full px-4 py-2 bg-dark-900 border border-white/10 rounded-lg text-white focus:border-gold-500 outline-none">
                        <option value="" disabled>Select Site</option>
                        <option v-for="s in sites" :key="s.id" :value="s.id">
                            {{ s.name }}
                        </option>
                    </select>
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div class="space-y-2">
                        <label class="text-sm font-medium text-gray-400">Start Time</label>
                        <input v-model="form.start_time" type="datetime-local" required class="w-full px-4 py-2 bg-dark-900 border border-white/10 rounded-lg text-white focus:border-gold-500 outline-none" />
                    </div>
                    <div class="space-y-2">
                        <label class="text-sm font-medium text-gray-400">End Time</label>
                        <input v-model="form.end_time" type="datetime-local" required class="w-full px-4 py-2 bg-dark-900 border border-white/10 rounded-lg text-white focus:border-gold-500 outline-none" />
                    </div>
                </div>

                <div class="space-y-2">
                    <label class="text-sm font-medium text-gray-400">Status</label>
                    <select v-model="form.status" class="w-full px-4 py-2 bg-dark-900 border border-white/10 rounded-lg text-white focus:border-gold-500 outline-none">
                        <option value="scheduled">Scheduled</option>
                        <option value="completed">Completed</option>
                        <option value="missed">Missed</option>
                    </select>
                </div>

                <div class="flex justify-end gap-3 pt-4 border-t border-white/10">
                    <Button type="button" variant="outline" @click="$emit('close')">Cancel</Button>
                    <Button type="submit" variant="primary" :disabled="loading">
                        <Loader2 v-if="loading" class="w-4 h-4 mr-2 animate-spin" />
                        Assign
                    </Button>
                </div>
            </form>
        </div>
    </div>
</template>
