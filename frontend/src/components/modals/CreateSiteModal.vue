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
const clients = ref<any[]>([]);
const form = ref({
    client_id: '',
    name: '',
    location: '',
    status: 'active'
});

const loadClients = async () => {
    try {
        const response = await api.get('/clients');
        clients.value = response.data.data?.data || response.data.data || [];
    } catch (error) {
        console.error('Failed to load clients:', error);
    }
};

onMounted(loadClients);

const handleSubmit = async () => {
    loading.value = true;
    try {
        await api.post('/sites', form.value);
        emit('refresh');
        emit('close');
        // Reset form
        form.value = {
            client_id: '',
            name: '',
            location: '',
            status: 'active'
        };
    } catch (error) {
        console.error('Failed to create site:', error);
        alert('Failed to create site.');
    } finally {
        loading.value = false;
    }
};
</script>

<template>
    <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div class="bg-dark-800 border border-white/10 rounded-xl w-full max-w-lg shadow-2xl">
            <div class="flex justify-between items-center p-6 border-b border-white/10">
                <h2 class="text-xl font-bold text-white">Add New Site</h2>
                <button @click="$emit('close')" class="text-gray-400 hover:text-white">
                    <X class="w-5 h-5" />
                </button>
            </div>

            <form @submit.prevent="handleSubmit" class="p-6 space-y-6">
                <!-- Client Selection -->
                <div class="space-y-2">
                    <label class="text-sm font-medium text-gray-400">Client</label>
                    <select v-model="form.client_id" required class="w-full px-4 py-2 bg-dark-900 border border-white/10 rounded-lg text-white focus:border-gold-500 outline-none">
                        <option value="" disabled>Select a Client</option>
                        <option v-for="c in clients" :key="c.id" :value="c.id">
                            {{ c.name }}
                        </option>
                    </select>
                </div>

                <div class="space-y-2">
                    <label class="text-sm font-medium text-gray-400">Site Name</label>
                    <input v-model="form.name" type="text" required class="w-full px-4 py-2 bg-dark-900 border border-white/10 rounded-lg text-white focus:border-gold-500 outline-none" placeholder="e.g. Headquarters, Warehouse A" />
                </div>

                <div class="space-y-2">
                    <label class="text-sm font-medium text-gray-400">Location/Address</label>
                    <input v-model="form.location" type="text" required class="w-full px-4 py-2 bg-dark-900 border border-white/10 rounded-lg text-white focus:border-gold-500 outline-none" />
                </div>

                <div class="space-y-2">
                    <label class="text-sm font-medium text-gray-400">Status</label>
                    <select v-model="form.status" class="w-full px-4 py-2 bg-dark-900 border border-white/10 rounded-lg text-white focus:border-gold-500 outline-none">
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>

                <div class="flex justify-end gap-3 pt-4 border-t border-white/10">
                    <Button type="button" variant="outline" @click="$emit('close')">Cancel</Button>
                    <Button type="submit" variant="primary" :disabled="loading">
                        <Loader2 v-if="loading" class="w-4 h-4 mr-2 animate-spin" />
                        Save Site
                    </Button>
                </div>
            </form>
        </div>
    </div>
</template>
