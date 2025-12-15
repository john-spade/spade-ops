<script setup lang="ts">
import { ref } from 'vue';
import { X, Loader2 } from 'lucide-vue-next';
import Button from '@/components/ui/Button.vue';
import api from '@/lib/api';

defineProps<{
    isOpen: boolean;
}>();

const emit = defineEmits(['close', 'refresh']);

const loading = ref(false);
const form = ref({
    name: '',
    type: 'Vendor',
    contact_person: '',
    email: '',
    phone: '',
    services: '',
    status: 'active'
});

const handleSubmit = async () => {
    loading.value = true;
    try {
        await api.post('/partners', form.value);
        emit('refresh');
        emit('close');
        // Reset form
        form.value = {
            name: '',
            type: 'Vendor',
            contact_person: '',
            email: '',
            phone: '',
            services: '',
            status: 'active'
        };
    } catch (error) {
        console.error('Failed to create partner:', error);
        alert('Failed to create partner.');
    } finally {
        loading.value = false;
    }
};
</script>

<template>
    <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div class="bg-dark-800 border border-white/10 rounded-xl w-full max-w-lg shadow-2xl">
            <!-- Header -->
            <div class="flex justify-between items-center p-6 border-b border-white/10">
                <h2 class="text-xl font-bold text-white">Add New Partner</h2>
                <button @click="$emit('close')" class="text-gray-400 hover:text-white">
                    <X class="w-5 h-5" />
                </button>
            </div>

            <!-- Body -->
            <form @submit.prevent="handleSubmit" class="p-6 space-y-6">
                <div class="space-y-4">
                    <div class="space-y-2">
                        <label class="text-sm font-medium text-gray-400">Partner/Company Name</label>
                        <input v-model="form.name" type="text" required class="w-full px-4 py-2 bg-dark-900 border border-white/10 rounded-lg text-white focus:border-gold-500 outline-none" placeholder="e.g. Acme Supplies" />
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div class="space-y-2">
                            <label class="text-sm font-medium text-gray-400">Type</label>
                            <select v-model="form.type" class="w-full px-4 py-2 bg-dark-900 border border-white/10 rounded-lg text-white focus:border-gold-500 outline-none">
                                <option value="Vendor">Vendor</option>
                                <option value="Partner">Partner</option>
                                <option value="Contractor">Contractor</option>
                            </select>
                        </div>
                         <div class="space-y-2">
                            <label class="text-sm font-medium text-gray-400">Contact Person</label>
                            <input v-model="form.contact_person" type="text" class="w-full px-4 py-2 bg-dark-900 border border-white/10 rounded-lg text-white focus:border-gold-500 outline-none" />
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div class="space-y-2">
                            <label class="text-sm font-medium text-gray-400">Email</label>
                            <input v-model="form.email" type="email" class="w-full px-4 py-2 bg-dark-900 border border-white/10 rounded-lg text-white focus:border-gold-500 outline-none" />
                        </div>
                        <div class="space-y-2">
                            <label class="text-sm font-medium text-gray-400">Phone</label>
                            <input v-model="form.phone" type="tel" class="w-full px-4 py-2 bg-dark-900 border border-white/10 rounded-lg text-white focus:border-gold-500 outline-none" />
                        </div>
                    </div>
                </div>

                <!-- Footer -->
                <div class="flex justify-end gap-3 pt-4 border-t border-white/10">
                    <Button type="button" variant="outline" @click="$emit('close')">Cancel</Button>
                    <Button type="submit" variant="primary" :disabled="loading">
                        <Loader2 v-if="loading" class="w-4 h-4 mr-2 animate-spin" />
                        {{ loading ? 'Saving...' : 'Add Partner' }}
                    </Button>
                </div>
            </form>
        </div>
    </div>
</template>
