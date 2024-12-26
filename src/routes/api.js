const express = require('express');
const router = express.Router();
const db = require('../db');
const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');
const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

// POST /api/guidelines
router.post('/api/guidelines', async (req, res) => {
    try {
        const { content } = req.body;
        
        if (!content || content.trim() === '') {
            return res.status(400).json({
                success: false,
                error: 'Guidelines content is required'
            });
        }

        const guidelineId = await db.saveGuidelines(content.trim());
        
        res.json({
            success: true,
            guidelineId
        });
    } catch (error) {
        console.error('Error saving guidelines:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to save guidelines'
        });
    }
});

// POST /api/sample-notes
router.post('/api/sample-notes', async (req, res) => {
    try {
        const { notes } = req.body;
        
        if (!Array.isArray(notes) || notes.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'At least one sample note is required'
            });
        }

        // Get the current guidelines id
        const guideline = await db.getLatestGuidelines();
        if (!guideline) {
            return res.status(400).json({
                success: false,
                error: 'Please create guidelines first'
            });
        }

        // Sanitize and save notes
        const sanitizedNotes = notes.map(note => DOMPurify.sanitize(note));
        await db.createSampleNotes(guideline.id, sanitizedNotes);

        res.json({
            success: true,
            message: 'Sample notes saved successfully'
        });
    } catch (error) {
        console.error('Error saving sample notes:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to save sample notes'
        });
    }
});

// POST /api/notes/evaluate
router.post('/api/notes/evaluate', async (req, res) => {
    try {
        const { content } = req.body;
        
        if (!content || content.trim().length < 10) {
            return res.status(400).json({
                success: false,
                error: 'Note must be at least 10 characters long'
            });
        }

        // Get current guidelines and sample notes
        const guideline = await db.getLatestGuidelines();
        if (!guideline) {
            return res.status(400).json({
                success: false,
                error: 'Guidelines not found'
            });
        }

        const samples = await db.getSampleNotes(guideline.id);
        if (!samples || samples.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Sample notes not found'
            });
        }

        // Format the evaluation prompt
        const prompt = `
You are an expert in evaluating progress notes based on provided guidelines and examples.

GUIDELINES:
${guideline.content}

EXCELLENT EXAMPLES:
${samples.map(s => s.content).join('\n\n')}

NOTE TO EVALUATE:
${content}

Please evaluate the note and provide:
1. Numerical score (0-100)
2. Specific feedback on strengths
3. Areas for improvement
4. Suggestions for enhancement if score is below 80

Format the response as HTML with <feedback> tags.`;

        // TODO: Call AI service for evaluation
        // For now, return mock response
        const mockResponse = {
            success: true,
            evaluation: `
<feedback>
<score>85</score>
<strengths>
  <ul>
    <li>Clear documentation of interventions</li>
    <li>Good description of client response</li>
    <li>Proper formatting and structure</li>
  </ul>
</strengths>
</feedback>`
        };

        res.json(mockResponse);
    } catch (error) {
        console.error('Error evaluating note:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to evaluate note'
        });
    }
});

module.exports = router;
