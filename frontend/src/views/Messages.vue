<script setup lang="ts">
import { ref, onMounted, nextTick, computed } from 'vue';
import Card from '@/components/ui/Card.vue';
import { Send, Loader2, Search, MessageCircle } from 'lucide-vue-next';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/auth';

interface Message {
    id: number;
    sender_id: number;
    recipient_id: number;
    sender_name?: string;
    content: string;
    created_at: string;
}

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
}

interface Conversation {
    user: User;
    lastMessage?: Message;
    unreadCount: number;
}

const authStore = useAuthStore();
const users = ref<User[]>([]);
const conversations = ref<Conversation[]>([]);
const messages = ref<Message[]>([]);
const selectedUser = ref<User | null>(null);
const newMessage = ref('');
const loading = ref(true);
const sending = ref(false);
const searchQuery = ref('');
const messagesContainer = ref<HTMLElement | null>(null);

const currentUserId = computed(() => authStore.user?.id || 0);

const filteredUsers = computed(() => {
    if (!searchQuery.value) return users.value.filter(u => u.id !== currentUserId.value);
    return users.value.filter(u => 
        u.id !== currentUserId.value &&
        (u.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
         u.email.toLowerCase().includes(searchQuery.value.toLowerCase()))
    );
});

const fetchUsers = async () => {
    try {
        const response = await api.get('/users');
        users.value = response.data.data || [];
    } catch (error) {
        console.error('Failed to fetch users:', error);
    }
};

const fetchConversations = async () => {
    loading.value = true;
    try {
        // Get all messages for the current user
        const [inboxRes, sentRes] = await Promise.all([
            api.get('/messages/inbox'),
            api.get('/messages/sent')
        ]);
        
        const inbox = inboxRes.data.data || [];
        const sent = sentRes.data.data || [];
        const allMessages = [...inbox, ...sent];
        
        // Group by conversation partner
        const convMap = new Map<number, Conversation>();
        
        for (const msg of allMessages) {
            const partnerId = msg.sender_id === currentUserId.value ? msg.recipient_id : msg.sender_id;
            const partnerName = msg.sender_id === currentUserId.value ? msg.recipient_name : msg.sender_name;
            
            if (!convMap.has(partnerId)) {
                const user = users.value.find(u => u.id === partnerId) || {
                    id: partnerId,
                    name: partnerName || 'Unknown',
                    email: '',
                    role: ''
                };
                convMap.set(partnerId, {
                    user,
                    lastMessage: msg,
                    unreadCount: 0
                });
            }
            
            // Update if this message is newer
            const conv = convMap.get(partnerId)!;
            if (!conv.lastMessage || new Date(msg.created_at) > new Date(conv.lastMessage.created_at)) {
                conv.lastMessage = msg;
            }
            
            // Count unread
            if (!msg.is_read && msg.sender_id !== currentUserId.value) {
                conv.unreadCount++;
            }
        }
        
        conversations.value = Array.from(convMap.values())
            .sort((a, b) => new Date(b.lastMessage?.created_at || 0).getTime() - new Date(a.lastMessage?.created_at || 0).getTime());
            
    } catch (error) {
        console.error('Failed to fetch conversations:', error);
    } finally {
        loading.value = false;
    }
};

const selectUser = async (user: User) => {
    selectedUser.value = user;
    await fetchChatMessages(user.id);
};

