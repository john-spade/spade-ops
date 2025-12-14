/**
 * callie CLI - init command
 * Scaffolds a new callie.js project
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function init(projectName, options = {}) {
    if (!projectName) {
        throw new Error('Project name is required. Usage: callie init <project-name>');
    }

    const targetDir = path.resolve(process.cwd(), projectName);

    // Check if directory exists
    if (fs.existsSync(targetDir)) {
        if (!options.force) {
            throw new Error(`Directory "${projectName}" already exists. Use --force to overwrite.`);
        }
    } else {
        fs.mkdirSync(targetDir, { recursive: true });
    }

    console.log(`\n🌸 Creating new callie.js project: ${projectName}\n`);

    // Create directory structure
    const dirs = [
        'app/routes',
        'app/controllers',
        'app/middlewares',
        'app/models',
        'app/services',
        'config',
        'database',
        'public'
    ];

    for (const dir of dirs) {
        const dirPath = path.join(targetDir, dir);
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`  📁 Created ${dir}/`);
    }

    // Create files from templates
    const files = getTemplateFiles(projectName);

    for (const [filePath, content] of Object.entries(files)) {
        const fullPath = path.join(targetDir, filePath);
        fs.writeFileSync(fullPath, content.trim() + '\n');
        console.log(`  📄 Created ${filePath}`);
    }

    console.log(`
✅ Project created successfully!

  Next steps:
    cd ${projectName}
    npm install
    
    # Configure your MySQL database in .env
    # Then start the dev server:
    npm run dev

  Happy coding! 🚀
`);
}

function getTemplateFiles(projectName) {
    return {
        'package.json': `{
  "name": "${projectName}",
  "version": "1.0.0",
  "description": "A callie.js application",
  "main": "index.js",
  "type": "module",
  "scripts": {
    "dev": "npx nodemon index.js",
    "start": "node index.js",
    "test": "node --test"
  },
  "dependencies": {
    "callie": "file:../",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.2"
  }
}`,

        '.env': `# Application
APP_NAME=${projectName}
APP_ENV=development
PORT=3000

# Database (MySQL)
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=${projectName.replace(/-/g, '_')}

# Authentication
JWT_SECRET=your-super-secret-key-change-this-in-production
JWT_EXPIRES_IN=24h

# CORS (comma-separated origins, or * for all)
CORS_ORIGIN=*`,

        '.env.example': `# Application
APP_NAME=${projectName}
APP_ENV=development
PORT=3000

# Database (MySQL)
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=${projectName.replace(/-/g, '_')}

# Authentication
JWT_SECRET=your-super-secret-key-change-this-in-production
JWT_EXPIRES_IN=24h

# CORS (comma-separated origins, or * for all)
CORS_ORIGIN=*`,

        '.gitignore': `node_modules/
.env
*.log
.DS_Store
coverage/
dist/`,

        'index.js': `/**
 * ${projectName} - Powered by callie.js
 */

import 'dotenv/config';
import { Callie, db, cors, secureHeaders, rateLimit } from 'callie';
import { logger } from 'callie/src/core/middleware.js';

// Import routes
import apiRoutes from './app/routes/api.js';
import authRoutes from './app/routes/auth.js';

const app = new Callie();

// Global middleware
app.use(logger());
app.use(cors());
app.use(secureHeaders());
app.use(rateLimit({ max: 100, windowMs: 60000 }));

// Health check
app.get('/health', async (ctx) => {
  const dbHealthy = await db.healthCheck();
  ctx.success({ 
    status: 'ok',
    database: dbHealthy ? 'connected' : 'disconnected'
  });
});

// Mount routes
app.group('/api', apiRoutes);
app.group('/auth', authRoutes);

// 404 handler for unmatched routes
app.use(async (ctx) => {
  if (!ctx.responded) {
    ctx.error('Not found', 404);
  }
});

