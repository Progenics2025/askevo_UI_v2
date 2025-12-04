const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        // Allow any origin
        return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400 // 24 hours
}));
app.use(express.json());
app.use(morgan('dev'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve production frontend build
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Proxy for Ollama with streaming support
const { createProxyMiddleware } = require('http-proxy-middleware');
app.use('/api/ollama', createProxyMiddleware({
    target: 'http://localhost:11434',
    changeOrigin: true,
    pathRewrite: {
        '^/api/ollama': '' // /api/ollama/api/chat -> /api/chat
    },
    onProxyReq: (proxyReq) => {
        proxyReq.setHeader('Connection', 'keep-alive');
    },
    onProxyRes: (proxyRes) => {
        // Disable buffering for streaming
        proxyRes.headers['x-accel-buffering'] = 'no';
        delete proxyRes.headers['content-length'];
    }
}));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/files', require('./routes/files'));
app.use('/api/pedigree', require('./routes/pedigree'));

// Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});

// SPA fallback - serve index.html for all non-API routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

// Error Handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`Progenics AI Backend running on http://localhost:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
});
