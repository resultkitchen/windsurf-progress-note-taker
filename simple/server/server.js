const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');

const app = express();
const port = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Data storage
const DB_FILE = path.join(__dirname, 'db.json');
let db = {
    guidelines: null, // Only one active guideline at a time
    notes: []
};

// Load database
async function loadDb() {
    try {
        const data = await fs.readFile(DB_FILE, 'utf8');
        db = JSON.parse(data);
        // Ensure guidelines is null if not set
        if (!db.guidelines) {
            db.guidelines = null;
        }
    } catch (error) {
        // If file doesn't exist, we'll create it on first save
        if (error.code !== 'ENOENT') {
            console.error('Error loading database:', error);
        }
    }
}

// Save database
async function saveDb() {
    try {
        await fs.writeFile(DB_FILE, JSON.stringify(db, null, 2));
    } catch (error) {
        console.error('Error saving database:', error);
    }
}

// Helper function to evaluate notes
function evaluateNote(guidelines, sampleNotes, noteContent) {
    // In a real app, this would use NLP to compare against guidelines and samples
    const score = Math.floor(Math.random() * 30) + 70;
    
    // Generate feedback in the format specified by master prompt
    let feedback = '<feedback>\n';
    feedback += `<score>${score}</score>\n`;
    
    // Add strengths section
    feedback += '<strengths>\n<ul>\n';
    if (noteContent.toLowerCase().includes('wind')) {
        feedback += '<li>Good inclusion of wind conditions</li>\n';
    }
    if (noteContent.toLowerCase().includes('progress')) {
        feedback += '<li>Clear progress indicators</li>\n';
    }
    feedback += '</ul>\n</strengths>\n';
    
    // Add improvements section if score < 80
    if (score < 80) {
        feedback += '<improvements>\n<ul>\n';
        if (!noteContent.toLowerCase().includes('conditions')) {
            feedback += '<li>Include more details about conditions</li>\n';
        }
        if (!noteContent.toLowerCase().includes('practice')) {
            feedback += '<li>Describe what you specifically practiced</li>\n';
        }
        feedback += '</ul>\n</improvements>\n';
    }
    feedback += '</feedback>';
    
    // Generate improved note
    let improvedNote = '';
    if (score < 80) {
        improvedNote = `<div class="improved-note">
<h4>Conditions:</h4>
${extractConditions(noteContent) || '<p>[Add detailed conditions here]</p>'}

<h4>Practice Focus:</h4>
${extractPractice(noteContent) || '<p>[Describe specific techniques practiced]</p>'}

<h4>Progress:</h4>
${extractProgress(noteContent) || '<p>[Note specific improvements or challenges]</p>'}
</div>`;
    } else {
        improvedNote = noteContent; // Note is already good
    }
    
    return { score, feedback, improvedNote };
}

// Helper functions for note parsing
function extractConditions(content) {
    const conditionsMatch = content.match(/<p>.*?(wind|conditions):.*?</i);
    return conditionsMatch ? conditionsMatch[0] : null;
}

function extractPractice(content) {
    const practiceMatch = content.match(/<p>.*?practic.*?</i);
    return practiceMatch ? practiceMatch[0] : null;
}

function extractProgress(content) {
    const progressMatch = content.match(/<p>.*?(progress|improve|better).*?</i);
    return progressMatch ? progressMatch[0] : null;
}

// Routes
app.get('/api/guidelines/status', async (req, res) => {
    await loadDb();
    res.json({ hasGuidelines: !!db.guidelines });
});

app.get('/api/guidelines', async (req, res) => {
    await loadDb();
    res.json(db.guidelines);
});

app.post('/api/guidelines', async (req, res) => {
    await loadDb();
    const { content, sampleNotes } = req.body;
    
    if (!content) {
        return res.status(400).json({ error: 'Guidelines content is required' });
    }
    
    db.guidelines = {
        id: uuidv4(),
        content,
        sample_notes: sampleNotes || [],
        created_at: new Date().toISOString()
    };
    
    await saveDb();
    res.json(db.guidelines);
});

app.post('/api/notes', async (req, res) => {
    await loadDb();
    const { content } = req.body;
    
    if (!db.guidelines) {
        return res.status(400).json({ error: 'No guidelines have been set' });
    }
    
    if (!content) {
        return res.status(400).json({ error: 'Note content is required' });
    }
    
    const evaluation = evaluateNote(db.guidelines.content, db.guidelines.sample_notes, content);
    const note = {
        id: uuidv4(),
        content,
        ...evaluation,
        created_at: new Date().toISOString()
    };
    
    db.notes.push(note);
    await saveDb();
    res.json(note);
});

app.get('/api/notes/recent', async (req, res) => {
    await loadDb();
    // Return most recent 10 notes
    const recentNotes = [...db.notes]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 10);
    res.json(recentNotes);
});

app.get('/api/stats', async (req, res) => {
    await loadDb();
    
    if (db.notes.length === 0) {
        return res.json({
            count: 0,
            average_score: 0,
            improvement: 0
        });
    }
    
    const count = db.notes.length;
    const average_score = Math.round(
        db.notes.reduce((sum, note) => sum + note.score, 0) / count
    );
    
    // Calculate improvement (difference between first and last 3 notes)
    const sortedNotes = [...db.notes].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    let improvement = 0;
    
    if (count >= 6) {
        const firstThree = sortedNotes.slice(0, 3);
        const lastThree = sortedNotes.slice(-3);
        const firstAvg = firstThree.reduce((sum, note) => sum + note.score, 0) / 3;
        const lastAvg = lastThree.reduce((sum, note) => sum + note.score, 0) / 3;
        improvement = Math.round(lastAvg - firstAvg);
    }
    
    res.json({ count, average_score, improvement });
});

// Share functionality
app.get('/share/:noteId', async (req, res) => {
    await loadDb();
    const note = db.notes.find(n => n.id === req.params.noteId);
    if (!note) {
        res.status(404).sendFile(path.join(__dirname, '../public/404.html'));
    } else {
        res.sendFile(path.join(__dirname, '../public/index.html'));
    }
});

app.get('/api/notes/:noteId', async (req, res) => {
    await loadDb();
    const note = db.notes.find(n => n.id === req.params.noteId);
    if (!note) {
        res.status(404).json({ error: 'Note not found' });
    } else {
        res.json(note);
    }
});

// Serve index.html for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Start server
loadDb().then(() => {
    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
});
