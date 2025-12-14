<script setup lang="ts">
import { ref, onMounted } from 'vue';
import Card from '@/components/ui/Card.vue';
import Button from '@/components/ui/Button.vue';
import { Trash2, Loader2, Shield, UserCheck } from 'lucide-vue-next';
import api from '@/lib/api';

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    created_at: string;
}

const users = ref<User[]>([]);
const loading = ref(true);

const fetchUsers = async () => {
    loading.value = true;
    try {
        const response = await api.get('/users');
        users.value = response.data.data || [];
    } catch (error) {
        console.error('Failed to fetch users:', error);
        users.value = [];
    } finally {
        loading.value = false;
    }
};

const deleteUser = async (id: number) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
        await api.delete(`/users/${id}`);
        await fetchUsers();
    } catch (error) {
        console.error('Failed to delete user:', error);
    }
};

const getRoleBadge = (role: string) => {
    switch (role) {
        case 'admin': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
        case 'supervisor': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
        case 'employee': return 'bg-green-500/10 text-green-500 border-green-500/20';
        case 'client': return 'bg-gold-500/10 text-gold-500 border-gold-500/20';
        default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
};

onMounted(fetchUsers);
</script>

<template>
    <div class="space-y-6">
        <div class="flex justify-between items-center">
            <div>
                <h1 class="text-2xl font-bold text-white">Users</h1>
                <p class="text-gray-500">Manage system user accounts</p>
            </div>
        </div>

        <Card class-name="overflow-hidden">
            <div v-if="loading" class="flex justify-center items-center py-12">
                <Loader2 class="w-8 h-8 text-gold-500 animate-spin" />
            </div>
            <table v-else class="w-full">
                <thead class="bg-dark-900">
                    <tr>
                        <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                        <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                        <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                        <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                        <th class="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="user in users" :key="user.id" class="table-row">
                        <td class="px-6 py-4">
                            <div class="flex items-center gap-3">
                                <div class="w-8 h-8 rounded-full bg-gold-500/20 flex items-center justify-center text-gold-500 font-bold text-sm">
                                    {{ user.name?.charAt(0)?.toUpperCase() || 'U' }}
                                </div>
                                <span class="text-white font-medium">{{ user.name }}</span>
                            </div>
                        </td>
                        <td class="px-6 py-4 text-gray-400">{{ user.email }}</td>
                        <td class="px-6 py-4">
                            <span :class="['px-2 py-1 rounded-full text-xs border font-medium capitalize', getRoleBadge(user.role)]">
                                {{ user.role }}
                            </span>
                        </td>
                        <td class="px-6 py-4 text-gray-500 text-sm">{{ new Date(user.created_at).toLocaleDateString() }}</td>
                        <td class="px-6 py-4 text-right">
                            <button 
                                @click="deleteUser(user.id)" 
                                class="p-2 hover:bg-red-500/10 rounded-lg text-gray-400 hover:text-red-400"
                            >
                                <Trash2 class="w-4 h-4" />
                            </button>
                        </td>
                    </tr>
                    <tr v-if="users.length === 0">
                        <td colspan="5" class="px-6 py-12 text-center text-gray-500">No users found</td>
                    </tr>
                </tbody>
            </table>
        </Card>
    </div>
</template>
