<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import Card from '@/components/ui/Card.vue';
import { Building2, User, Mail, Phone, MapPin, Calendar } from 'lucide-vue-next';
import api from '@/lib/api';

const route = useRoute();
const client = ref<any>(null);
const loading = ref(true);

onMounted(async () => {
    try {
        const response = await api.get(`/clients/${route.params.id}`);
        client.value = response.data.data;
    } catch (error) {
        console.error('Failed to fetch client:', error);
    } finally {
        loading.value = false;
    }
});
</script>

<template>
    <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="animate-spin w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full"></div>
    </div>
    <div v-else-if="client" class="space-y-6">
        <Card class-name="p-6">
            <div class="flex items-center gap-6">
                <div class="w-20 h-20 rounded-lg bg-gold-500/10 flex items-center justify-center">
                    <Building2 class="w-10 h-10 text-gold-500" />
                </div>
                <div>
                    <h1 class="text-2xl font-bold text-white">{{ client.name }}</h1>
                    <p class="text-gray-500">{{ client.contact_person }}</p>
                </div>
            </div>
        </Card>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card class-name="p-6">
                <h3 class="text-lg font-bold text-white mb-4">Contact Information</h3>
                <div class="space-y-4">
                    <div class="flex items-center gap-3">
                        <User class="w-5 h-5 text-gray-500" />
                        <span class="text-gray-400">{{ client.contact_person }}</span>
                    </div>
                    <div class="flex items-center gap-3">
                        <Mail class="w-5 h-5 text-gray-500" />
                        <span class="text-gray-400">{{ client.email }}</span>
                    </div>
                    <div class="flex items-center gap-3">
                        <Phone class="w-5 h-5 text-gray-500" />
                        <span class="text-gray-400">{{ client.phone }}</span>
                    </div>
                    <div class="flex items-center gap-3">
                        <MapPin class="w-5 h-5 text-gray-500" />
                        <span class="text-gray-400">{{ client.address }}</span>
                    </div>
                </div>
            </Card>

            <Card class-name="p-6">
                <h3 class="text-lg font-bold text-white mb-4">Contract Details</h3>
                <div class="space-y-4">
                    <div class="flex items-center gap-3">
                        <Calendar class="w-5 h-5 text-gray-500" />
                        <span class="text-gray-400">Start: {{ client.contract_start }}</span>
                    </div>
                    <div class="flex items-center gap-3">
                        <Calendar class="w-5 h-5 text-gray-500" />
                        <span class="text-gray-400">End: {{ client.contract_end || 'Ongoing' }}</span>
                    </div>
                </div>
            </Card>
        </div>
    </div>
    <div v-else class="text-center py-12 text-gray-500">Client not found</div>
</template>
