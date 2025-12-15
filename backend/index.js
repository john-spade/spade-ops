import 'dotenv/config';
import { Callie, db, cors, secureHeaders } from './src/index.js';
import apiRoutes from './app/routes/api.js';
import authRoutes from './app/routes/auth.js';

const app = new Callie();

// Global middleware
app.use(cors({
    origin: true, // Allow all origins temporarily to fix the issue
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(secureHeaders());

// Routes
app.group('/api', apiRoutes);
app.group('/auth', authRoutes);

// Health check
app.get('/', (ctx) => {
    ctx.success({ message: 'SPADE-OPS API is running' });
});

// Start server
async function start() {
    try {
        await db.connect();
        console.log('✅ Database connected');

        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
        });
    } catch (err) {
        console.error('❌ Failed to start server:', err);
        process.exit(1);
    }
}

start();
