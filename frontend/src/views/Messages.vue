<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import Card from '@/components/ui/Card.vue';
import Button from '@/components/ui/Button.vue';
import { Send, Inbox, Mail, Loader2, X, Check } from 'lucide-vue-next';
import api from '@/lib/api';

interface Message {
    id: number;
    sender_id: number;
    recipient_id: number;
    sender_name?: string;
    recipient_name?: string;
    subject: string;
    content: string;
    is_read: boolean;
    created_at: string;
}

interface User {
    id: number;
    name: string;
    email: string;
}

const activeTab = ref<'inbox' | 'sent' | 'compose'>('inbox');
const messages = ref<Message[]>([]);
const users = ref<User[]>([]);
const loading = ref(true);
const sending = ref(false);

// Compose form
const composeForm = ref({
    recipient_id: '',
    subject: '',
    content: ''
});

const fetchMessages = async () => {
    loading.value = true;
    try {
        const endpoint = activeTab.value === 'sent' ? '/messages/sent' : '/messages/inbox';
        const response = await api.get(endpoint);
        messages.value = response.data.data || [];
    } catch (error) {
        console.error('Failed to fetch messages:', error);
        messages.value = [];
    } finally {
        loading.value = false;
    }
};

const fetchUsers = async () => {
    try {
        const response = await api.get('/users');
        users.value = response.data.data || [];
    } catch (error) {
        console.error('Failed to fetch users:', error);
    }
};

const sendMessage = async () => {
    if (!composeForm.value.recipient_id || !composeForm.value.content) {
        alert('Please select a recipient and enter a message');
        return;
    }
    
    sending.value = true;
    try {
        await api.post('/messages', {
            recipient_id: parseInt(composeForm.value.recipient_id),
            subject: composeForm.value.subject,
            content: composeForm.value.content
        });
        composeForm.value = { recipient_id: '', subject: '', content: '' };
        activeTab.value = 'sent';
        await fetchMessages();
    } catch (error) {
        console.error('Failed to send message:', error);
        alert('Failed to send message');
    } finally {
        sending.value = false;
    }
};

const markAsRead = async (id: number) => {
    try {
        await api.put(`/messages/${id}/read`);
        const msg = messages.value.find(m => m.id === id);
        if (msg) msg.is_read = true;
    } catch (error) {
        console.error('Failed to mark as read:', error);
    }
};

const switchTab = (tab: 'inbox' | 'sent' | 'compose') => {
    activeTab.value = tab;
    if (tab !== 'compose') {
        fetchMessages();
    }
};

onMounted(() => {
    fetchMessages();
    fetchUsers();
});
</script>

<template>
    <div class="space-y-6">
        <div class="flex justify-between items-center">
            <div>
                <h1 class="text-2xl font-bold text-white">Messages</h1>
                <p class="text-gray-500">Internal messaging system</p>
            </div>
        </div>

        <!-- Tabs -->
        <div class="flex gap-2">
            <button 
                @click="switchTab('inbox')"
                :class="['px-4 py-2 rounded-lg text-sm font-medium transition-colors', 
                    activeTab === 'inbox' ? 'bg-gold-500 text-dark-900' : 'bg-dark-800 text-gray-400 hover:text-white']"
            >
                <Inbox class="w-4 h-4 inline mr-2" />
                Inbox
            </button>
            <button 
                @click="switchTab('sent')"
                :class="['px-4 py-2 rounded-lg text-sm font-medium transition-colors', 
                    activeTab === 'sent' ? 'bg-gold-500 text-dark-900' : 'bg-dark-800 text-gray-400 hover:text-white']"
            >
                <Send class="w-4 h-4 inline mr-2" />
                Sent
            </button>
            <button 
                @click="switchTab('compose')"
                :class="['px-4 py-2 rounded-lg text-sm font-medium transition-colors', 
                    activeTab === 'compose' ? 'bg-gold-500 text-dark-900' : 'bg-dark-800 text-gray-400 hover:text-white']"
            >
                <Mail class="w-4 h-4 inline mr-2" />
                Compose
            </button>
        </div>

        <!-- Compose Form -->
        <Card v-if="activeTab === 'compose'" class-name="p-6">
            <h2 class="text-lg font-bold text-white mb-4">New Message</h2>
            <form @submit.prevent="sendMessage" class="space-y-4">
                <div>
                    <label class="text-sm text-gray-400 block mb-1">To</label>
                    <select 
                        v-model="composeForm.recipient_id" 
                        required
                        class="w-full px-4 py-2 bg-dark-900 border border-white/10 rounded-lg text-white focus:border-gold-500 outline-none"
                    >
                        <option value="">Select recipient...</option>
                        <option v-for="user in users" :key="user.id" :value="user.id">
                            {{ user.name }} ({{ user.email }})
                        </option>
                    </select>
                </div>
                <div>
                    <label class="text-sm text-gray-400 block mb-1">Subject</label>
                    <input 
                        v-model="composeForm.subject" 
                        type="text"
                        placeholder="Optional subject..."
                        class="w-full px-4 py-2 bg-dark-900 border border-white/10 rounded-lg text-white focus:border-gold-500 outline-none"
                    />
                </div>
                <div>
                    <label class="text-sm text-gray-400 block mb-1">Message</label>
                    <textarea 
                        v-model="composeForm.content" 
                        rows="5"
                        required
                        placeholder="Type your message..."
                        class="w-full px-4 py-2 bg-dark-900 border border-white/10 rounded-lg text-white focus:border-gold-500 outline-none resize-none"
                    ></textarea>
                </div>
                <div class="flex justify-end">
                    <Button type="submit" :disabled="sending">
                        <Loader2 v-if="sending" class="w-4 h-4 mr-2 animate-spin" />
                        <Send v-else class="w-4 h-4 mr-2" />
                        {{ sending ? 'Sending...' : 'Send Message' }}
                    </Button>
                </div>
            </form>
        </Card>

        <!-- Message List -->
        <Card v-else class-name="overflow-hidden">
            <div v-if="loading" class="flex justify-center items-center py-12">
                <Loader2 class="w-8 h-8 text-gold-500 animate-spin" />
            </div>
            <div v-else-if="messages.length === 0" class="py-12 text-center text-gray-500">
                No messages found
            </div>
            <div v-else class="divide-y divide-white/10">
                <div 
                    v-for="msg in messages" 
                    :key="msg.id" 
                    :class="['p-4 hover:bg-white/5 transition-colors cursor-pointer', !msg.is_read && activeTab === 'inbox' ? 'bg-gold-500/5 border-l-2 border-gold-500' : '']"
                    @click="markAsRead(msg.id)"
                >
                    <div class="flex justify-between items-start mb-2">
                        <div>
                            <span class="text-white font-medium">
                                {{ activeTab === 'inbox' ? msg.sender_name : msg.recipient_name }}
                            </span>
                            <span v-if="msg.subject" class="text-gray-400 ml-2">- {{ msg.subject }}</span>
                        </div>
                        <span class="text-xs text-gray-500">{{ new Date(msg.created_at).toLocaleString() }}</span>
                    </div>
                    <p class="text-gray-400 text-sm line-clamp-2">{{ msg.content }}</p>
                </div>
            </div>
        </Card>
    </div>
</template>
