-- Drop existing tables
DROP TABLE IF EXISTS guidelines_feedback;
DROP TABLE IF EXISTS sample_note_tags;
DROP TABLE IF EXISTS note_tags;
DROP TABLE IF EXISTS sample_notes;
DROP TABLE IF EXISTS guidelines;

-- Create new guidelines table
CREATE TABLE guidelines (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create new sample notes table
CREATE TABLE sample_notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content TEXT NOT NULL,
    quality TEXT CHECK(quality IN ('excellent', 'good', 'needs_improvement')) NOT NULL,
    guidelines_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (guidelines_id) REFERENCES guidelines(id) ON DELETE CASCADE
);