const fetchChatMessages = async (partnerId: number) => {
    try {
        const [inboxRes, sentRes] = await Promise.all([
            api.get('/messages/inbox'),
            api.get('/messages/sent')
        ]);
        
        const inbox = (inboxRes.data.data || []).filter((m: Message) => m.sender_id === partnerId);
        const sent = (sentRes.data.data || []).filter((m: Message) => m.recipient_id === partnerId);
        
        messages.value = [...inbox, ...sent].sort((a, b) => 
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
        
        // Mark messages as read
        for (const msg of inbox) {
            if (!msg.is_read) {
                api.put(`/messages/${msg.id}/read`).catch(() => {});
            }
        }
        
        await nextTick();
        scrollToBottom();
    } catch (error) {
        console.error('Failed to fetch messages:', error);
    }
};

const sendMessage = async () => {
    if (!newMessage.value.trim() || !selectedUser.value) return;
    
    sending.value = true;
    try {
        await api.post('/messages', {
            recipient_id: selectedUser.value.id,
            subject: '',
            content: newMessage.value.trim()
        });
        
        newMessage.value = '';
        await fetchChatMessages(selectedUser.value.id);
        await fetchConversations();
    } catch (error) {
        console.error('Failed to send message:', error);
    } finally {
        sending.value = false;
    }
};

const scrollToBottom = () => {
    if (messagesContainer.value) {
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
};

const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
        return 'Yesterday';
    } else if (days < 7) {
        return date.toLocaleDateString([], { weekday: 'short' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

const startNewChat = (user: User) => {
    selectedUser.value = user;
    messages.value = [];
    searchQuery.value = '';
};

onMounted(async () => {
    await fetchUsers();
    await fetchConversations();
});
</script>

<template>
    <div class="h-[calc(100vh-6rem)] flex gap-4">
        <!-- Conversations Sidebar -->
        <Card class-name="w-80 flex flex-col overflow-hidden">
            <div class="p-4 border-b border-white/10">
                <h2 class="text-lg font-bold text-white mb-3">Messages</h2>
                <div class="relative">
                    <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input 
                        v-model="searchQuery"
                        type="text" 
                        placeholder="Search users..." 
                        class="w-full pl-10 pr-4 py-2 bg-dark-900 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:border-gold-500 outline-none"
                    />
                </div>
            </div>
            
            <!-- Search Results -->
            <div v-if="searchQuery" class="flex-1 overflow-y-auto">
                <div 
                    v-for="user in filteredUsers" 
                    :key="user.id"
                    @click="startNewChat(user)"
                    class="p-4 hover:bg-white/5 cursor-pointer border-b border-white/5 transition-colors"
                >
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-full bg-gold-500/20 flex items-center justify-center text-gold-500 font-bold">
                            {{ user.name?.charAt(0)?.toUpperCase() || 'U' }}
                        </div>
                        <div class="flex-1 min-w-0">
                            <p class="text-white font-medium truncate">{{ user.name }}</p>
                            <p class="text-xs text-gray-500 capitalize">{{ user.role }}</p>
                        </div>
                    </div>
                </div>
                <div v-if="filteredUsers.length === 0" class="p-4 text-center text-gray-500">
                    No users found
                </div>
            </div>
            
            <!-- Conversations List -->
            <div v-else class="flex-1 overflow-y-auto">
                <div v-if="loading" class="flex justify-center items-center py-8">
                    <Loader2 class="w-6 h-6 text-gold-500 animate-spin" />
                </div>
                <div v-else-if="conversations.length === 0" class="p-4 text-center text-gray-500">
                    <MessageCircle class="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No conversations yet</p>
                    <p class="text-xs mt-1">Search for a user to start chatting</p>
                </div>
                <div 
                    v-else
                    v-for="conv in conversations" 
                    :key="conv.user.id"
                    @click="selectUser(conv.user)"
                    :class="['p-4 cursor-pointer border-b border-white/5 transition-colors', 
                        selectedUser?.id === conv.user.id ? 'bg-gold-500/10' : 'hover:bg-white/5']"
                >
                    <div class="flex items-center gap-3">
                        <div class="relative">
                            <div class="w-10 h-10 rounded-full bg-gold-500/20 flex items-center justify-center text-gold-500 font-bold">
                                {{ conv.user.name?.charAt(0)?.toUpperCase() || 'U' }}
                            </div>
                            <div v-if="conv.unreadCount > 0" class="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs text-white font-bold">
                                {{ conv.unreadCount > 9 ? '9+' : conv.unreadCount }}
                            </div>
                        </div>
                        <div class="flex-1 min-w-0">
                            <div class="flex justify-between items-center">
                                <p class="text-white font-medium truncate">{{ conv.user.name }}</p>
                                <span class="text-xs text-gray-500">{{ formatTime(conv.lastMessage?.created_at || '') }}</span>
                            </div>
                            <p class="text-sm text-gray-500 truncate">{{ conv.lastMessage?.content }}</p>
                        </div>
                    </div>
                </div>
            </div>
        </Card>

        <!-- Chat Area -->
        <Card class-name="flex-1 flex flex-col overflow-hidden">
            <template v-if="selectedUser">
                <!-- Chat Header -->
                <div class="p-4 border-b border-white/10 flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-gold-500/20 flex items-center justify-center text-gold-500 font-bold">
                        {{ selectedUser.name?.charAt(0)?.toUpperCase() || 'U' }}
                    </div>
                    <div>
                        <p class="text-white font-medium">{{ selectedUser.name }}</p>
                        <p class="text-xs text-gray-500 capitalize">{{ selectedUser.role || 'User' }}</p>
                    </div>
                </div>

                <!-- Messages -->
                <div ref="messagesContainer" class="flex-1 overflow-y-auto p-4 space-y-4">
                    <div 
                        v-for="msg in messages" 
                        :key="msg.id"
                        :class="['flex', msg.sender_id === currentUserId ? 'justify-end' : 'justify-start']"
                    >
                        <div :class="[
                            'max-w-[70%] rounded-2xl px-4 py-2',
                            msg.sender_id === currentUserId 
                                ? 'bg-gold-500 text-dark-900 rounded-br-md' 
                                : 'bg-dark-900 text-white rounded-bl-md'
                        ]">
                            <p class="text-sm">{{ msg.content }}</p>
                            <p :class="['text-xs mt-1', msg.sender_id === currentUserId ? 'text-dark-900/60' : 'text-gray-500']">
                                {{ formatTime(msg.created_at) }}
                            </p>
                        </div>
                    </div>
                    <div v-if="messages.length === 0" class="flex-1 flex items-center justify-center text-gray-500">
                        <p>Start a conversation with {{ selectedUser.name }}</p>
                    </div>
                </div>

                <!-- Message Input -->
                <div class="p-4 border-t border-white/10">
                    <form @submit.prevent="sendMessage" class="flex gap-3">
                        <input 
                            v-model="newMessage"
                            type="text"
                            placeholder="Type a message..."
                            class="flex-1 px-4 py-3 bg-dark-900 border border-white/10 rounded-xl text-white focus:border-gold-500 outline-none"
                            :disabled="sending"
                        />
                        <button 
                            type="submit"
                            :disabled="!newMessage.trim() || sending"
                            class="px-6 py-3 bg-gold-500 text-dark-900 rounded-xl font-medium hover:bg-gold-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                        >
                            <Loader2 v-if="sending" class="w-4 h-4 animate-spin" />
                            <Send v-else class="w-4 h-4" />
                        </button>
                    </form>
                </div>
            </template>

            <!-- No Chat Selected -->
            <div v-else class="flex-1 flex flex-col items-center justify-center text-gray-500">
                <MessageCircle class="w-16 h-16 mb-4 opacity-50" />
                <p class="text-lg">Select a conversation</p>
                <p class="text-sm">or search for a user to start chatting</p>
            </div>
        </Card>
    </div>
</template>
