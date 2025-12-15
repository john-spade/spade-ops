<script setup lang="ts">
import { ref, onMounted } from 'vue';
import Card from '@/components/ui/Card.vue';
import Button from '@/components/ui/Button.vue';
import { Download, Filter, Calendar, Loader2 } from 'lucide-vue-next';
import api from '@/lib/api';

interface AttendanceRecord {
    id: number;
    employee: string;
    date: string;
    checkIn: string;
    checkOut: string | null;
    status: string;
    location: string;
}

const attendanceLoading = ref(false);
const attendanceData = ref<AttendanceRecord[]>([]);

const formatTime = (dateStr: string | null) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const fetchAttendance = async () => {
    attendanceLoading.value = true;
    try {
        const response = await api.get('/attendance');
        const data = response.data.data;
        attendanceData.value = data.map((r: any) => ({
            id: r.id,
            employee: r.employee ? `${r.employee.first_name} ${r.employee.last_name}` : 'Unknown',
            date: r.date,
            checkIn: formatTime(r.clock_in), // formatTime handles null
            checkOut: formatTime(r.clock_out), // formatTime handles null
            status: (r.status || 'absent').charAt(0).toUpperCase() + (r.status || 'absent').slice(1),
            location: r.location || 'Main HQ'
        }));
    } catch (error) {
        console.error('Failed to fetch attendance:', error);
    } finally {
        attendanceLoading.value = false;
    }
};

onMounted(fetchAttendance);

const getStatusClass = (status: string) => {
    switch (status) {
        case 'Present': return 'bg-green-500/10 text-green-500 border-green-500/20';
        case 'Late': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
        case 'Absent': return 'bg-red-500/10 text-red-500 border-red-500/20';
        default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
};

// Current date for display
const currentMonth = new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
</script>

<template>
    <div class="space-y-6">
        <div class="flex justify-between items-center">
            <div>
                <h1 class="text-2xl font-bold text-white">Attendance</h1>
                <p class="text-gray-500">Track employee check-ins and working hours</p>
            </div>
            <div class="flex gap-3">
                <Button variant="outline" class="gap-2">
                    <Calendar class="w-4 h-4" />
                    {{ currentMonth }}
                </Button>
                <Button variant="outline" class="gap-2">
                    <Filter class="w-4 h-4" />
                    Filter
                </Button>
                <Button variant="primary" class="gap-2">
                    <Download class="w-4 h-4" />
                    Export
                </Button>
            </div>
        </div>

        <Card class-name="overflow-hidden">
            <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse">
                    <thead>
                        <tr class="border-b border-white/10 bg-white/5">
                            <th class="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Employee</th>
                            <th class="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Date</th>
                            <th class="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Check In</th>
                            <th class="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Check Out</th>
                            <th class="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Location</th>
                            <th class="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-white/10">
                        <tr v-for="record in attendanceData" :key="record.id" class="hover:bg-white/5 transition-colors">
                            <td class="p-4">
                                <div class="font-medium text-white">{{ record.employee }}</div>
                            </td>
                            <td class="p-4 text-gray-400">{{ record.date }}</td>
                            <td class="p-4 text-white">{{ record.checkIn }}</td>
                            <td class="p-4 text-white">{{ record.checkOut || '-' }}</td>
                            <td class="p-4 text-gray-400">{{ record.location }}</td>
                            <td class="p-4">
                                <span :class="['px-2 py-1 rounded-full text-xs border font-medium', getStatusClass(record.status)]">
                                    {{ record.status }}
                                </span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </Card>
    </div>
</template>
