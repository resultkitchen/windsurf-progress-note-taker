const express = require('express');
const router = express.Router();
const db = require('../db');

// Home page
router.get('/', async (req, res) => {
    res.render('index', { 
        title: 'QuickNotes - Home',
        error: null,
        showProgress: false
    });
});

// Guidelines page
router.get('/guidelines', async (req, res) => {
    try {
        const guideline = await db.getLatestGuidelines();
        res.render('guidelines', {
            title: 'QuickNotes - Guidelines Setup',
            guideline: guideline || null,
            error: null,
            showProgress: true
        });
    } catch (error) {
        console.error('Error loading guidelines page:', error);
        res.render('guidelines', {
            title: 'QuickNotes - Guidelines Setup',
            guideline: null,
            error: 'Failed to load guidelines',
            showProgress: true
        });
    }
});

// Dashboard page - requires guidelines to be set up
router.get('/dashboard', async (req, res) => {
    try {
        const guideline = await db.getLatestGuidelines();
        if (!guideline || !guideline.content) {
            return res.redirect(302, '/guidelines');
        }
        res.render('dashboard', {
            title: 'QuickNotes - Dashboard',
            guideline,
            error: null,
            showProgress: false
        });
    } catch (error) {
        console.error('Error loading dashboard:', error);
        res.redirect(302, '/guidelines');
    }
});

module.exports = router;
