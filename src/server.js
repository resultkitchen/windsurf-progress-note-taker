const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

// Create Express app
const app = express();

// Configure middleware
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Import routes
const apiRoutes = require('./routes/api');
const pageRoutes = require('./routes/pages');

// Use routes
app.use('/', pageRoutes);
app.use('/', apiRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        error: 'Internal server error'
    });
});

// Start server
const startServer = (port) => {
    return new Promise((resolve, reject) => {
        const server = app.listen(port, () => {
            console.log(`Server running on port ${port}`);
            resolve(server);
        }).on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                console.log(`Port ${port} is busy, trying ${port + 1}`);
                resolve(startServer(port + 1));
            } else {
                reject(err);
            }
        });
    });
};

// Start server with port fallback
startServer(3000).catch(err => {
    console.error('Failed to start server:', err);
    process.exit(1);
});
