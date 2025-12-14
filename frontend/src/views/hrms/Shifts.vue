<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import Card from '@/components/ui/Card.vue';
import Button from '@/components/ui/Button.vue';
import { Calendar, Clock, MapPin, Loader2, Shield, Users } from 'lucide-vue-next';
import api from '@/lib/api';
import CreateShiftModal from '@/components/modals/CreateShiftModal.vue';

interface Shift {
    id: number;
    employee: string;
    site: string;
    date: string;
    time: string;
    status: string;
}

interface Guard {
    id: number;
    name: string;
    position: string;
    status: string;
}

const shifts = ref<Shift[]>([]);
const securityGuards = ref<Guard[]>([]);
const loading = ref(false);
const showModal = ref(false);

const formatTimeRange = (start: string, end: string) => {
    const startTime = new Date(start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const endTime = new Date(end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `${startTime} - ${endTime}`;
};

const fetchShifts = async () => {
    loading.value = true;
    try {
        const [shiftsRes, employeesRes] = await Promise.all([
            api.get('/shifts'),
            api.get('/employees')
        ]);
        
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
        
        const data = shiftsRes.data.data || [];
        shifts.value = data.map((s: any) => ({
            id: s.id,
            employee: s.employee ? `${s.employee.first_name} ${s.employee.last_name}` : 'Unknown',
            site: s.site ? s.site.name : 'Unknown',
            date: new Date(s.start_time).toLocaleDateString(),
            time: formatTimeRange(s.start_time, s.end_time),
            status: s.status.charAt(0).toUpperCase() + s.status.slice(1)
        }));
    } catch (error) {
        console.error('Failed to fetch shifts:', error);
    } finally {
        loading.value = false;
    }
};

const activeGuards = computed(() => securityGuards.value.filter(g => g.status === 'active'));

onMounted(fetchShifts);

const getStatusClass = (status: string) => {
    switch (status) {
        case 'Scheduled': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
        case 'Completed': return 'bg-green-500/10 text-green-500 border-green-500/20';
        case 'Missed': return 'bg-red-500/10 text-red-500 border-red-500/20';
        default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
};
</script>

<template>
    <div class="space-y-6">
        <div class="flex justify-between items-center">
            <div>
                <h1 class="text-2xl font-bold text-white">Shifts</h1>
                <p class="text-gray-500">Manage employee schedules and assignments</p>
            </div>
            <div class="flex gap-3">
                 <Button variant="outline" class="gap-2">
                    <Calendar class="w-4 h-4" />
                    Oct 27
                </Button>
                <Button variant="primary" class="gap-2" @click="showModal = true">
                    <Clock class="w-4 h-4" />
                    Assign Shift
                </Button>
            </div>
        </div>

        <CreateShiftModal :is-open="showModal" @close="showModal = false" @refresh="fetchShifts" />

        <!-- Available Security Guards -->
        <Card v-if="activeGuards.length > 0" class-name="p-5">
            <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-3">
                    <div class="p-3 bg-blue-500/10 rounded-lg">
                        <Shield class="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                        <h3 class="text-lg font-bold text-white">Available Guards</h3>
                        <p class="text-sm text-gray-500">{{ activeGuards.length }} guards can be assigned</p>
                    </div>
                </div>
            </div>
            <div class="flex flex-wrap gap-2">
                <div 
                    v-for="guard in activeGuards.slice(0, 10)" 
                    :key="guard.id"
                    class="flex items-center gap-2 px-3 py-2 bg-dark-900 rounded-lg border border-white/10 hover:border-blue-500/30 cursor-pointer transition-colors"
                >
                    <div class="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500 text-xs font-bold">
                        {{ guard.name.charAt(0) }}
                    </div>
                    <span class="text-sm text-white">{{ guard.name }}</span>
                </div>
                <div v-if="activeGuards.length > 10" class="flex items-center px-3 py-2 text-sm text-gray-500">
                    +{{ activeGuards.length - 10 }} more
                </div>
            </div>
        </Card>

        <Card class-name="overflow-hidden">
            <div v-if="loading" class="flex justify-center items-center py-12">
                <Loader2 class="w-8 h-8 text-gold-500 animate-spin" />
            </div>
            <div v-else class="overflow-x-auto">
                <table class="w-full text-left border-collapse">
                    <thead>
                        <tr class="border-b border-white/10 bg-white/5">
                            <th class="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Employee</th>
                            <th class="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Site</th>
                            <th class="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Date & Time</th>
                            <th class="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                            <th class="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-white/10">
                        <tr v-for="shift in shifts" :key="shift.id" class="hover:bg-white/5 transition-colors">
                            <td class="p-4 text-white font-medium">{{ shift.employee }}</td>
                            <td class="p-4 text-gray-400">
                                <div class="flex items-center gap-1">
                                    <MapPin class="w-3 h-3" /> {{ shift.site }}
                                </div>
                            </td>
                            <td class="p-4 text-gray-400">
                                <div>{{ shift.date }}</div>
                                <div class="text-xs">{{ shift.time }}</div>
                            </td>
                            <td class="p-4">
                                <span :class="['px-2 py-1 rounded-full text-xs border font-medium', getStatusClass(shift.status)]">
                                    {{ shift.status }}
                                </span>
                            </td>
                            <td class="p-4 text-right">
                                <Button variant="secondary" size="sm">Edit</Button>
                            </td>
                        </tr>
                        <tr v-if="shifts.length === 0">
                            <td colspan="5" class="px-6 py-12 text-center text-gray-500">No shifts found</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </Card>
    </div>
</template>
