const db = require('./index');

const testDatabase = async () => {
    try {
        // Test guidelines table
        console.log('Testing guidelines table...');
        const guidelineResult = await db.run(
            'INSERT INTO guidelines (content) VALUES (?)',
            ['Test guideline content']
        );
        console.log('Inserted guideline:', guidelineResult);

        const guideline = await db.get('SELECT * FROM guidelines ORDER BY created_at DESC LIMIT 1');
        console.log('Retrieved guideline:', guideline);

        // Test sample notes table
        console.log('\nTesting sample notes table...');
        const sampleNoteResult = await db.run(
            'INSERT INTO sample_notes (content, quality, guidelines_id) VALUES (?, ?, ?)',
            ['Test sample note', 'excellent', guideline.id]
        );
        console.log('Inserted sample note:', sampleNoteResult);

        const sampleNotes = await db.all('SELECT * FROM sample_notes WHERE guidelines_id = ?', [guideline.id]);
        console.log('Retrieved sample notes:', sampleNotes);

        console.log('\nDatabase test completed successfully');
    } catch (error) {
        console.error('Database test failed:', error);
    }
};

testDatabase();
