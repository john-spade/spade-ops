import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

// Views
import SignIn from '@/views/SignIn.vue';
import Dashboard from '@/views/Dashboard.vue';
import Employees from '@/views/hrms/Employees.vue';
import EmployeeDetail from '@/views/hrms/EmployeeDetail.vue';
import Clients from '@/views/Clients.vue';
import ClientDetail from '@/views/ClientDetail.vue';
import NewEvaluation from '@/views/evaluation/NewEvaluation.vue';
import EvaluationHistory from '@/views/evaluation/EvaluationHistory.vue';
import Settings from '@/views/Settings.vue';
import Applicants from '@/views/hrms/Applicants.vue';
import Attendance from '@/views/hrms/Attendance.vue';
import Shifts from '@/views/hrms/Shifts.vue';
import Sites from '@/views/hrms/Sites.vue';
import Payroll from '@/views/hrms/Payroll.vue';
import Partners from '@/views/Partners.vue';

const routes = [
    { path: '/', name: 'SignIn', component: SignIn },
    { path: '/dashboard', name: 'Dashboard', component: Dashboard, meta: { requiresAuth: true } },
    { path: '/employees', name: 'Employees', component: Employees, meta: { requiresAuth: true } },
    { path: '/employees/:id', name: 'EmployeeDetail', component: EmployeeDetail, meta: { requiresAuth: true } },
    { path: '/hrms/applicants', name: 'Applicants', component: Applicants, meta: { requiresAuth: true } },
    { path: '/hrms/attendance', name: 'Attendance', component: Attendance, meta: { requiresAuth: true } },
    { path: '/hrms/shifts', name: 'Shifts', component: Shifts, meta: { requiresAuth: true } },
    { path: '/hrms/sites', name: 'Sites', component: Sites, meta: { requiresAuth: true } },
    { path: '/hrms/payroll', name: 'Payroll', component: Payroll, meta: { requiresAuth: true } },
    { path: '/clients', name: 'Clients', component: Clients, meta: { requiresAuth: true } },
    { path: '/clients/:id', name: 'ClientDetail', component: ClientDetail, meta: { requiresAuth: true } },
    { path: '/evaluation/new', name: 'NewEvaluation', component: NewEvaluation, meta: { requiresAuth: true } },
    { path: '/evaluation', name: 'EvaluationHistory', component: EvaluationHistory, meta: { requiresAuth: true } },
    { path: '/partners', name: 'Partners', component: Partners, meta: { requiresAuth: true } },
    { path: '/settings', name: 'Settings', component: Settings, meta: { requiresAuth: true } },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

// Navigation guard
router.beforeEach((to, _from, next) => {
    const authStore = useAuthStore();

    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
        next('/');
    } else {
        next();
    }
});

export default router;
