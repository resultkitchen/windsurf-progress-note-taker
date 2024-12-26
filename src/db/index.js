const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create database connection
const db = new sqlite3.Database(path.join(__dirname, 'notes.db'), (err) => {
    if (err) {
        console.error('Database connection error:', err);
        throw err;
    }
    console.log('Connected to database');
});

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON');

// Promisify database methods
const run = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function(err) {
            if (err) {
                console.error('Database error:', err);
                reject(err);
            } else {
                resolve({ lastID: this.lastID, changes: this.changes });
            }
        });
    });
};

const get = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, result) => {
            if (err) {
                console.error('Database error:', err);
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
};

const all = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) {
                console.error('Database error:', err);
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

// Guidelines operations
const getLatestGuidelines = () => {
    return get('SELECT * FROM guidelines ORDER BY created_at DESC LIMIT 1');
};

const createGuidelines = async (content) => {
    // Clear existing guidelines first
    await run('DELETE FROM guidelines');
    return run('INSERT INTO guidelines (content) VALUES (?)', [content]);
};

// Sample notes operations
const getSampleNotes = (guidelineId) => {
    return all(
        'SELECT * FROM sample_notes WHERE guideline_id = ? ORDER BY created_at DESC',
        [guidelineId]
    );
};

const createSampleNotes = async (guidelineId, notes) => {
    // Clear existing sample notes for this guideline
    await run('DELETE FROM sample_notes WHERE guideline_id = ?', [guidelineId]);
    
    // Insert new sample notes
    for (const note of notes) {
        await run(
            'INSERT INTO sample_notes (content, quality, guideline_id) VALUES (?, ?, ?)',
            [note, 'excellent', guidelineId]
        );
    }
};

module.exports = {
    get,
    all,
    run,
    getLatestGuidelines,
    createGuidelines,
    getSampleNotes,
    createSampleNotes
};
