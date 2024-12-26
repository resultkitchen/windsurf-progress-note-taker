const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'notes.db');

try {
    if (fs.existsSync(dbPath)) {
        fs.unlinkSync(dbPath);
        console.log('Database file deleted successfully');
    } else {
        console.log('Database file does not exist');
    }
} catch (err) {
    console.error('Error deleting database:', err);
}
