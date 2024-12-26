const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Database file path
const dbPath = path.join(__dirname, 'notes.db');

// Delete existing database if it exists
if (fs.existsSync(dbPath)) {
    try {
        fs.unlinkSync(dbPath);
        console.log('Existing database deleted');
    } catch (error) {
        console.error('Error deleting database:', error);
        process.exit(1);
    }
}

// Create new database
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) {
        console.error('Error creating database:', err);
        process.exit(1);
    }
    console.log('New database created');
});

// Initialize schema
db.serialize(() => {
    // Enable foreign keys
    db.run('PRAGMA foreign_keys = ON');

    // Create guidelines table
    db.run(`
        CREATE TABLE guidelines (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            content TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) {
            console.error('Error creating guidelines table:', err);
            process.exit(1);
        }
    });

    // Create sample_notes table
    db.run(`
        CREATE TABLE sample_notes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            content TEXT NOT NULL,
            quality TEXT CHECK(quality IN ('excellent', 'good', 'needs_improvement')) NOT NULL,
            guideline_id INTEGER NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (guideline_id) REFERENCES guidelines(id) ON DELETE CASCADE
        )
    `, (err) => {
        if (err) {
            console.error('Error creating sample_notes table:', err);
            process.exit(1);
        }
    });

    // Create indices
    db.run('CREATE INDEX idx_guidelines_created_at ON guidelines(created_at DESC)');
    db.run('CREATE INDEX idx_sample_notes_guideline ON sample_notes(guideline_id)');

    console.log('Schema initialized successfully');
});

// Close database connection
db.close((err) => {
    if (err) {
        console.error('Error closing database:', err);
        process.exit(1);
    }
    console.log('Database closed');
});
