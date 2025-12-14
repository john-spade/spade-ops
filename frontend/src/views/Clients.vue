<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import Card from '@/components/ui/Card.vue';
import Button from '@/components/ui/Button.vue';
import { Plus, Search, Eye, Loader2, Building2 } from 'lucide-vue-next';
import api from '@/lib/api';
import CreateClientModal from '@/components/modals/CreateClientModal.vue';

interface Client {
    id: number;
    name: string;
    contact_person: string;
    email: string;
    phone: string;
    address: string;
    contract_start: string;
    contract_end: string;
}

const router = useRouter();
const clients = ref<Client[]>([]);
const loading = ref(true);
const search = ref('');
const showModal = ref(false);

const fetchClients = async () => {
    loading.value = true;
    try {
        const response = await api.get('/clients');
        clients.value = response.data.data?.data || response.data.data || [];
    } catch (error) {
        console.error('Failed to fetch clients:', error);
    } finally {
        loading.value = false;
    }
};

const filteredClients = () => {
    if (!search.value) return clients.value;
    const q = search.value.toLowerCase();
    return clients.value.filter(c => c.name.toLowerCase().includes(q));
};

const navigateToDetail = (id: number) => {
    router.push(`/clients/${id}`);
};

onMounted(fetchClients);
</script>

<template>
    <div class="space-y-6">
        <div class="flex justify-between items-center">
            <div>
                <h1 class="text-2xl font-bold text-white">Clients</h1>
                <p class="text-gray-500">Manage your client relationships</p>
            </div>
            <Button @click="showModal = true">
                <Plus class="w-4 h-4" /> Add Client
            </Button>
        </div>

        <CreateClientModal :is-open="showModal" @close="showModal = false" @refresh="fetchClients" />


        <!-- Search -->
        <Card class-name="p-4">
            <div class="relative">
                <Search class="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                <input
                    v-model="search"
                    type="text"
                    placeholder="Search clients..."
                    class="w-full pl-10 pr-4 py-3 bg-dark-900 border border-white/10 rounded-lg text-white focus:outline-none focus:border-gold-500"
                />
            </div>
        </Card>

        <!-- Grid -->
        <div v-if="loading" class="flex justify-center items-center py-12">
            <Loader2 class="w-8 h-8 text-gold-500 animate-spin" />
        </div>
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card 
                v-for="client in filteredClients()" 
                :key="client.id" 
                class-name="p-6 hover:border-gold-500/30 transition-colors cursor-pointer"
                @click="navigateToDetail(client.id)"
            >
                <div class="flex items-start gap-4">
                    <div class="w-12 h-12 rounded-lg bg-gold-500/10 flex items-center justify-center">
                        <Building2 class="w-6 h-6 text-gold-500" />
                    </div>
                    <div class="flex-1">
                        <h3 class="text-lg font-bold text-white">{{ client.name }}</h3>
                        <p class="text-gray-500 text-sm">{{ client.contact_person }}</p>
                        <p class="text-gray-600 text-xs mt-1">{{ client.email }}</p>
                    </div>
                </div>
                <div class="mt-4 pt-4 border-t border-white/10 flex justify-between items-center" @click.stop>
                    <span class="text-xs text-gray-500">Since {{ client.contract_start }}</span>
                    <RouterLink :to="`/clients/${client.id}`">
                        <button class="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white">
                            <Eye class="w-4 h-4" />
                        </button>
                    </RouterLink>
                </div>
            </Card>
            <div v-if="filteredClients().length === 0" class="col-span-full text-center py-12 text-gray-500">
                No clients found
            </div>
        </div>
    </div>
</template>
