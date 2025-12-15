<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Clock, MapPin, Bell, MessageSquare, Calendar, Star } from 'lucide-vue-next';
import Card from '@/components/ui/Card.vue';
import Button from '@/components/ui/Button.vue';
import api from '@/lib/api';

interface GuardStats {
    nextShift: {
        site: string;
        location: string;
        start: string;
        end: string;
    } | null;
    unreadMessages: number;
    unreadNotifications: number;
    announcements: any[];
}

const stats = ref<GuardStats>({
    nextShift: null,
    unreadMessages: 0,
    unreadNotifications: 0,
    announcements: []
});
const loading = ref(true);

const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric', 
        hour: 'numeric', 
        minute: '2-digit' 
    });
};

onMounted(async () => {
    try {
        const [statsRes, annRes] = await Promise.all([
            api.get('/dashboard/employee-stats'),
            api.get('/announcements')
        ]);
        stats.value = { 
            ...statsRes.data.data, 
            announcements: annRes.data.data || [] 
        };
    } catch (error) {
        console.error('Failed to fetch guard stats:', error);
    } finally {
        loading.value = false;
    }
});
</script>

<template>
    <div class="space-y-8">
        <div>
            <h1 class="text-2xl font-bold text-white">Employee Dashboard</h1>
            <p class="text-gray-500">Overview of your schedule and activity</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <!-- Next Shift Card -->
            <Card class-name="p-6 border-l-4 border-l-gold-500 bg-dark-800/50">
                <div class="flex items-start justify-between">
                    <div>
                        <p class="text-gray-400 text-sm font-medium uppercase tracking-wider">Next Shift</p>
                        <div v-if="stats.nextShift" class="mt-4 space-y-2">
                            <h3 class="text-xl font-bold text-white">{{ stats.nextShift.site }}</h3>
                            <div class="flex items-center gap-2 text-gray-400 text-sm">
                                <MapPin class="w-4 h-4" />
                                {{ stats.nextShift.location }}
                            </div>
                            <div class="flex items-center gap-2 text-gold-500 font-medium mt-2">
                                <Clock class="w-4 h-4" />
                                {{ formatDate(stats.nextShift.start) }}
                            </div>
                        </div>
                        <div v-else class="mt-4">
                            <p class="text-gray-500">No upcoming shifts scheduled.</p>
                        </div>
                    </div>
                    <div class="p-3 bg-gold-500/10 rounded-lg">
                        <Calendar class="w-6 h-6 text-gold-500" />
                    </div>
                </div>
            </Card>

            <!-- Quick Actions / Stats -->
            <Card class-name="p-6 border-l-4 border-l-blue-500 bg-dark-800/50">
                <div class="flex items-start justify-between">
                    <div>
                        <p class="text-gray-400 text-sm font-medium uppercase tracking-wider">Messages</p>
                        <h3 class="text-3xl font-bold text-white mt-2">{{ stats.unreadMessages }}</h3>
                        <p class="text-blue-400 text-xs mt-1">Unread messages</p>
                    </div>
                    <div class="p-3 bg-blue-500/10 rounded-lg">
                        <MessageSquare class="w-6 h-6 text-blue-500" />
                    </div>
                </div>
                <div class="mt-4 pt-4 border-t border-white/5">
                    <Button variant="outline" class="w-full text-xs" @click="$router.push('/messages')">View Inbox</Button>
                </div>
            </Card>

            <Card class-name="p-6 border-l-4 border-l-purple-500 bg-dark-800/50">
                <div class="flex items-start justify-between">
                    <div>
                        <p class="text-gray-400 text-sm font-medium uppercase tracking-wider">Notifications</p>
                        <h3 class="text-3xl font-bold text-white mt-2">{{ stats.unreadNotifications }}</h3>
                        <p class="text-purple-400 text-xs mt-1">New alerts</p>
                    </div>
                    <div class="p-3 bg-purple-500/10 rounded-lg">
                        <Bell class="w-6 h-6 text-purple-500" />
                    </div>
                </div>
            </Card>
        </div>

        <!-- Placeholder for other modules later -->
        <!-- Announcements Section -->
        <Card class-name="p-6">
            <h3 class="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Bell class="w-5 h-5 text-gold-500" />
                Latest Announcements
            </h3>
            <div v-if="stats.announcements && stats.announcements.length > 0" class="space-y-4">
                <div v-for="ann in stats.announcements" :key="ann.id" class="p-4 bg-dark-900 rounded-lg border border-white/5">
                    <div class="flex justify-between items-start mb-2">
                        <h4 class="text-white font-medium">{{ ann.title }}</h4>
                        <span :class="['text-xs px-2 py-1 rounded', ann.priority === 'high' ? 'bg-red-500/20 text-red-500' : 'bg-blue-500/20 text-blue-500']">
                            {{ ann.priority || 'Normal' }}
                        </span>
                    </div>
                    <p class="text-gray-400 text-sm">{{ ann.content }}</p>
                    <p class="text-gray-600 text-xs mt-2">{{ new Date(ann.created_at).toLocaleDateString() }}</p>
                </div>
            </div>
            <div v-else class="text-center py-8 text-gray-500">
                No new announcements.
            </div>
        </Card>
    </div>
</template>
