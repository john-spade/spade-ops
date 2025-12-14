import { db } from '../../src/index.js';

// Simple Route Handler Helper since we haven't created controllers yet
// Ideally these should move to app/controllers/*.js

export default (router) => {
    // Employees
    router.get('/employees', async (ctx) => {
        const employees = await db.table('employees')
            .orderBy('created_at', 'DESC')
            .get();
        ctx.success(employees);
    });

    router.get('/employees/:id', async (ctx) => {
        const employee = await db.table('employees').find(ctx.params.id);
        if (!employee) return ctx.error('Employee not found', 404);
        ctx.success(employee);
    });

    // Clients
    router.get('/clients', async (ctx) => {
        const clients = await db.table('clients').get();
        ctx.success(clients);
    });

    // Sites
    router.get('/sites', async (ctx) => {
        // Simple join could be done here or handled in controller
        // For now, raw get
        const sites = await db.raw(`
            SELECT sites.*, clients.name as client_name 
            FROM sites 
            LEFT JOIN clients ON sites.client_id = clients.id
        `);
        // Map to expected structure
        const mapped = sites.map(s => ({
            ...s,
            client: { id: s.client_id, name: s.client_name }
        }));
        ctx.success(mapped);
    });

    // Shifts
    router.get('/shifts', async (ctx) => {
        const shifts = await db.raw(`
            SELECT shifts.*, 
                   employees.first_name, employees.last_name, 
                   sites.name as site_name 
            FROM shifts
            JOIN employees ON shifts.employee_id = employees.id
            JOIN sites ON shifts.site_id = sites.id
            ORDER BY shifts.start_time DESC
        `);

        const mapped = shifts.map(s => ({
            ...s,
            employee: { id: s.employee_id, first_name: s.first_name, last_name: s.last_name },
            site: { id: s.site_id, name: s.site_name }
        }));

        ctx.success(mapped);
    });

    // Attendance
    router.get('/attendance', async (ctx) => {
        const attendance = await db.raw(`
            SELECT attendances.*, 
                   employees.first_name, employees.last_name
            FROM attendances
            JOIN employees ON attendances.employee_id = employees.id
            ORDER BY attendances.date DESC, attendances.clock_in DESC
        `);

        const mapped = attendance.map(a => ({
            ...a,
            employee: { id: a.employee_id, first_name: a.first_name, last_name: a.last_name }
        }));

        ctx.success(mapped);
    });

    // POST Routes
    router.post('/employees', async (ctx) => {
        const { first_name, last_name, email, phone, position, department, status, date_hired } = ctx.body;
        // Basic validation
        if (!first_name || !last_name || !email) {
            return ctx.error('Name and Email are required', 400);
        }

        const id = await db.insert('employees', {
            first_name, last_name, email, phone, position, department, status, date_hired
        });

        const newEmployee = await db.table('employees').find(id);
        ctx.success(newEmployee, 'Employee created', 201);
    });

    router.delete('/employees/:id', async (ctx) => {
        const exists = await db.table('employees').find(ctx.params.id);
        if (!exists) return ctx.error('Employee not found', 404);

        await db.table('employees').where({ id: ctx.params.id }).delete();
        ctx.success(null, 'Employee deleted');
    });

    router.post('/shifts', async (ctx) => {
        const { employee_id, site_id, start_time, end_time, status, guaranteed_hours } = ctx.body;

        const id = await db.insert('shifts', {
            employee_id, site_id, start_time, end_time, status, guaranteed_hours
        });

        ctx.success({ id }, 'Shift assigned', 201);
    });

    router.post('/clients', async (ctx) => {
        const { name, contact_person, email, phone, address, contract_start, contract_end, status } = ctx.body;
        if (!name) return ctx.error('Name is required', 400);

        const id = await db.insert('clients', {
            name, contact_person, email, phone, address, contract_start, contract_end, status
        });

        ctx.success({ id }, 'Client created', 201);
    });

    router.post('/sites', async (ctx) => {
        const { client_id, name, location, status } = ctx.body;
        if (!client_id || !name) return ctx.error('Client and Site Name required', 400);

        const id = await db.insert('sites', {
            client_id, name, location, status
        });

        ctx.success({ id }, 'Site created', 201);
    });

    router.post('/evaluations', async (ctx) => {
        const { employee_id, score, comments, evaluation_date } = ctx.body;
        if (!employee_id) return ctx.error('Employee required', 400);

        const id = await db.insert('evaluations', {
            employee_id,
            score,
            comments,
            evaluation_date,
            evaluator_id: ctx.state.user?.id || null
        });

        ctx.success({ id }, 'Evaluation submitted', 201);
    });
};
