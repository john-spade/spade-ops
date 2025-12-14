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
import Users from '@/views/Users.vue';
import Messages from '@/views/Messages.vue';

const routes = [
    { path: '/', name: 'SignIn', component: SignIn },
    { path: '/dashboard', name: 'Dashboard', component: Dashboard, meta: { requiresAuth: true } },
    { path: '/employees', name: 'Employees', component: Employees, meta: { requiresAuth: true, roles: ['admin', 'supervisor'] } },
    { path: '/employees/:id', name: 'EmployeeDetail', component: EmployeeDetail, meta: { requiresAuth: true, roles: ['admin', 'supervisor'] } },
    { path: '/hrms/applicants', name: 'Applicants', component: Applicants, meta: { requiresAuth: true, roles: ['admin', 'supervisor'] } },
    { path: '/hrms/attendance', name: 'Attendance', component: Attendance, meta: { requiresAuth: true, roles: ['admin', 'supervisor', 'employee'] } },
    { path: '/hrms/shifts', name: 'Shifts', component: Shifts, meta: { requiresAuth: true, roles: ['admin', 'supervisor'] } },
    { path: '/hrms/sites', name: 'Sites', component: Sites, meta: { requiresAuth: true, roles: ['admin', 'supervisor'] } },
    { path: '/hrms/payroll', name: 'Payroll', component: Payroll, meta: { requiresAuth: true, roles: ['admin', 'supervisor', 'employee'] } },
    { path: '/clients', name: 'Clients', component: Clients, meta: { requiresAuth: true, roles: ['admin', 'supervisor', 'client'] } },
    { path: '/clients/:id', name: 'ClientDetail', component: ClientDetail, meta: { requiresAuth: true, roles: ['admin', 'supervisor', 'client'] } },
    { path: '/evaluation/new', name: 'NewEvaluation', component: NewEvaluation, meta: { requiresAuth: true, roles: ['supervisor'] } },
    { path: '/evaluation', name: 'EvaluationHistory', component: EvaluationHistory, meta: { requiresAuth: true, roles: ['admin', 'supervisor', 'client'] } },
    { path: '/partners', name: 'Partners', component: Partners, meta: { requiresAuth: true, roles: ['admin'] } },
    { path: '/settings', name: 'Settings', component: Settings, meta: { requiresAuth: true, roles: ['admin'] } },
    { path: '/users', name: 'Users', component: Users, meta: { requiresAuth: true, roles: ['admin'] } },
    { path: '/messages', name: 'Messages', component: Messages, meta: { requiresAuth: true } },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

// Navigation guard with role checking
router.beforeEach((to, _from, next) => {
    const authStore = useAuthStore();

    // Not authenticated - redirect to login
    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
        next('/');
        return;
    }

    // Check role permissions
    const allowedRoles = to.meta.roles as string[] | undefined;
    if (allowedRoles && authStore.user) {
        const userRole = authStore.user.role;
        if (!allowedRoles.includes(userRole)) {
            // User doesn't have permission - redirect to dashboard
            next('/dashboard');
            return;
        }
    }

    next();
});

export default router;

