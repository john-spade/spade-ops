import { db, hashPassword } from '../../src/index.js';

export default (router) => {
    // ============ DASHBOARD STATS ============
    router.get('/dashboard/stats', async (ctx) => {
        const [employees] = await db.raw('SELECT COUNT(*) as count FROM employees WHERE status = "active"');
        const [clients] = await db.raw('SELECT COUNT(*) as count FROM clients WHERE status = "active"');
        const [sites] = await db.raw('SELECT COUNT(*) as count FROM sites WHERE status = "active"');
        const [shifts] = await db.raw('SELECT COUNT(*) as count FROM shifts WHERE status = "scheduled"');
        const [evaluations] = await db.raw('SELECT COUNT(*) as count FROM evaluations');
        const [attendanceToday] = await db.raw('SELECT COUNT(*) as count FROM attendances WHERE date = CURDATE()');

        ctx.success({
            employees: employees?.count || 0,
            clients: clients?.count || 0,
            sites: sites?.count || 0,
            scheduledShifts: shifts?.count || 0,
            evaluations: evaluations?.count || 0,
            attendanceToday: attendanceToday?.count || 0
        });
    });

    // ============ EMPLOYEES ============
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

    // Create employee with auto user account
    router.post('/employees', async (ctx) => {
        const {
            first_name, last_name, email, phone, position,
            department, status, date_hired, employee_id, password
        } = ctx.body;

        if (!first_name || !last_name || !email) {
            return ctx.error('Name and Email are required', 400);
        }

        // Check if email already exists
        const existingUser = await db.table('users').where({ email }).first();
        if (existingUser) {
            return ctx.error('Email already exists', 400);
        }

        // Check if employee_id already exists
        if (employee_id) {
            const existingEmpId = await db.table('employees').where({ employee_id }).first();
            if (existingEmpId) {
                return ctx.error('Employee ID already exists', 400);
            }
        }

        let user_id = null;

        // Create user account if password provided
        if (password) {
            const hashedPassword = await hashPassword(password);
            user_id = await db.insert('users', {
                name: `${first_name} ${last_name}`,
                email,
                password: hashedPassword,
                role: 'employee'
            });
        }

        const id = await db.insert('employees', {
            user_id,
            employee_id,
            first_name,
            last_name,
            email,
            phone,
            position,
            department,
            status: status || 'active',
            date_hired
        });

        const newEmployee = await db.table('employees').find(id);
        ctx.success(newEmployee, 'Employee created', 201);
    });

    router.put('/employees/:id', async (ctx) => {
        const employee = await db.table('employees').find(ctx.params.id);
        if (!employee) return ctx.error('Employee not found', 404);

        const {
            first_name, last_name, email, phone, position,
            department, status, date_hired, employee_id, password
        } = ctx.body;

        // Update employee record
        await db.table('employees').where({ id: ctx.params.id }).update({
            first_name, last_name, email, phone, position,
            department, status, date_hired, employee_id
        });

        // Update password if provided and user exists
        if (password && employee.user_id) {
            const hashedPassword = await hashPassword(password);
            await db.table('users').where({ id: employee.user_id }).update({
                password: hashedPassword
            });
        }

        const updated = await db.table('employees').find(ctx.params.id);
        ctx.success(updated, 'Employee updated');
    });

    router.delete('/employees/:id', async (ctx) => {
        const employee = await db.table('employees').find(ctx.params.id);
        if (!employee) return ctx.error('Employee not found', 404);

        // Delete associated user if exists
        if (employee.user_id) {
            await db.table('users').where({ id: employee.user_id }).delete();
        }

        await db.table('employees').where({ id: ctx.params.id }).delete();
        ctx.success(null, 'Employee deleted');
    });

    // ============ CLIENTS ============
    router.get('/clients', async (ctx) => {
        const clients = await db.table('clients').get();
        ctx.success(clients);
    });

    router.get('/clients/:id', async (ctx) => {
        const client = await db.table('clients').find(ctx.params.id);
        if (!client) return ctx.error('Client not found', 404);
        ctx.success(client);
    });

    // Create client with auto user account
    router.post('/clients', async (ctx) => {
        const { name, contact_person, email, phone, address, contract_start, contract_end, status, password } = ctx.body;
        if (!name) return ctx.error('Name is required', 400);

        let user_id = null;

        // Create user account if email and password provided
        if (email && password) {
            const existingUser = await db.table('users').where({ email }).first();
            if (existingUser) {
                return ctx.error('Email already exists', 400);
            }

            const hashedPassword = await hashPassword(password);
            user_id = await db.insert('users', {
                name: contact_person || name,
                email,
                password: hashedPassword,
                role: 'client'
            });
        }

        const id = await db.insert('clients', {
            user_id,
            name,
            contact_person,
            email,
            phone,
            address,
            contract_start,
            contract_end,
            status: status || 'active'
        });

        const newClient = await db.table('clients').find(id);
        ctx.success(newClient, 'Client created', 201);
    });

    router.delete('/clients/:id', async (ctx) => {
        const client = await db.table('clients').find(ctx.params.id);
        if (!client) return ctx.error('Client not found', 404);

        if (client.user_id) {
            await db.table('users').where({ id: client.user_id }).delete();
        }

        await db.table('clients').where({ id: ctx.params.id }).delete();
        ctx.success(null, 'Client deleted');
    });

    // ============ SITES ============
    router.get('/sites', async (ctx) => {
        const sites = await db.raw(`
            SELECT sites.*, clients.name as client_name 
            FROM sites 
            LEFT JOIN clients ON sites.client_id = clients.id
        `);
        const mapped = sites.map(s => ({
            ...s,
            client: { id: s.client_id, name: s.client_name }
        }));
        ctx.success(mapped);
    });

    router.post('/sites', async (ctx) => {
        const { client_id, name, location, status } = ctx.body;
        if (!client_id || !name) return ctx.error('Client and Site Name required', 400);

        const id = await db.insert('sites', {
            client_id, name, location, status: status || 'active'
        });

        ctx.success({ id }, 'Site created', 201);
    });

    // ============ SHIFTS ============
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

    router.post('/shifts', async (ctx) => {
        const { employee_id, site_id, start_time, end_time, status, guaranteed_hours } = ctx.body;

        const id = await db.insert('shifts', {
            employee_id, site_id, start_time, end_time, status: status || 'scheduled', guaranteed_hours
        });

        ctx.success({ id }, 'Shift assigned', 201);
    });

    // ============ ATTENDANCE ============
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

    // Get attendance for logged-in employee
    router.get('/attendance/me', async (ctx) => {
        if (!ctx.state.user) {
            return ctx.error('Not authenticated', 401);
        }

        const employee = await db.table('employees').where({ user_id: ctx.state.user.id }).first();
        if (!employee) {
            return ctx.error('Employee profile not found', 404);
        }

        const attendance = await db.table('attendances')
            .where({ employee_id: employee.id })
            .orderBy('date', 'DESC')
            .get();

        ctx.success(attendance);
    });

    // ============ EVALUATIONS ============
    router.get('/evaluations', async (ctx) => {
        const evaluations = await db.raw(`
            SELECT evaluations.*, 
                   employees.first_name, employees.last_name,
                   users.name as evaluator_name
            FROM evaluations
            JOIN employees ON evaluations.employee_id = employees.id
            LEFT JOIN users ON evaluations.evaluator_id = users.id
            ORDER BY evaluations.evaluation_date DESC
        `);

        const mapped = evaluations.map(e => ({
            ...e,
            employee: { id: e.employee_id, first_name: e.first_name, last_name: e.last_name },
            evaluator: e.evaluator_id ? { id: e.evaluator_id, name: e.evaluator_name } : null
        }));

        ctx.success(mapped);
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

    // ============ ANNOUNCEMENTS ============
    router.get('/announcements', async (ctx) => {
        const announcements = await db.table('announcements')
            .orderBy('created_at', 'DESC')
            .get();
        ctx.success(announcements || []);
    });

    // ============ PAYROLL ============
    router.get('/payroll', async (ctx) => {
        // Basic payroll data - can be expanded later
        const payroll = await db.raw(`
            SELECT 
                employees.id as employee_id,
                employees.first_name,
                employees.last_name,
                employees.position,
                COUNT(attendances.id) as days_worked,
                SUM(TIMESTAMPDIFF(HOUR, attendances.clock_in, IFNULL(attendances.clock_out, NOW()))) as total_hours
            FROM employees
            LEFT JOIN attendances ON employees.id = attendances.employee_id
            WHERE employees.status = 'active'
            GROUP BY employees.id, employees.first_name, employees.last_name, employees.position
        `) || [];

        ctx.success(payroll);
    });
};
