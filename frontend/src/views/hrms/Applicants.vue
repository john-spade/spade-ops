<script setup lang="ts">
import { ref } from 'vue';
import Card from '@/components/ui/Card.vue';
import Button from '@/components/ui/Button.vue';
import { UserPlus, FileText, CheckCircle } from 'lucide-vue-next';

interface Applicant {
    id: number;
    name: string;
    position: string;
    appliedDate: string;
    status: 'New' | 'Interview' | 'Rejected' | 'Hired';
    email: string;
}

const applicants = ref<Applicant[]>([
    { id: 1, name: 'David Wilson', position: 'Security Officer', appliedDate: 'Oct 25, 2023', status: 'New', email: 'david@example.com' },
    { id: 2, name: 'Emily Davis', position: 'HR Manager', appliedDate: 'Oct 24, 2023', status: 'Interview', email: 'emily@example.com' },
    { id: 3, name: 'James Miller', position: 'Guard', appliedDate: 'Oct 20, 2023', status: 'Rejected', email: 'james@example.com' },
]);

const getStatusClass = (status: string) => {
    switch (status) {
        case 'New': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
        case 'Interview': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
        case 'Hired': return 'bg-green-500/10 text-green-500 border-green-500/20';
        default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
};
</script>

<template>
    <div class="space-y-6">
        <div class="flex justify-between items-center">
            <div>
                <h1 class="text-2xl font-bold text-white">Applicants</h1>
                <p class="text-gray-500">Track and manage job applications</p>
            </div>
            <Button variant="primary" class="gap-2">
                <UserPlus class="w-4 h-4" />
                Add Applicant
            </Button>
        </div>

        <Card class-name="overflow-hidden">
            <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse">
                    <thead>
                        <tr class="border-b border-white/10 bg-white/5">
                            <th class="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Applicant</th>
                            <th class="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Position</th>
                            <th class="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Applied Date</th>
                            <th class="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                            <th class="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-white/10">
                        <tr v-for="app in applicants" :key="app.id" class="hover:bg-white/5 transition-colors">
                            <td class="p-4">
                                <div class="font-medium text-white">{{ app.name }}</div>
                                <div class="text-xs text-gray-500">{{ app.email }}</div>
                            </td>
                            <td class="p-4 text-gray-400">{{ app.position }}</td>
                            <td class="p-4 text-gray-400">{{ app.appliedDate }}</td>
                            <td class="p-4">
                                <span :class="['px-2 py-1 rounded-full text-xs border font-medium', getStatusClass(app.status)]">
                                    {{ app.status }}
                                </span>
                            </td>
                            <td class="p-4 text-right flex justify-end gap-2">
                                <Button variant="secondary" size="sm">
                                    <FileText class="w-3 h-3" />
                                </Button>
                                <Button variant="primary" size="sm" v-if="app.status === 'New'">
                                    <CheckCircle class="w-3 h-3" />
                                </Button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </Card>
    </div>
</template>
