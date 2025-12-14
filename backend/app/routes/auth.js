import { db, hashPassword, verifyPassword, generateToken } from '../../src/index.js';

export default (router) => {
    router.post('/login', async (ctx) => {
        const { identifier, email, password } = ctx.body;
        const loginId = identifier || email;

        if (!loginId || !password) {
            return ctx.error('Email/Employee ID and password required', 400);
        }

        // First try to find user by email
        let user = await db.table('users').where({ email: loginId }).first();

        // If not found, try to find by employee_id
        if (!user) {
            const employee = await db.table('employees').where({ employee_id: loginId }).first();
            if (employee && employee.user_id) {
                user = await db.table('users').find(employee.user_id);
            }
        }

        if (!user || !(await verifyPassword(password, user.password))) {
            return ctx.error('Invalid credentials', 401);
        }

        const token = generateToken({ id: user.id, role: user.role });

        // Get associated employee or client data
        let profile = null;
        if (user.role === 'employee' || user.role === 'supervisor') {
            profile = await db.table('employees').where({ user_id: user.id }).first();
        } else if (user.role === 'client') {
            profile = await db.table('clients').where({ user_id: user.id }).first();
        }

        ctx.success({
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                profile
            },
            token
        });
    });

    router.post('/register', async (ctx) => {
        const { name, email, password, role = 'employee' } = ctx.body;

        if (!name || !email || !password) {
            return ctx.error('Name, email and password required', 400);
        }

        const existing = await db.table('users').where({ email }).first();
        if (existing) return ctx.error('Email already exists', 400);

        const hashedPassword = await hashPassword(password);
        const id = await db.insert('users', {
            name, email, password: hashedPassword, role
        });

        ctx.success({ id }, 'User registered', 201);
    });

    // Get current user info
    router.get('/me', async (ctx) => {
        if (!ctx.state.user) {
            return ctx.error('Not authenticated', 401);
        }

        const user = await db.table('users').find(ctx.state.user.id);
        if (!user) return ctx.error('User not found', 404);

        let profile = null;
        if (user.role === 'employee' || user.role === 'supervisor') {
            profile = await db.table('employees').where({ user_id: user.id }).first();
        } else if (user.role === 'client') {
            profile = await db.table('clients').where({ user_id: user.id }).first();
        }

        ctx.success({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            profile
        });
    });
};
