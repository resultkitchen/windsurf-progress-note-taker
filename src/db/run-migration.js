const sqlite3 = require('sqlite3').verbose();
const fs = require('fs').promises;
const path = require('path');

async function runMigration() {
    const db = new sqlite3.Database(path.join(__dirname, 'notes.db'));
    
    try {
        const migrationSQL = await fs.readFile(
            path.join(__dirname, 'migrations', '004_update_guidelines_schema.sql'),
            'utf8'
        );

        return new Promise((resolve, reject) => {
            db.exec(migrationSQL, (err) => {
                if (err) {
                    console.error('Migration failed:', err);
                    reject(err);
                } else {
                    console.log('Migration completed successfully');
                    resolve();
                }
            });
        });
    } catch (error) {
        console.error('Error running migration:', error);
        throw error;
    } finally {
        db.close();
    }
}

runMigration();
