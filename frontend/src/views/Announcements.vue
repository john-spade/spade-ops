<script setup lang="ts">
import { ref, onMounted } from 'vue';
import Card from '@/components/ui/Card.vue';
import Button from '@/components/ui/Button.vue';
import { Bell, Plus, Trash2, Loader2, Megaphone } from 'lucide-vue-next';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/auth';

interface Announcement {
    id: number;
    title: string;
    content: string;
    priority: string;
    created_at: string;
}

const authStore = useAuthStore();
const announcements = ref<Announcement[]>([]);
const loading = ref(true);
const showForm = ref(false);
const saving = ref(false);

const newAnnouncement = ref({
    title: '',
    content: '',
    priority: 'normal'
});

const fetchAnnouncements = async () => {
    loading.value = true;
    try {
        const response = await api.get('/announcements');
        announcements.value = response.data.data?.data || response.data.data || [];
    } catch (error) {
        console.error('Failed to fetch announcements:', error);
        announcements.value = [];
    } finally {
        loading.value = false;
    }
};

const createAnnouncement = async () => {
    if (!newAnnouncement.value.title || !newAnnouncement.value.content) return;
    
    saving.value = true;
    try {
        await api.post('/announcements', newAnnouncement.value);
        newAnnouncement.value = { title: '', content: '', priority: 'normal' };
        showForm.value = false;
        await fetchAnnouncements();
    } catch (error) {
        console.error('Failed to create announcement:', error);
        alert('Failed to create announcement');
    } finally {
        saving.value = false;
    }
};

const deleteAnnouncement = async (id: number) => {
    if (!confirm('Delete this announcement?')) return;
    try {
        await api.delete(`/announcements/${id}`);
        await fetchAnnouncements();
    } catch (error) {
        console.error('Failed to delete announcement:', error);
    }
};

const getPriorityClass = (priority: string) => {
    switch (priority) {
        case 'high': return 'bg-red-500/10 text-red-500 border-red-500/20';
        case 'normal': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
        case 'low': return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
        default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
};

const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

const isAdmin = authStore.user?.role === 'admin';

onMounted(fetchAnnouncements);
</script>

<template>
    <div class="space-y-6">
        <div class="flex justify-between items-center">
            <div>
                <h1 class="text-2xl font-bold text-white">Announcements</h1>
                <p class="text-gray-500">Company-wide announcements and updates</p>
            </div>
            <Button v-if="isAdmin" @click="showForm = !showForm" class="gap-2">
                <Plus class="w-4 h-4" />
                New Announcement
            </Button>
        </div>

        <!-- Create Form -->
        <Card v-if="showForm && isAdmin" class-name="p-6">
            <h2 class="text-lg font-bold text-white mb-4">Create Announcement</h2>
            <form @submit.prevent="createAnnouncement" class="space-y-4">
                <div>
                    <label class="text-sm text-gray-400 block mb-1">Title</label>
                    <input 
                        v-model="newAnnouncement.title" 
                        type="text"
                        required
                        placeholder="Announcement title..."
                        class="w-full px-4 py-2 bg-dark-900 border border-white/10 rounded-lg text-white focus:border-gold-500 outline-none"
                    />
                </div>
                <div>
                    <label class="text-sm text-gray-400 block mb-1">Content</label>
                    <textarea 
                        v-model="newAnnouncement.content" 
                        rows="4"
                        required
                        placeholder="Announcement details..."
                        class="w-full px-4 py-2 bg-dark-900 border border-white/10 rounded-lg text-white focus:border-gold-500 outline-none resize-none"
                    ></textarea>
                </div>
                <div>
                    <label class="text-sm text-gray-400 block mb-1">Priority</label>
                    <select 
                        v-model="newAnnouncement.priority"
                        class="w-full px-4 py-2 bg-dark-900 border border-white/10 rounded-lg text-white focus:border-gold-500 outline-none"
                    >
                        <option value="low">Low</option>
                        <option value="normal">Normal</option>
                        <option value="high">High (Urgent)</option>
                    </select>
                </div>
                <div class="flex justify-end gap-3">
                    <Button type="button" variant="secondary" @click="showForm = false">Cancel</Button>
                    <Button type="submit" :disabled="saving">
                        <Loader2 v-if="saving" class="w-4 h-4 mr-2 animate-spin" />
                        {{ saving ? 'Posting...' : 'Post Announcement' }}
                    </Button>
                </div>
            </form>
        </Card>

        <!-- Announcements List -->
        <div v-if="loading" class="flex justify-center py-12">
            <Loader2 class="w-8 h-8 text-gold-500 animate-spin" />
        </div>
        
        <div v-else-if="announcements.length === 0" class="text-center py-16">
            <Megaphone class="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p class="text-gray-500 text-lg">No announcements yet</p>
            <p v-if="isAdmin" class="text-gray-600 text-sm mt-1">Create the first announcement using the button above</p>
        </div>

        <div v-else class="space-y-4">
            <Card 
                v-for="ann in announcements" 
                :key="ann.id" 
                :class-name="`p-6 ${ann.priority === 'high' ? 'border-l-4 border-l-red-500' : ''}`"
            >
                <div class="flex justify-between items-start">
                    <div class="flex-1">
                        <div class="flex items-center gap-3 mb-2">
                            <h3 class="text-lg font-bold text-white">{{ ann.title }}</h3>
                            <span :class="['px-2 py-0.5 rounded-full text-xs border font-medium capitalize', getPriorityClass(ann.priority)]">
                                {{ ann.priority }}
                            </span>
                        </div>
                        <p class="text-gray-400 whitespace-pre-wrap">{{ ann.content }}</p>
                        <p class="text-xs text-gray-600 mt-3">{{ formatDate(ann.created_at) }}</p>
                    </div>
                    <button 
                        v-if="isAdmin"
                        @click="deleteAnnouncement(ann.id)"
                        class="p-2 hover:bg-red-500/10 rounded-lg text-gray-400 hover:text-red-400 transition-colors"
                    >
                        <Trash2 class="w-4 h-4" />
                    </button>
                </div>
            </Card>
        </div>
    </div>
</template>