// Start server
async function start() {
  try {
    // Connect to database
    await db.connect();
    
    // Start HTTP server
    app.listen(process.env.PORT || 3000);
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
}

start();`,

        'callie.config.js': `/**
 * Callie.js Configuration
 */

export default {
  // Application settings
  app: {
    name: process.env.APP_NAME || '${projectName}',
    env: process.env.APP_ENV || 'development',
    debug: process.env.APP_ENV !== 'production'
  },

  // Server settings
  server: {
    port: parseInt(process.env.PORT || '3000', 10),
    host: process.env.HOST || '0.0.0.0'
  },

  // Database settings
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || '${projectName.replace(/-/g, '_')}',
    connectionLimit: 10
  },

  // JWT settings
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  },

  // CORS settings
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true
  }
};`,

        'app/routes/api.js': `/**
 * API Routes
 */

import { Router, validate } from 'callie';
import { UserController } from '../controllers/UserController.js';

export default function(router) {
  // Example: Users CRUD
  router.get('/users', UserController.index);
  router.get('/users/:id', UserController.show);
  router.post('/users', 
    validate({
      name: 'required|string|min:2',
      email: 'required|email'
    }),
    UserController.store
  );
  router.put('/users/:id', UserController.update);
  router.delete('/users/:id', UserController.destroy);
}`,

        'app/routes/auth.js': `/**
 * Authentication Routes
 */

import { validate, auth, authRateLimit } from 'callie';
import { AuthController } from '../controllers/AuthController.js';

export default function(router) {
  // Public routes
  router.post('/register',
    validate({
      name: 'required|string|min:2',
      email: 'required|email',
      password: 'required|string|min:8'
    }),
    AuthController.register
  );

  router.post('/login',
    authRateLimit(),
    validate({
      email: 'required|email',
      password: 'required|string'
    }),
    AuthController.login
  );

  // Protected routes
  router.get('/me', auth(), AuthController.me);
  router.post('/logout', auth(), AuthController.logout);
}`,

        'app/controllers/UserController.js': `/**
 * User Controller
 * Handles user CRUD operations
 */

import { db, assertFound } from 'callie';

export const UserController = {
  /**
   * Get all users
   */
  async index(ctx) {
    const page = parseInt(ctx.query.page || '1', 10);
    const perPage = parseInt(ctx.query.per_page || '10', 10);

    const users = await db.table('users')
      .select('id', 'name', 'email', 'created_at')
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
  },

  /**
   * Get a single user
   */
  async show(ctx) {
    const user = await db.table('users')
      .select('id', 'name', 'email', 'created_at')
      .where({ id: ctx.params.id })
      .first();

    assertFound(user, 'User not found');
    ctx.success(user);
  },

  /**
   * Create a new user
   */
  async store(ctx) {
    const { name, email } = ctx.body;

    // Check if email exists
    const existing = await db.table('users').where({ email }).first();
    if (existing) {
      return ctx.error('Email already exists', 400);
    }

    const id = await db.insert('users', {
      name,
      email,
      created_at: new Date()
    });

    const user = await db.find('users', id);
    ctx.success(user, 'User created', 201);
  },

  /**
   * Update a user
   */
  async update(ctx) {
    const { id } = ctx.params;
    const user = await db.find('users', id);
    assertFound(user, 'User not found');

    const updates = {};
    if (ctx.body.name) updates.name = ctx.body.name;
    if (ctx.body.email) updates.email = ctx.body.email;
    updates.updated_at = new Date();

    await db.update('users', updates).where({ id }).update(updates);

    const updated = await db.find('users', id);
    ctx.success(updated, 'User updated');
  },

  /**
   * Delete a user
   */
  async destroy(ctx) {
    const { id } = ctx.params;
    const user = await db.find('users', id);
    assertFound(user, 'User not found');

    await db.delete('users').where({ id }).delete();
    ctx.success(null, 'User deleted');
  }
};`,

        'app/controllers/AuthController.js': `/**
 * Auth Controller
 * Handles authentication
 */

import { db, hashPassword, verifyPassword, generateTokenPair, assertFound } from 'callie';

