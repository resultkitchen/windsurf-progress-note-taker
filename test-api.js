const axios = require('axios');
require('dotenv').config();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const puppeteer = require('puppeteer'); // Add this for UI testing

// Test configuration
const config = {
    baseUrl: 'http://localhost:3000',
    dbPath: path.join(__dirname, 'database.sqlite')
};

// UI Test Suite
async function runUITests(slug) {
    console.log('\n=== Running UI Tests ===\n');
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    try {
        // Test 1: Load Demo Page
        console.log('Testing demo page load...');
        await page.goto(`${config.baseUrl}/demo/${slug}`);
        await page.waitForSelector('#noteInput');
        console.log('✅ Demo page loaded successfully');

        // Test 2: Guidelines Editor
        console.log('\nTesting guidelines editor...');
        await page.click('button[onclick="editGuidelines()"]');
        await page.waitForSelector('#guidelinesEditor');
        const guidelinesVisible = await page.$eval('#guidelinesEdit', el => el.style.display !== 'none');
        console.log(guidelinesVisible ? '✅ Guidelines editor opened successfully' : '❌ Guidelines editor failed to open');

        // Test 3: Note Evaluation
        console.log('\nTesting note evaluation...');
        await page.type('#noteInput', 'Test note for evaluation');
        await page.click('#evaluateBtn');
        await page.waitForSelector('#evaluationResult');
        console.log('✅ Note evaluation completed');

        // Test 4: Sample Notes Editor
        console.log('\nTesting sample notes editor...');
        await page.click('button[onclick="editSampleNotes()"]');
        await page.waitForSelector('#sampleNotesContainer');
        await page.click('button[onclick="addSampleNoteField()"]');
        const newNoteField = await page.$('#sampleNotesContainer textarea');
        console.log(newNoteField ? '✅ Sample notes editor working' : '❌ Sample notes editor failed');

        // Test 5: AI Guidelines Modifier
        console.log('\nTesting AI guidelines modifier...');
        await page.click('button[onclick="showAIModifier()"]');
        await page.waitForSelector('#aiModifierModal');
        await page.type('#aiModifierFeedback', 'Test feedback');
        await page.click('button[onclick="getAIModifierSuggestion()"]');
        await page.waitForSelector('#aiSuggestion');
        console.log('✅ AI modifier working');

        console.log('\n✅ All UI tests completed successfully!');
    } catch (error) {
        console.error('\n❌ UI test failed:', error.message);
    } finally {
        await browser.close();
    }
}

// API Test Suite
async function runAPITests() {
    console.log('Starting API tests...\n');

    try {
        // Test database connection
        console.log('=== Testing Database Connection ===');
        const dbResponse = await axios.get(`${config.baseUrl}/test-db`);
        if (dbResponse.data.success) {
            console.log('✅ Database connection successful');
        }

        // Test guidelines creation
        console.log('\n=== Testing Guidelines Creation ===');
        const guidelinesResponse = await axios.post(`${config.baseUrl}/api/guidelines`, {
            title: 'Test Guidelines',
            description: 'Test guidelines description',
            sections: [
                {
                    name: 'Section 1',
                    description: 'Test section content',
                    weight: 1,
                    required: true,
                    order: 0
                }
            ]
        });
        console.log('✅ Guidelines creation successful');
        const { masterId } = guidelinesResponse.data;

        // Test guidelines retrieval
        console.log('\n=== Testing Guidelines Retrieval ===');
        const getResponse = await axios.get(`${config.baseUrl}/api/guidelines/${masterId}`);
        console.log('✅ Guidelines retrieval successful');

        // Test guidelines update
        console.log('\n=== Testing Guidelines Update ===');
        const updateResponse = await axios.put(`${config.baseUrl}/api/guidelines/${masterId}`, {
            title: 'Updated Guidelines',
            description: 'Updated description',
            sections: [
                {
                    name: 'Updated Section',
                    description: 'Updated content',
                    weight: 2,
                    required: true,
                    order: 0
                }
            ]
        });
        console.log('✅ Guidelines update successful');

        // Test sample notes update
        console.log('\n=== Testing Sample Notes Update ===');
        const notesResponse = await axios.put(`${config.baseUrl}/api/guidelines/${masterId}/sample-notes`, {
            notes: ['Updated note 1', 'Updated note 2', 'New note 3']
        });
        console.log('✅ Sample notes update successful');

        // Test note evaluation
        console.log('\n=== Testing Note Evaluation ===');
        const evalResponse = await axios.post(`${config.baseUrl}/api/evaluate-note`, {
            note: 'Test note content',
            masterId
        });
        console.log('✅ Note evaluation successful');

        // Run UI tests
        await runUITests(masterId);

    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
            console.error('Response status:', error.response.status);
        }
    }
}

// Run all tests
runAPITests();
