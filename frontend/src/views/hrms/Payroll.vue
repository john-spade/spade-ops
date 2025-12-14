<script setup lang="ts">
import { ref } from 'vue';
import Card from '@/components/ui/Card.vue';
import Button from '@/components/ui/Button.vue';
import { DollarSign, Download, Calendar } from 'lucide-vue-next';

interface PayrollRecord {
    id: number;
    employee: string;
    position: string;
    period: string;
    amount: number;
    status: 'Paid' | 'Pending' | 'Processing';
    datePaid: string | null;
}

const payrolls = ref<PayrollRecord[]>([
    { id: 1, employee: 'John Doe', position: 'Security Guard', period: 'Oct 1-15, 2023', amount: 1200, status: 'Paid', datePaid: 'Oct 16, 2023' },
    { id: 2, employee: 'Jane Smith', position: 'Supervisor', period: 'Oct 1-15, 2023', amount: 1500, status: 'Paid', datePaid: 'Oct 16, 2023' },
    { id: 3, employee: 'Mike Johnson', position: 'Security Guard', period: 'Oct 1-15, 2023', amount: 1200, status: 'Processing', datePaid: null },
    { id: 4, employee: 'Sarah Williams', position: 'HR Assistant', period: 'Oct 1-15, 2023', amount: 1100, status: 'Pending', datePaid: null },
]);

const getStatusClass = (status: string) => {
    switch (status) {
        case 'Paid': return 'bg-green-500/10 text-green-500 border-green-500/20';
        case 'Processing': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
        case 'Pending': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
        default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
};

const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
};
</script>

<template>
    <div class="space-y-6">
        <div class="flex justify-between items-center">
            <div>
                <h1 class="text-2xl font-bold text-white">Payroll</h1>
                <p class="text-gray-500">Manage employee salaries and payments</p>
            </div>
            <div class="flex gap-3">
                 <Button variant="outline" class="gap-2">
                    <Calendar class="w-4 h-4" />
                    Oct 1-15
                </Button>
                <Button variant="primary" class="gap-2">
                    <DollarSign class="w-4 h-4" />
                    Run Payroll
                </Button>
            </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card class-name="p-5">
                 <p class="text-sm text-gray-500">Total Payroll Cost</p>
                 <p class="text-2xl font-bold text-white mt-1">$5,000.00</p>
            </Card>
            <Card class-name="p-5">
                 <p class="text-sm text-gray-500">Pending Payments</p>
                 <p class="text-2xl font-bold text-yellow-500 mt-1">$2,300.00</p>
            </Card>
            <Card class-name="p-5">
                 <p class="text-sm text-gray-500">Processed</p>
                 <p class="text-2xl font-bold text-green-500 mt-1">50%</p>
            </Card>
        </div>

        <Card class-name="overflow-hidden">
            <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse">
                    <thead>
                        <tr class="border-b border-white/10 bg-white/5">
                            <th class="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Employee</th>
                            <th class="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Period</th>
                            <th class="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Amount</th>
                            <th class="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                            <th class="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Date Paid</th>
                            <th class="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-white/10">
                        <tr v-for="record in payrolls" :key="record.id" class="hover:bg-white/5 transition-colors">
                            <td class="p-4">
                                <div class="font-medium text-white">{{ record.employee }}</div>
                                <div class="text-xs text-gray-500">{{ record.position }}</div>
                            </td>
                            <td class="p-4 text-gray-400">{{ record.period }}</td>
                            <td class="p-4 text-white font-mono">{{ formatCurrency(record.amount) }}</td>
                            <td class="p-4">
                                <span :class="['px-2 py-1 rounded-full text-xs border font-medium', getStatusClass(record.status)]">
                                    {{ record.status }}
                                </span>
                            </td>
                            <td class="p-4 text-gray-400">{{ record.datePaid || '-' }}</td>
                            <td class="p-4 text-right">
                                <Button variant="secondary" size="sm">
                                    <Download class="w-3 h-3" />
                                </Button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </Card>
    </div>
</template>
