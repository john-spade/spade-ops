import { db, hashPassword, verifyPassword, generateToken } from '../../src/index.js';

export default (router) => {
    router.post('/login', async (ctx) => {
        const { email, password } = ctx.body;

        const user = await db.table('users').where({ email }).first();

        if (!user || !(await verifyPassword(password, user.password))) {
            return ctx.error('Invalid credentials', 401);
        }

        const token = generateToken({ id: user.id, role: user.role });

        ctx.success({
            user: { id: user.id, name: user.name, email: user.email, role: user.role },
            token
        });
    });

    router.post('/register', async (ctx) => {
        const { name, email, password } = ctx.body;

        const existing = await db.table('users').where({ email }).first();
        if (existing) return ctx.error('Email already exists', 400);

        const hashedPassword = await hashPassword(password);
        await db.insert('users', {
            name, email, password: hashedPassword
        });

        ctx.success(null, 'User registered', 201);
    });
};
