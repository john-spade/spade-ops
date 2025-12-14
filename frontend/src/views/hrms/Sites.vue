<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import Card from '@/components/ui/Card.vue';
import Button from '@/components/ui/Button.vue';
import { Plus, MapPin, Building, Loader2, Shield, Users } from 'lucide-vue-next';
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

interface Guard {
    id: number;
    name: string;
    position: string;
    status: string;
}

const sites = ref<Site[]>([]);
const securityGuards = ref<Guard[]>([]);
const loading = ref(false);
const showModal = ref(false);

const fetchSites = async () => {
    loading.value = true;
    try {
        const [sitesRes, employeesRes] = await Promise.all([
            api.get('/sites'),
            api.get('/employees')
        ]);
        
        const sitesData = sitesRes.data.data || [];
        const employees = employeesRes.data.data || [];
        
        // Filter for security guards
        securityGuards.value = employees
            .filter((e: any) => e.position?.toLowerCase().includes('security') || e.position?.toLowerCase().includes('guard'))
            .map((e: any) => ({
                id: e.id,
                name: `${e.first_name} ${e.last_name}`,
                position: e.position,
                status: e.status
            }));
        
        sites.value = sitesData.map((s: any) => ({
            id: s.id,
            name: s.name,
            client: s.client ? s.client.name : 'Unknown',
            location: s.location,
            guards: s.guard_count || 0,
            status: s.status.charAt(0).toUpperCase() + s.status.slice(1)
        }));
    } catch (error) {
        console.error('Failed to fetch sites:', error);
    } finally {
        loading.value = false;
    }
};

const activeGuards = computed(() => securityGuards.value.filter(g => g.status === 'active'));

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

        <!-- Security Guards Summary -->
        <Card v-if="securityGuards.length > 0" class-name="p-5">
            <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-3">
                    <div class="p-3 bg-gold-500/10 rounded-lg">
                        <Shield class="w-6 h-6 text-gold-500" />
                    </div>
                    <div>
                        <h3 class="text-lg font-bold text-white">Security Guards</h3>
                        <p class="text-sm text-gray-500">{{ activeGuards.length }} active / {{ securityGuards.length }} total</p>
                    </div>
                </div>
            </div>
            <div class="flex flex-wrap gap-2">
                <div 
                    v-for="guard in activeGuards.slice(0, 8)" 
                    :key="guard.id"
                    class="flex items-center gap-2 px-3 py-2 bg-dark-900 rounded-lg border border-white/10"
                >
                    <div class="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center text-green-500 text-xs font-bold">
                        {{ guard.name.charAt(0) }}
                    </div>
                    <span class="text-sm text-white">{{ guard.name }}</span>
                </div>
                <div v-if="activeGuards.length > 8" class="flex items-center px-3 py-2 text-sm text-gray-500">
                    +{{ activeGuards.length - 8 }} more
                </div>
            </div>
        </Card>

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
