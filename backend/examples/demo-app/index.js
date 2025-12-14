/**
 * Demo Application - Powered by callie.js
 * A complete example showing all framework features
 */

import 'dotenv/config';
import { Callie, db, cors, secureHeaders, rateLimit, auth, validate } from '../src/index.js';
import { logger } from '../src/core/middleware.js';
import { hashPassword, verifyPassword, generateTokenPair } from '../src/auth/index.js';

const app = new Callie();

// ============================================
// Global Middleware
// ============================================

app.use(logger({ format: 'detailed' }));
app.use(cors());
app.use(secureHeaders());
app.use(rateLimit({ max: 100, windowMs: 60000 }));

// ============================================
// Public Routes
// ============================================

// Health check endpoint
app.get('/health', async (ctx) => {
    const dbHealthy = await db.healthCheck().catch(() => false);
    ctx.success({
        status: 'ok',
        timestamp: new Date().toISOString(),
        database: dbHealthy ? 'connected' : 'disconnected'
    });
});

// Welcome endpoint
app.get('/', async (ctx) => {
    ctx.success({
        name: 'callie.js Demo API',
        version: '1.0.0',
        docs: '/docs'
    }, 'Welcome to callie.js!');
});

// API Documentation
app.get('/docs', async (ctx) => {
    ctx.success({
        endpoints: [
            { method: 'GET', path: '/', description: 'Welcome message' },
            { method: 'GET', path: '/health', description: 'Health check' },
            { method: 'POST', path: '/auth/register', description: 'Register a new user' },
            { method: 'POST', path: '/auth/login', description: 'Login and get JWT token' },
            { method: 'GET', path: '/auth/me', description: 'Get current user (auth required)' },
            { method: 'GET', path: '/api/users', description: 'List all users' },
            { method: 'GET', path: '/api/users/:id', description: 'Get a single user' },
            { method: 'POST', path: '/api/users', description: 'Create a user' },
            { method: 'PUT', path: '/api/users/:id', description: 'Update a user' },
            { method: 'DELETE', path: '/api/users/:id', description: 'Delete a user' }
        ]
    });
});

// ============================================
// Auth Routes
// ============================================

app.group('/auth', (router) => {
    // Register
    router.post('/register',
        validate({
            name: 'required|string|min:2',
            email: 'required|email',
            password: 'required|string|min:8'
        }),
        async (ctx) => {
            const { name, email, password } = ctx.body;

            // Check if email exists
            const existing = await db.table('users').where({ email }).first();
            if (existing) {
                return ctx.error('Email already registered', 400);
            }

            // Hash password and create user
            const hashedPassword = await hashPassword(password);

            const id = await db.insert('users', {
                name,
                email,
                password: hashedPassword,
                role: 'user',
                created_at: new Date()
            });

            const user = await db.table('users')
                .select('id', 'name', 'email', 'role')
                .find(id);

            // Generate tokens
            const tokens = generateTokenPair({
                id: user.id,
                email: user.email,
                role: user.role
            });

            ctx.success({
                user,
                ...tokens
            }, 'Registration successful', 201);
        }
    );

    // Login
    router.post('/login',
        validate({
            email: 'required|email',
            password: 'required|string'
        }),
        async (ctx) => {
            const { email, password } = ctx.body;

            // Find user
            const user = await db.table('users').where({ email }).first();
            if (!user) {
                return ctx.error('Invalid credentials', 401);
            }

            // Verify password
            const valid = await verifyPassword(password, user.password);
            if (!valid) {
                return ctx.error('Invalid credentials', 401);
            }

            // Generate tokens
            const tokens = generateTokenPair({
                id: user.id,
                email: user.email,
                role: user.role
            });

            ctx.success({
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                },
                ...tokens
            }, 'Login successful');
        }
    );

    // Get current user (protected)
    router.get('/me', auth(), async (ctx) => {
        const user = await db.table('users')
            .select('id', 'name', 'email', 'role', 'created_at')
            .find(ctx.state.userId);

        if (!user) {
            return ctx.error('User not found', 404);
        }

        ctx.success(user);
    });
});

// ============================================
// API Routes (Users CRUD)
// ============================================

app.group('/api', (router) => {
    // List users
    router.get('/users', async (ctx) => {
        const page = parseInt(ctx.query.page || '1', 10);
        const perPage = parseInt(ctx.query.per_page || '10', 10);

        const users = await db.table('users')
            .select('id', 'name', 'email', 'role', 'created_at')
            .orderBy('id', 'DESC')
            .paginate(page, perPage)
            .get();

        const total = await db.table('users').count();

        ctx.json({
            success: true,
            data: users,
            pagination: {
                page,
                perPage,
                total,
                totalPages: Math.ceil(total / perPage)
            }
        });
    });

    // Get single user
    router.get('/users/:id', async (ctx) => {
        const user = await db.table('users')
            .select('id', 'name', 'email', 'role', 'created_at')
            .find(ctx.params.id);

        if (!user) {
            return ctx.error('User not found', 404);
        }

        ctx.success(user);
    });

    // Create user
    router.post('/users',
        validate({
            name: 'required|string|min:2',
            email: 'required|email'
        }),
        async (ctx) => {
            const { name, email } = ctx.body;

            const existing = await db.table('users').where({ email }).first();
            if (existing) {
                return ctx.error('Email already exists', 400);
            }

            const id = await db.insert('users', {
                name,
                email,
                role: 'user',
                created_at: new Date()
            });

            const user = await db.find('users', id);
            ctx.success(user, 'User created', 201);
        }
    );

    // Update user (protected - admin only)
    router.put('/users/:id', auth('admin'), async (ctx) => {
        const { id } = ctx.params;
        const user = await db.find('users', id);

        if (!user) {
            return ctx.error('User not found', 404);
        }

        const updates = {};
        if (ctx.body.name) updates.name = ctx.body.name;
        if (ctx.body.email) updates.email = ctx.body.email;
        if (ctx.body.role) updates.role = ctx.body.role;
        updates.updated_at = new Date();

        await db.table('users').where({ id }).update(updates);

        const updated = await db.find('users', id);
        ctx.success(updated, 'User updated');
    });

    // Delete user (protected - admin only)
    router.delete('/users/:id', auth('admin'), async (ctx) => {
        const { id } = ctx.params;
        const user = await db.find('users', id);

        if (!user) {
            return ctx.error('User not found', 404);
        }

        await db.table('users').where({ id }).delete();
        ctx.success(null, 'User deleted');
    });
});

// ============================================
// Start Server
// ============================================

async function start() {
    try {
        // Connect to database
        await db.connect();

        // Create tables if they don't exist
        await initDatabase();

        // Start HTTP server
        app.listen(process.env.PORT || 3000);
    } catch (err) {
        console.error('Failed to start server:', err.message);
        console.log('\n💡 Tip: Make sure MySQL is running and .env is configured correctly.\n');
    }
}

async function initDatabase() {
    try {
        await db.raw(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255),
        role ENUM('user', 'admin', 'moderator') DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
        console.log('✅ Database tables ready');
    } catch (err) {
        console.warn('⚠️  Could not create tables:', err.message);
    }
}

start();
