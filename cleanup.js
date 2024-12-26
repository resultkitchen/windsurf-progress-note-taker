const fs = require('fs');
const path = require('path');

const filesToRemove = [
    'src/routes/admin.js',
    'test/integration.test.js',
    'tests/guidelines.test.js',
    'tests/README.md'
];

filesToRemove.forEach(file => {
    const fullPath = path.join(__dirname, file);
    try {
        if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
            console.log(`Removed ${file}`);
        } else {
            console.log(`File ${file} does not exist`);
        }
    } catch (err) {
        console.error(`Error removing ${file}:`, err);
    }
});

// Remove tests directory if empty
const testsDir = path.join(__dirname, 'tests');
try {
    if (fs.existsSync(testsDir)) {
        const files = fs.readdirSync(testsDir);
        if (files.length === 0) {
            fs.rmdirSync(testsDir);
            console.log('Removed empty tests directory');
        }
    }
} catch (err) {
    console.error('Error removing tests directory:', err);
}
