const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Read schema file
const schema = fs.readFileSync(path.join(__dirname, '..', 'src', 'schema.sql'), 'utf8');

// Connect to database
const db = new sqlite3.Database(path.join(__dirname, '..', 'database.sqlite'), (err) => {
    if (err) {
        console.error('Error connecting to database:', err);
        process.exit(1);
    }
    console.log('Connected to database');
});

// Execute schema
db.exec(schema, (err) => {
    if (err) {
        console.error('Error initializing database:', err);
        process.exit(1);
    }
    console.log('Database initialized successfully');
    db.close();
});
