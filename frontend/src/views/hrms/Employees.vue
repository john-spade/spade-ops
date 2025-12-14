<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import Card from '@/components/ui/Card.vue';
import Button from '@/components/ui/Button.vue';
import { Plus, Search, Trash2, Eye, Loader2 } from 'lucide-vue-next';
import api from '@/lib/api';
import CreateEmployeeModal from '@/components/modals/CreateEmployeeModal.vue';

interface Employee {
    id: number;
    first_name: string;
    last_name: string;
    position: string;
    department: string;
    status: string;
    date_hired: string;
}

const router = useRouter();
const employees = ref<Employee[]>([]);
const loading = ref(true);
const search = ref('');
const showModal = ref(false);

const fetchEmployees = async () => {
    loading.value = true;
    try {
        const response = await api.get('/employees');
        employees.value = response.data.data?.data || response.data.data || [];
    } catch (error) {
        console.error('Failed to fetch employees:', error);
    } finally {
        loading.value = false;
    }
};

const deleteEmployee = async (id: number) => {
    if (!confirm('Are you sure you want to delete this employee?')) return;
    try {
        await api.delete(`/employees/${id}`);
        await fetchEmployees();
    } catch (error) {
        console.error('Failed to delete employee:', error);
    }
};

const filteredEmployees = () => {
    if (!search.value) return employees.value;
    const q = search.value.toLowerCase();
    return employees.value.filter(e => 
        e.first_name.toLowerCase().includes(q) || 
        e.last_name.toLowerCase().includes(q)
    );
};

const navigateToDetail = (id: number) => {
    router.push(`/employees/${id}`);
};

onMounted(fetchEmployees);
</script>

<template>
    <div class="space-y-6">
        <div class="flex justify-between items-center">
            <div>
                <h1 class="text-2xl font-bold text-white">Employees</h1>
                <p class="text-gray-500">Manage your workforce</p>
            </div>
            <Button @click="showModal = true">
                <Plus class="w-4 h-4" /> Add Employee
            </Button>
        </div>

        <!-- Create Modal -->
        <CreateEmployeeModal :is-open="showModal" @close="showModal = false" @refresh="fetchEmployees" />

        <!-- Search -->
        <Card class-name="p-4">
            <div class="relative">
                <Search class="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                <input
                    v-model="search"
                    type="text"
                    placeholder="Search employees..."
                    class="w-full pl-10 pr-4 py-3 bg-dark-900 border border-white/10 rounded-lg text-white focus:outline-none focus:border-gold-500"
                />
            </div>
        </Card>

        <!-- Table -->
        <Card class-name="overflow-hidden">
            <div v-if="loading" class="flex justify-center items-center py-12">
                <Loader2 class="w-8 h-8 text-gold-500 animate-spin" />
            </div>
            <table v-else class="w-full">
                <thead class="bg-dark-900">
                    <tr>
                        <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                        <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Position</th>
                        <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                        <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th class="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr 
                        v-for="emp in filteredEmployees()" 
                        :key="emp.id" 
                        class="table-row cursor-pointer hover:bg-white/5 transition-colors"
                        @click="navigateToDetail(emp.id)"
                    >
                        <td class="px-6 py-4">
                            <p class="font-medium text-white">{{ emp.first_name }} {{ emp.last_name }}</p>
                        </td>
                        <td class="px-6 py-4 text-gray-400">{{ emp.position }}</td>
                        <td class="px-6 py-4 text-gray-400">{{ emp.department }}</td>
                        <td class="px-6 py-4">
                            <span :class="emp.status === 'active' ? 'badge-success' : 'badge-warning'">
                                {{ emp.status }}
                            </span>
                        </td>
                        <td class="px-6 py-4 text-right" @click.stop>
                            <div class="flex justify-end gap-2">
                                <RouterLink :to="`/employees/${emp.id}`">
                                    <button class="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white">
                                        <Eye class="w-4 h-4" />
                                    </button>
                                </RouterLink>
                                <button @click="deleteEmployee(emp.id)" class="p-2 hover:bg-red-500/10 rounded-lg text-gray-400 hover:text-red-400">
                                    <Trash2 class="w-4 h-4" />
                                </button>
                            </div>
                        </td>
                    </tr>
                    <tr v-if="filteredEmployees().length === 0">
                        <td colspan="5" class="px-6 py-12 text-center text-gray-500">No employees found</td>
                    </tr>
                </tbody>
            </table>
        </Card>
    </div>
</template>
