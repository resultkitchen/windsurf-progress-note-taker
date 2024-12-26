const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create database connection
const db = new sqlite3.Database(path.join(__dirname, 'database.sqlite'), (err) => {
    if (err) {
        console.error('Error connecting to database:', err);
    } else {
        console.log('Connected to database');
        initializeDatabase();
    }
});

// Initialize database tables
function initializeDatabase() {
    db.serialize(() => {
        // Guidelines table
        db.run(`CREATE TABLE IF NOT EXISTS guidelines (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            content TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Sample notes table
        db.run(`CREATE TABLE IF NOT EXISTS sample_notes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            guideline_id INTEGER,
            content TEXT NOT NULL,
            score REAL,
            feedback TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (guideline_id) REFERENCES guidelines(id)
        )`);
    });
}

// Get latest guidelines
function getLatestGuidelines() {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.get(
                'SELECT * FROM guidelines ORDER BY created_at DESC LIMIT 1',
                (err, row) => {
                    if (err) {
                        console.error('Error getting guidelines:', err);
                        reject(err);
                    } else {
                        resolve(row || null);
                    }
                }
            );
        });
    });
}

// Get sample notes for a guideline
function getSampleNotes(guidelineId) {
    return new Promise((resolve, reject) => {
        db.all(
            'SELECT * FROM sample_notes WHERE guideline_id = ? ORDER BY created_at DESC',
            [guidelineId],
            (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            }
        );
    });
}

// Save new guidelines
function saveGuidelines(content) {
    return new Promise((resolve, reject) => {
        db.run(
            'INSERT INTO guidelines (content) VALUES (?)',
            [content],
            function(err) {
                if (err) reject(err);
                else resolve(this.lastID);
            }
        );
    });
}

// Save sample note
function saveSampleNote(guidelineId, content, score, feedback) {
    return new Promise((resolve, reject) => {
        db.run(
            'INSERT INTO sample_notes (guideline_id, content, score, feedback) VALUES (?, ?, ?, ?)',
            [guidelineId, content, score, feedback],
            function(err) {
                if (err) reject(err);
                else resolve(this.lastID);
            }
        );
    });
}

module.exports = {
    getLatestGuidelines,
    getSampleNotes,
    saveGuidelines,
    saveSampleNote
};