export const AuthController = {
  /**
   * Register a new user
   */
  async register(ctx) {
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
  },

  /**
   * Login
   */
  async login(ctx) {
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
  },

  /**
   * Get current user
   */
  async me(ctx) {
    const userId = ctx.state.userId;
    
    const user = await db.table('users')
      .select('id', 'name', 'email', 'role', 'created_at')
      .find(userId);

    assertFound(user, 'User not found');
    ctx.success(user);
  },

  /**
   * Logout (client-side token removal)
   */
  async logout(ctx) {
    // With JWT, logout is handled client-side by removing the token
    // Optionally, you could implement a token blacklist here
    ctx.success(null, 'Logged out successfully');
  }
};`,

        'app/middlewares/example.js': `/**
 * Example Middleware
 */

export async function exampleMiddleware(ctx, next) {
  // Before handler
  console.log('Before:', ctx.method, ctx.path);
  
  await next();
  
  // After handler
  console.log('After:', ctx.res.statusCode);
}`,

        'app/models/User.js': `/**
 * User Model (Optional - use if you prefer model-based approach)
 */

import { db } from 'callie';

export const User = {
  table: 'users',

  async all() {
    return db.table(this.table).get();
  },

  async find(id) {
    return db.table(this.table).find(id);
  },

  async findByEmail(email) {
    return db.table(this.table).where({ email }).first();
  },

  async create(data) {
    const id = await db.insert(this.table, {
      ...data,
      created_at: new Date()
    });
    return this.find(id);
  },

  async update(id, data) {
    await db.update(this.table, {
      ...data,
      updated_at: new Date()
    }).where({ id }).update({ ...data, updated_at: new Date() });
    return this.find(id);
  },

  async delete(id) {
    return db.delete(this.table).where({ id }).delete();
  }
};`,

        'app/services/example.js': `/**
 * Example Service
 * Business logic should go here, not in controllers
 */

export class ExampleService {
  async doSomething(data) {
    // Business logic here
    return { processed: data };
  }
}`,

        'database/schema.sql': `-- ${projectName} Database Schema
-- Run this SQL to create the required tables

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255),
  role ENUM('user', 'admin', 'moderator') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add more tables as needed
`,

        'README.md': `# ${projectName}

A backend API powered by **callie.js** - The Lightweight JS Framework.

## Getting Started

### Prerequisites
- Node.js 18+
- MySQL 5.7+ or MariaDB 10.3+

### Installation

\`\`\`bash
npm install
\`\`\`

### Configuration

1. Copy \`.env.example\` to \`.env\`
2. Update database credentials in \`.env\`
3. Create the database:
   \`\`\`bash
   mysql -u root -p -e "CREATE DATABASE ${projectName.replace(/-/g, '_')}"
   \`\`\`
4. Run the schema:
   \`\`\`bash
   mysql -u root -p ${projectName.replace(/-/g, '_')} < database/schema.sql
   \`\`\`

### Development

\`\`\`bash
npm run dev
\`\`\`

### Production

\`\`\`bash
npm start
\`\`\`

## API Endpoints

### Authentication
- \`POST /auth/register\` - Register a new user
- \`POST /auth/login\` - Login and get JWT token
- \`GET /auth/me\` - Get current user (requires auth)
- \`POST /auth/logout\` - Logout (requires auth)

### Users
- \`GET /api/users\` - List all users
- \`GET /api/users/:id\` - Get a user
- \`POST /api/users\` - Create a user
- \`PUT /api/users/:id\` - Update a user
- \`DELETE /api/users/:id\` - Delete a user

## Project Structure

\`\`\`
├── app/
│   ├── routes/        # Route definitions
│   ├── controllers/   # Request handlers
│   ├── middlewares/   # Custom middleware
│   ├── models/        # Data models (optional)
│   └── services/      # Business logic
├── config/            # Configuration files
├── database/          # Database schemas/seeds
├── public/            # Static files
├── .env               # Environment variables
├── index.js           # Application entry point
└── callie.config.js   # Framework configuration
\`\`\`

## License

MIT
`
    };
}
