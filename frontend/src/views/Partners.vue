<script setup lang="ts">
import { ref } from 'vue';
import Card from '@/components/ui/Card.vue';
import Button from '@/components/ui/Button.vue';
import { Plus, Users2, Phone, Mail } from 'lucide-vue-next';

interface Partner {
    id: number;
    name: string;
    type: string;
    contactPerson: string;
    email: string;
    phone: string;
    status: 'Active' | 'Inactive';
}

const partners = ref<Partner[]>([
    { id: 1, name: 'Security Gear Suppliers Ltd', type: 'Supplier', contactPerson: 'Alice Cooper', email: 'alice@gear.com', phone: '+1 234 567 890', status: 'Active' },
    { id: 2, name: 'Tech Solutions Inc', type: 'IT Vendor', contactPerson: 'Bob Ross', email: 'bob@tech.com', phone: '+1 987 654 321', status: 'Active' },
    { id: 3, name: 'City Law Firm', type: 'Legal', contactPerson: 'Charlie Day', email: 'charlie@law.com', phone: '+1 555 555 555', status: 'Active' },
]);

const getStatusClass = (status: string) => {
    return status === 'Active' 
        ? 'bg-green-500/10 text-green-500 border-green-500/20' 
        : 'bg-red-500/10 text-red-500 border-red-500/20';
};
</script>

<template>
    <div class="space-y-6">
        <div class="flex justify-between items-center">
            <div>
                <h1 class="text-2xl font-bold text-white">Partners</h1>
                <p class="text-gray-500">Manage external vendors and partners</p>
            </div>
            <Button variant="primary" class="gap-2">
                <Plus class="w-4 h-4" />
                Add Partner
            </Button>
        </div>

        <Card class-name="overflow-hidden">
            <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse">
                    <thead>
                        <tr class="border-b border-white/10 bg-white/5">
                            <th class="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Partner Name</th>
                            <th class="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Type</th>
                            <th class="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Contact Person</th>
                            <th class="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Contact Info</th>
                            <th class="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                            <th class="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-white/10">
                        <tr v-for="partner in partners" :key="partner.id" class="hover:bg-white/5 transition-colors">
                            <td class="p-4 text-white font-medium">
                                <div class="flex items-center gap-2">
                                    <Users2 class="w-4 h-4 text-gold-500" />
                                    {{ partner.name }}
                                </div>
                            </td>
                            <td class="p-4 text-gray-400">{{ partner.type }}</td>
                            <td class="p-4 text-white">{{ partner.contactPerson }}</td>
                            <td class="p-4 text-gray-400">
                                <div class="flex flex-col text-xs">
                                    <span class="flex items-center gap-1"><Mail class="w-3 h-3" /> {{ partner.email }}</span>
                                    <span class="flex items-center gap-1 mt-1"><Phone class="w-3 h-3" /> {{ partner.phone }}</span>
                                </div>
                            </td>
                            <td class="p-4">
                                <span :class="['px-2 py-1 rounded-full text-xs border font-medium', getStatusClass(partner.status)]">
                                    {{ partner.status }}
                                </span>
                            </td>
                            <td class="p-4 text-right">
                                <Button variant="secondary" size="sm">Edit</Button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </Card>
    </div>
</template>
