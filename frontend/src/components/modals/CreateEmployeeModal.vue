<script setup lang="ts">
import { ref } from 'vue';
import { X, Loader2 } from 'lucide-vue-next';
import Button from '@/components/ui/Button.vue';
import api from '@/lib/api';

const props = defineProps<{
    isOpen: boolean;
}>();

const emit = defineEmits(['close', 'refresh']);

const loading = ref(false);
const form = ref({
    first_name: '',
    last_name: '',
    employee_id: '',
    email: '',
    password: '',
    phone: '',
    position: '',
    department: '',
    status: 'active',
    date_hired: new Date().toISOString().split('T')[0]
});

const handleSubmit = async () => {
    loading.value = true;
    try {
        await api.post('/employees', form.value);
        emit('refresh');
        emit('close');
        // Reset form
        form.value = {
            first_name: '',
            last_name: '',
            employee_id: '',
            email: '',
            password: '',
            phone: '',
            position: '',
            department: '',
            status: 'active',
            date_hired: new Date().toISOString().split('T')[0]
        };
    } catch (error) {
        console.error('Failed to create employee:', error);
        alert('Failed to create employee. Please check the fields.');
    } finally {
        loading.value = false;
    }
};
</script>

<template>
    <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div class="bg-dark-800 border border-white/10 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <!-- Header -->
            <div class="flex justify-between items-center p-6 border-b border-white/10">
                <h2 class="text-xl font-bold text-white">Add New Employee</h2>
                <button @click="$emit('close')" class="text-gray-400 hover:text-white">
                    <X class="w-5 h-5" />
                </button>
            </div>

            <!-- Body -->
            <form @submit.prevent="handleSubmit" class="p-6 space-y-6">
                <div class="grid grid-cols-2 gap-6">
                    <div class="space-y-2">
                        <label class="text-sm font-medium text-gray-400">First Name</label>
                        <input v-model="form.first_name" type="text" required class="w-full px-4 py-2 bg-dark-900 border border-white/10 rounded-lg text-white focus:border-gold-500 outline-none" />
                    </div>
                    <div class="space-y-2">
                        <label class="text-sm font-medium text-gray-400">Last Name</label>
                        <input v-model="form.last_name" type="text" required class="w-full px-4 py-2 bg-dark-900 border border-white/10 rounded-lg text-white focus:border-gold-500 outline-none" />
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-6">
                    <div class="space-y-2">
                        <label class="text-sm font-medium text-gray-400">Employee ID</label>
                        <input v-model="form.employee_id" type="text" placeholder="e.g. EMP001" class="w-full px-4 py-2 bg-dark-900 border border-white/10 rounded-lg text-white focus:border-gold-500 outline-none" />
                    </div>
                    <div class="space-y-2">
                        <label class="text-sm font-medium text-gray-400">Password</label>
                        <input v-model="form.password" type="password" placeholder="Login password" class="w-full px-4 py-2 bg-dark-900 border border-white/10 rounded-lg text-white focus:border-gold-500 outline-none" />
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-6">
                    <div class="space-y-2">
                        <label class="text-sm font-medium text-gray-400">Email</label>
                        <input v-model="form.email" type="email" required class="w-full px-4 py-2 bg-dark-900 border border-white/10 rounded-lg text-white focus:border-gold-500 outline-none" />
                    </div>
                    <div class="space-y-2">
                        <label class="text-sm font-medium text-gray-400">Phone</label>
                        <input v-model="form.phone" type="tel" class="w-full px-4 py-2 bg-dark-900 border border-white/10 rounded-lg text-white focus:border-gold-500 outline-none" />
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-6">
                    <div class="space-y-2">
                        <label class="text-sm font-medium text-gray-400">Position</label>
                        <input v-model="form.position" type="text" required class="w-full px-4 py-2 bg-dark-900 border border-white/10 rounded-lg text-white focus:border-gold-500 outline-none" />
                    </div>
                    <div class="space-y-2">
                        <label class="text-sm font-medium text-gray-400">Department</label>
                        <input v-model="form.department" type="text" required class="w-full px-4 py-2 bg-dark-900 border border-white/10 rounded-lg text-white focus:border-gold-500 outline-none" />
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-6">
                    <div class="space-y-2">
                        <label class="text-sm font-medium text-gray-400">Status</label>
                        <select v-model="form.status" class="w-full px-4 py-2 bg-dark-900 border border-white/10 rounded-lg text-white focus:border-gold-500 outline-none">
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="terminated">Terminated</option>
                        </select>
                    </div>
                    <div class="space-y-2">
                        <label class="text-sm font-medium text-gray-400">Date Hired</label>
                        <input v-model="form.date_hired" type="date" required class="w-full px-4 py-2 bg-dark-900 border border-white/10 rounded-lg text-white focus:border-gold-500 outline-none" />
                    </div>
                </div>

                <!-- Footer -->
                <div class="flex justify-end gap-3 pt-4 border-t border-white/10">
                    <Button type="button" variant="outline" @click="$emit('close')">Cancel</Button>
                    <Button type="submit" variant="primary" :disabled="loading">
                        <Loader2 v-if="loading" class="w-4 h-4 mr-2 animate-spin" />
                        {{ loading ? 'Saving...' : 'Save Employee' }}
                    </Button>
                </div>
            </form>
        </div>
    </div>
</template>
