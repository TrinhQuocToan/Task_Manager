require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Import routes
const authRoutes = require('./src/routers/authRoutes');
const taskRoutes = require('./src/routers/taskRoutes');
const categoryRoutes = require('./src/routers/categoryRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS Configuration
const corsOptions = {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Authorization']
};

// Middleware
app.use(cors(corsOptions));

// Raw body parser for text/plain to handle JSON sent with wrong Content-Type
app.use((req, res, next) => {
    if ((req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH')
        && req.path.startsWith('/api')
        && req.headers['content-type']
        && req.headers['content-type'].includes('text/plain')) {
        
        let data = '';
        req.setEncoding('utf8');
        req.on('data', chunk => {
            data += chunk;
        });
        req.on('end', () => {
            try {
                // Try to parse as JSON
                req.body = JSON.parse(data);
                req.headers['content-type'] = 'application/json';
            } catch (e) {
                // Not valid JSON, will be handled by controller
            }
            next();
        });
    } else {
        next();
    }
});

// Body parsing middleware - must be after raw body handler
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Debug middleware to log all API requests
app.use((req, res, next) => {
    if (req.path.startsWith('/api')) {
        console.log(`${req.method} ${req.path}`);
        if (req.method === 'POST' || req.method === 'PUT') {
            console.log('Request body:', req.body);
            console.log('Content-Type:', req.headers['content-type']);
        }
    }
    next();
});

// Routes
app.get('/', (req, res) => {
    res.json({ 
        message: 'Task Manager API',
        status: 'Running',
        timestamp: new Date().toISOString()
    });
});

app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK',
        database: 'Connected',
        uptime: process.uptime()
    });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/tasks', taskRoutes);

// Debug: Log all registered routes
console.log('Registered routes:');
console.log('- POST /api/auth/register');
console.log('- POST /api/auth/login');
console.log('- GET /api/auth/me');
console.log('- PUT /api/auth/profile');
console.log('- PUT /api/auth/change-password');
console.log('- POST /api/tasks');
console.log('- GET /api/tasks');
console.log('- GET /api/tasks/:id');
console.log('- PUT /api/tasks/:id');
console.log('- DELETE /api/tasks/:id');

// 404 handler for API routes
app.use((req, res, next) => {
    if (req.path.startsWith('/api')) {
        return res.status(404).json({
            success: false,
            message: `API route not found: ${req.method} ${req.path}`
        });
    }
    next();
});

// Connect to database and start server
connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error('Failed to connect to database:', error);
        process.exit(1);
    });

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Promise Rejection:', err);
    process.exit(1);
});