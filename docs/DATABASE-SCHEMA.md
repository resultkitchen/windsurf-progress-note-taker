# Database Schema

## Overview
The QuickNotes application uses SQLite3 for data storage. The database consists of two main tables:
1. `guidelines` - Stores the current evaluation guidelines
2. `sample_notes` - Stores example notes that demonstrate proper formatting

## Tables

### guidelines
Stores the current evaluation guidelines. Only one set of guidelines should be active at a time.

```sql
CREATE TABLE guidelines (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

Fields:
- `id`: Unique identifier for the guidelines
- `content`: The actual guidelines text
- `created_at`: Timestamp when the guidelines were created

### sample_notes
Stores example notes that demonstrate proper note formatting according to the guidelines.

```sql
CREATE TABLE sample_notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content TEXT NOT NULL,
    quality TEXT CHECK(quality IN ('excellent', 'good', 'needs_improvement')) NOT NULL,
    guideline_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (guideline_id) REFERENCES guidelines(id) ON DELETE CASCADE
);
```

Fields:
- `id`: Unique identifier for the sample note
- `content`: The actual note content
- `quality`: Rating of the note quality (excellent, good, or needs_improvement)
- `guideline_id`: References the guidelines this note follows
- `created_at`: Timestamp when the note was created

## Relationships
- Each sample note is associated with one set of guidelines through the `guideline_id` foreign key
- When guidelines are deleted, all associated sample notes are automatically deleted (CASCADE)

## Indices
- `guidelines.created_at` is indexed in descending order to quickly fetch the most recent guidelines
- `sample_notes.guideline_id` is indexed to optimize joins and lookups

## Notes
1. The schema uses SQLite3's automatic timestamp management
2. Foreign key constraints are enabled to maintain data integrity
3. The quality field uses a CHECK constraint to ensure valid values
