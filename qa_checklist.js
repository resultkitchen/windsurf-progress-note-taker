const axios = require('axios');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs').promises;

const BASE_URL = 'http://localhost:3000';
const DB_PATH = path.join(__dirname, 'src', 'database.sqlite');

// Helper function to clear database
async function clearDatabase() {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(DB_PATH, (err) => {
            if (err) {
                reject(err);
                return;
            }
            db.run('DELETE FROM guidelines', (err) => {
                if (err) {
                    db.close();
                    reject(err);
                    return;
                }
                db.close((err) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve();
                });
            });
        });
    });
}

async function checkFileExists(filepath) {
    try {
        await fs.access(filepath);
        return true;
    } catch {
        return false;
    }
}

async function runQAChecks() {
    console.log('🔍 Starting QA Checks...\n');
    
    const checks = {
        requiredFiles: false,
        homepage: false,
        guidelines: false,
        database: false,
        guidelinesSave: false,
        dashboardRedirect: false,
        errorHandling: false
    };

    try {
        // 1. Check Required Files
        console.log('1️⃣ Checking Required Files...');
        const requiredFiles = [
            'src/server.js',
            'src/db.js',
            'src/routes/pages.js',
            'src/routes/api.js',
            'src/views/index.ejs',
            'src/views/guidelines.ejs',
            'src/views/dashboard.ejs',
            'src/views/partials/header.ejs',
            'src/views/partials/footer.ejs'
        ];

        const fileChecks = await Promise.all(
            requiredFiles.map(async file => {
                const exists = await checkFileExists(path.join(__dirname, file));
                if (!exists) console.log(`❌ Missing file: ${file}`);
                return exists;
            })
        );

        if (fileChecks.every(check => check)) {
            console.log('✅ All required files present');
            checks.requiredFiles = true;
        }

        // 2. Check Homepage
        console.log('\n2️⃣ Testing Homepage...');
        const home = await axios.get(BASE_URL);
        if (home.status === 200 && home.data.includes('Get Started')) {
            console.log('✅ Homepage loads successfully with Get Started button');
            checks.homepage = true;
        }

        // 3. Check Guidelines Page
        console.log('\n3️⃣ Testing Guidelines Page...');
        const guidelines = await axios.get(`${BASE_URL}/guidelines`);
        if (guidelines.status === 200 && guidelines.data.includes('guidelinesForm')) {
            console.log('✅ Guidelines page loads successfully with form');
            checks.guidelines = true;
        }

        // 4. Check Database Connection
        console.log('\n4️⃣ Testing Database Connection...');
        await new Promise((resolve, reject) => {
            const db = new sqlite3.Database(DB_PATH, (err) => {
                if (err) {
                    reject(err);
                    return;
                }
                db.get('SELECT 1', (err) => {
                    if (err) {
                        db.close();
                        reject(err);
                        return;
                    }
                    db.close((err) => {
                        if (err) {
                            reject(err);
                            return;
                        }
                        resolve();
                    });
                });
            });
        });
        console.log('✅ Database connection successful');
        checks.database = true;

        // 5. Test Guidelines Save
        console.log('\n5️⃣ Testing Guidelines Save...');
        const saveResponse = await axios.post(`${BASE_URL}/api/guidelines`, {
            content: 'Test Guideline Content'
        });
        if (saveResponse.data.success) {
            console.log('✅ Guidelines save successfully');
            checks.guidelinesSave = true;
        }

        // Clear database before testing redirect
        console.log('\nClearing database...');
        await clearDatabase();
        
        // Add a small delay to ensure database changes are processed
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        console.log('Database cleared');

        // 6. Test Dashboard Redirect
        console.log('\n6️⃣ Testing Dashboard Redirect...');
        const dashboardRes = await axios.get(`${BASE_URL}/dashboard`, {
            maxRedirects: 0,
            validateStatus: null
        });

        if (dashboardRes.status === 302 && 
            dashboardRes.headers.location === '/guidelines') {
            checks.dashboardRedirect = true;
            console.log('✅ Dashboard properly redirects when no guidelines');
        } else {
            console.log('Response:', {
                status: dashboardRes.status,
                headers: dashboardRes.headers,
                data: dashboardRes.data.slice(0, 100) // First 100 chars only
            });
            console.log('❌ Dashboard should redirect when no guidelines exist');
        }

        // 7. Test Error Handling
        console.log('\n7️⃣ Testing Error Handling...');
        try {
            await axios.post(`${BASE_URL}/api/guidelines`, {});
            console.log('❌ Should have rejected empty guidelines');
        } catch (error) {
            if (error.response && error.response.status === 400) {
                console.log('✅ Properly handles invalid input');
                checks.errorHandling = true;
            }
        }

    } catch (error) {
        console.error('\n❌ Error during QA checks:', error.message);
    }

    // Summary
    console.log('\n📋 QA Summary:');
    console.log('-------------');
    Object.entries(checks).forEach(([check, passed]) => {
        console.log(`${passed ? '✅' : '❌'} ${check}`);
    });

    const allPassed = Object.values(checks).every(v => v);
    console.log(`\n${allPassed ? '🎉 All checks passed!' : '⚠️ Some checks failed!'}`);

    return allPassed;
}

// Run if called directly
if (require.main === module) {
    runQAChecks().then(passed => {
        process.exit(passed ? 0 : 1);
    });
}

module.exports = runQAChecks;
