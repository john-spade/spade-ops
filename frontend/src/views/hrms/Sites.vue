<script setup lang="ts">
import { ref, onMounted } from 'vue';
import Card from '@/components/ui/Card.vue';
import Button from '@/components/ui/Button.vue';
import { Plus, MapPin, Building, Loader2 } from 'lucide-vue-next';
import api from '@/lib/api';
import CreateSiteModal from '@/components/modals/CreateSiteModal.vue';

interface Site {
    id: number;
    name: string;
    client: string;
    location: string;
    guards: number;
    status: string;
}

const sites = ref<Site[]>([]);
const loading = ref(false);
const showModal = ref(false);

const fetchSites = async () => {
    loading.value = true;
    try {
        const response = await api.get('/sites');
        const data = response.data.data;
        sites.value = data.map((s: any) => ({
            id: s.id,
            name: s.name,
            client: s.client ? s.client.name : 'Unknown', // mapped from relation
            location: s.location,
            guards: 0, // Placeholder, requires backend aggregation
            status: s.status.charAt(0).toUpperCase() + s.status.slice(1)
        }));
    } catch (error) {
        console.error('Failed to fetch sites:', error);
    } finally {
        loading.value = false;
    }
};

onMounted(fetchSites);

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
                <h1 class="text-2xl font-bold text-white">Sites</h1>
                <p class="text-gray-500">Manage client locations and deployments</p>
            </div>
            <Button variant="primary" class="gap-2" @click="showModal = true">
                <Plus class="w-4 h-4" />
                Add Site
            </Button>
        </div>

        <CreateSiteModal :is-open="showModal" @close="showModal = false" @refresh="fetchSites" />


        <Card class-name="overflow-hidden">
            <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse">
                    <thead>
                        <tr class="border-b border-white/10 bg-white/5">
                            <th class="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Site Name</th>
                            <th class="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Client</th>
                            <th class="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Location</th>
                            <th class="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Guards</th>
                            <th class="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                            <th class="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-white/10">
                        <tr v-for="site in sites" :key="site.id" class="hover:bg-white/5 transition-colors">
                            <td class="p-4 text-white font-medium">
                                <div class="flex items-center gap-2">
                                    <Building class="w-4 h-4 text-gold-500" />
                                    {{ site.name }}
                                </div>
                            </td>
                            <td class="p-4 text-gray-400">{{ site.client }}</td>
                            <td class="p-4 text-gray-400">
                                <div class="flex items-center gap-1">
                                    <MapPin class="w-3 h-3" /> {{ site.location }}
                                </div>
                            </td>
                            <td class="p-4 text-white font-bold">{{ site.guards }}</td>
                            <td class="p-4">
                                <span :class="['px-2 py-1 rounded-full text-xs border font-medium', getStatusClass(site.status)]">
                                    {{ site.status }}
                                </span>
                            </td>
                            <td class="p-4 text-right">
                                <Button variant="secondary" size="sm">Manage</Button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </Card>
    </div>
</template>
