/**
 * QuickNotes Application Logic
 */

// Initialize API client
const api = new API();

// DOM Elements
const elements = {
    sections: {
        welcome: document.getElementById('welcome-section'),
        guidelines: document.getElementById('guidelines-section'),
        dashboard: document.getElementById('dashboard-section'),
        shared: document.getElementById('shared-section')
    },
    forms: {
        guidelines: document.getElementById('guidelines-form'),
        note: document.getElementById('note-form'),
        sharedNote: document.getElementById('shared-note-form')
    },
    buttons: {
        start: document.getElementById('start-btn'),
        addSample: document.getElementById('add-sample-btn'),
        share: document.getElementById('share-btn'),
        copyLink: document.getElementById('copy-link-btn'),
        editGuidelines: document.getElementById('edit-guidelines-btn')
    },
    containers: {
        share: document.getElementById('share-container'),
        sampleNotes: document.getElementById('sample-notes-container'),
        recentNotes: document.getElementById('recent-notes'),
        currentGuidelines: document.getElementById('current-guidelines'),
        sampleNotesDisplay: document.getElementById('sample-notes-display'),
        evaluationResults: document.getElementById('evaluation-results'),
        sharedGuidelines: document.getElementById('shared-guidelines'),
        sharedSamples: document.getElementById('shared-samples'),
        sharedNoteDisplay: document.getElementById('shared-note-display')
    },
    stats: {
        averageScore: document.getElementById('average-score'),
        notesCount: document.getElementById('notes-count'),
        improvement: document.getElementById('improvement')
    },
    editors: {
        guidelines: document.getElementById('guidelines-editor'),
        note: document.getElementById('note-editor'),
        sharedNote: document.getElementById('shared-note-editor')
    }
};

// Pell Editor instances
const editors = {
    guidelines: null,
    note: null,
    sharedNote: null,
    sampleNotes: []
};

// Show/hide sections
function showSection(sectionName) {
    console.log('Showing section:', sectionName);
    Object.entries(elements.sections).forEach(([name, section]) => {
        if (name === sectionName) {
            section.classList.remove('d-none');
        } else {
            section.classList.add('d-none');
        }
    });
}

// Initialize Pell editor
function initializeEditor(element) {
    if (!element) return null;
    
    console.log('Initializing editor for element:', element.id);
    
    // Create a basic textarea if Pell is not available
    if (typeof pell === 'undefined') {
        console.log('Pell not found, using basic textarea');
        const textarea = document.createElement('textarea');
        textarea.className = 'form-control';
        textarea.style.minHeight = '200px';
        element.appendChild(textarea);
        return {
            content: {
                innerHTML: ''
            }
        };
    }
    
    const editor = pell.init({
        element,
        onChange: html => {
            // Store content in the editor's content div
            const content = element.querySelector('.pell-content');
            if (content) {
                content.innerHTML = html;
            }
        },
        defaultParagraphSeparator: 'p',
        actions: [
            'bold',
            'italic',
            'underline',
            'strikethrough',
            'heading1',
            'heading2',
            'paragraph',
            'quote',
            'olist',
            'ulist',
            'line'
        ],
    });
    
    // Fix text direction
    const content = element.querySelector('.pell-content');
    if (content) {
        content.style.direction = 'ltr';
        content.style.textAlign = 'left';
    }
    
    return editor;
}

// Initialize all editors
function initializeEditors() {
    console.log('Initializing editors');
    
    // Initialize guidelines editor
    const guidelinesEditor = document.getElementById('guidelines-editor');
    if (guidelinesEditor) {
        editors.guidelines = initializeEditor(guidelinesEditor);
    }
    
    // Initialize first sample note editor
    const sampleNoteEditor = document.querySelector('.sample-note-editor');
    if (sampleNoteEditor) {
        editors.sampleNotes = [initializeEditor(sampleNoteEditor)];
    }
}

// Add a new sample note editor
function addSampleNoteEditor() {
    const container = document.getElementById('sample-notes-container');
    const noteCount = container.children.length + 1;
    
    const noteDiv = document.createElement('div');
    noteDiv.className = 'sample-note mt-4';
    noteDiv.innerHTML = `
        <h3>Sample Note #${noteCount}</h3>
        <div class="sample-note-editor"></div>
        <div class="quality-rating mt-3">
            <label class="form-label">Quality Rating:</label>
            <div class="btn-group" role="group">
                <input type="radio" class="btn-check" name="quality${noteCount}" id="excellent${noteCount}" autocomplete="off">
                <label class="btn btn-outline-success" for="excellent${noteCount}">Excellent</label>

                <input type="radio" class="btn-check" name="quality${noteCount}" id="good${noteCount}" autocomplete="off">
                <label class="btn btn-outline-primary" for="good${noteCount}">Good</label>

                <input type="radio" class="btn-check" name="quality${noteCount}" id="needs-work${noteCount}" autocomplete="off">
                <label class="btn btn-outline-warning" for="needs-work${noteCount}">Needs Work</label>
            </div>
        </div>
    `;
    
    container.appendChild(noteDiv);
    
    // Initialize editor for the new note
    const editor = initializeEditor(noteDiv.querySelector('.sample-note-editor'));
    editors.sampleNotes.push(editor);
}

// Handle guidelines form submission
async function handleGuidelinesSubmit(event) {
    event.preventDefault();
    
    try {
        // Show loading state
        event.submitter.disabled = true;
        event.submitter.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Saving...';
        
        // Get content from editors
        const guidelinesContent = editors.guidelines.content.innerHTML;
        const sampleNotes = editors.sampleNotes
            .map(editor => editor.content.innerHTML)
            .filter(content => content.trim() !== ''); // Filter out empty notes
        
        if (!guidelinesContent.trim()) {
            throw new Error('Guidelines content is required');
        }
        
        if (sampleNotes.length === 0) {
            throw new Error('At least one sample note is required');
        }
        
        // Save guidelines
        const guidelines = await api.saveGuidelines(guidelinesContent, sampleNotes);
        
        // Update UI with new guidelines
        elements.containers.currentGuidelines.innerHTML = guidelines.content;
        elements.containers.sampleNotesDisplay.innerHTML = guidelines.sample_notes
            .map(note => `<div class="note-card mb-3">${note}</div>`)
            .join('');
            
        elements.containers.share.classList.remove('d-none');
        
        // Show dashboard
        showSection('dashboard');
        
        // Update stats
        await updateStats();
        await updateRecentNotes();
        
    } catch (error) {
        console.error('Error saving guidelines:', error);
        alert(error.message || 'Failed to save guidelines. Please try again.');
    } finally {
        // Reset button state
        event.submitter.disabled = false;
        event.submitter.innerHTML = '<i class="fas fa-paper-plane me-2"></i>Save Guidelines';
    }
}

// Handle note submission
async function handleNoteSubmit(event) {
    event.preventDefault();
    
    // Update button state
    const button = event.submitter;
    button.disabled = true;
    button.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Evaluating...';
    
    try {
        const content = editors.note.content.innerHTML;
        const note = await api.submitNote(content);
        
        // Update display
        await updateStats();
        await updateRecentNotes();
        
        // Show share dialog
        const shareUrl = api.getShareUrl(note.id);
        const shareLink = document.getElementById('share-link');
        if (shareLink) {
            shareLink.value = shareUrl;
            const shareModal = new bootstrap.Modal(document.getElementById('share-modal'));
            shareModal.show();
        }
        
        // Clear editor
        editors.note.content.innerHTML = '';
        
    } catch (error) {
        console.error('Error submitting note:', error);
        alert(error.message || 'Failed to submit note. Please try again.');
    } finally {
        // Reset button state
        button.disabled = false;
        button.innerHTML = '<i class="fas fa-paper-plane me-2"></i>Submit';
    }
}

// Handle shared note submission
async function handleSharedNoteSubmit(event) {
    event.preventDefault();
    
    try {
        // Show loading state
        event.submitter.disabled = true;
        event.submitter.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Evaluating...';
        
        const noteContent = editors.sharedNote.content.innerHTML;
        
        if (!noteContent.trim()) {
            throw new Error('Note content is required');
        }
        
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('share');
        
        if (!token) {
            throw new Error('Invalid share link');
        }
        
        const evaluation = await api.evaluateSharedNote(token, noteContent);
        
        // Show evaluation results
        elements.containers.evaluationResults.classList.remove('d-none');
        elements.containers.evaluationResults.querySelector('#note-score').textContent = `Score: ${evaluation.score}%`;
        elements.containers.evaluationResults.querySelector('#note-feedback').textContent = evaluation.feedback;
        elements.containers.evaluationResults.querySelector('#improved-note').innerHTML = evaluation.improvedNote;
        
        // Clear editor
        editors.sharedNote.content.innerHTML = '';
        
    } catch (error) {
        console.error('Error evaluating note:', error);
        alert(error.message || 'Failed to evaluate note. Please try again.');
    } finally {
        // Reset button state
        event.submitter.disabled = false;
        event.submitter.innerHTML = '<i class="fas fa-paper-plane me-2"></i>Submit for Evaluation';
    }
}

// Update stats display
async function updateStats() {
    try {
        const stats = await api.getStats();
        
        // Only show stats if there are notes
        if (stats.count > 0) {
            elements.stats.averageScore.textContent = `${stats.average_score}%`;
            elements.stats.notesCount.textContent = stats.count;
            elements.stats.improvement.textContent = `${stats.improvement}%`;
        } else {
            elements.stats.averageScore.textContent = '--';
            elements.stats.notesCount.textContent = '0';
            elements.stats.improvement.textContent = '--';
        }
    } catch (error) {
        console.error('Error updating stats:', error);
    }
}

// Update recent notes display
async function updateRecentNotes() {
    try {
        const notes = await api.getRecentNotes();
        const container = elements.containers.recentNotes;
        container.innerHTML = '';
        
        if (notes.length === 0) {
            container.innerHTML = '<div class="text-muted">No notes yet. Write your first note above!</div>';
            return;
        }
        
        notes.forEach(note => {
            const noteElement = document.createElement('div');
            noteElement.className = 'note-card mb-3';
            noteElement.innerHTML = `
                <div class="note-content">${note.content}</div>
                <div class="note-meta">
                    <span class="badge bg-primary">Score: ${note.score}%</span>
                    <small class="text-muted">${new Date(note.created_at).toLocaleDateString()}</small>
                </div>
                ${note.feedback}
                ${note.improvedNote !== note.content ? `
                    <div class="improved-note-section mt-3">
                        <h5>Improved Version:</h5>
                        ${note.improvedNote}
                    </div>
                ` : ''}
            `;
            container.appendChild(noteElement);
        });
    } catch (error) {
        console.error('Error updating recent notes:', error);
    }
}

// Dashboard functionality
async function loadDashboard() {
    try {
        // Hide all sections and show dashboard
        document.querySelectorAll('.section').forEach(section => section.classList.add('d-none'));
        document.getElementById('dashboard-section').classList.remove('d-none');

        // Load guidelines
        const guidelines = await api.getGuidelines();
        if (guidelines) {
            document.getElementById('current-guidelines').innerHTML = guidelines.masterGuidelines || 'No guidelines set';
            
            // Display sample notes
            const sampleNotesContainer = document.getElementById('sample-notes-display');
            sampleNotesContainer.innerHTML = ''; // Clear existing content
            
            if (guidelines.sampleNotes && guidelines.sampleNotes.length > 0) {
                guidelines.sampleNotes.forEach(note => {
                    const noteElement = document.createElement('div');
                    noteElement.className = 'sample-note mb-3 p-3 border rounded';
                    noteElement.innerHTML = `
                        <div class="note-content">${note.content}</div>
                        <div class="note-quality mt-2">
                            <small class="text-muted">Quality Rating: ${note.quality}/5</small>
                        </div>
                    `;
                    sampleNotesContainer.appendChild(noteElement);
                });
            } else {
                sampleNotesContainer.innerHTML = '<p class="text-muted">No sample notes available</p>';
            }
        }

        // Load recent notes
        const notes = await api.getNotes();
        displayRecentNotes(notes);
        updateStats(notes);
    } catch (error) {
        console.error('Error loading dashboard:', error);
        showError('Failed to load dashboard content');
    }
}

function displayRecentNotes(notes) {
    const recentNotesContainer = document.getElementById('recent-notes');
    recentNotesContainer.innerHTML = ''; // Clear existing notes

    if (notes && notes.length > 0) {
        notes.slice(0, 5).forEach(note => {
            const noteElement = document.createElement('div');
            noteElement.className = 'note-card mb-3 p-3 border rounded';
            noteElement.innerHTML = `
                <div class="note-content">${note.content}</div>
                <div class="note-meta mt-2">
                    <small class="text-muted">Date: ${new Date(note.timestamp).toLocaleDateString()}</small>
                </div>
            `;
            recentNotesContainer.appendChild(noteElement);
        });
    } else {
        recentNotesContainer.innerHTML = '<p class="text-muted">No notes available</p>';
    }
}

function updateStats(notes) {
    if (!notes || notes.length === 0) {
        document.getElementById('average-score').textContent = '0%';
        document.getElementById('notes-count').textContent = '0';
        document.getElementById('improvement').textContent = '0%';
        return;
    }

    // Calculate average score
    const totalScore = notes.reduce((sum, note) => sum + (note.score || 0), 0);
    const averageScore = (totalScore / notes.length).toFixed(1);
    document.getElementById('average-score').textContent = `${averageScore}%`;

    // Update notes count
    document.getElementById('notes-count').textContent = notes.length;

    // Calculate improvement (comparing last 5 notes with previous 5)
    if (notes.length >= 10) {
        const recentScores = notes.slice(0, 5).map(note => note.score || 0);
        const previousScores = notes.slice(5, 10).map(note => note.score || 0);
        
        const recentAvg = recentScores.reduce((a, b) => a + b) / 5;
        const previousAvg = previousScores.reduce((a, b) => a + b) / 5;
        
        const improvement = ((recentAvg - previousAvg) / previousAvg * 100).toFixed(1);
        document.getElementById('improvement').textContent = `${improvement}%`;
    } else {
        document.getElementById('improvement').textContent = 'N/A';
    }
}

// Setup event listeners
function setupEventListeners() {
    console.log('Setting up event listeners');
    // Start button
    elements.buttons.start?.addEventListener('click', () => {
        console.log('Start button clicked');
        showSection('guidelines');
    });
    
    // Save guidelines button
    const saveGuidelinesBtn = document.getElementById('save-guidelines');
    if (saveGuidelinesBtn) {
        saveGuidelinesBtn.addEventListener('click', () => {
            // Show sample notes section
            const sampleNotesSection = document.getElementById('sample-notes-section');
            sampleNotesSection.classList.remove('d-none');
            
            // Disable guidelines editing
            saveGuidelinesBtn.disabled = true;
            const guidelinesEditor = document.getElementById('guidelines-editor');
            const pellContent = guidelinesEditor.querySelector('.pell-content');
            if (pellContent) {
                pellContent.contentEditable = false;
            }
            const pellActionbar = guidelinesEditor.querySelector('.pell-actionbar');
            if (pellActionbar) {
                pellActionbar.style.display = 'none';
            }
        });
    }
    
    // Add sample note button
    const addSampleBtn = document.getElementById('add-sample');
    if (addSampleBtn) {
        addSampleBtn.addEventListener('click', addSampleNoteEditor);
    }
    
    // Go to dashboard button
    const goDashboardBtn = document.getElementById('go-dashboard');
    if (goDashboardBtn) {
        goDashboardBtn.addEventListener('click', async () => {
            try {
                // Get guidelines content
                const guidelinesContent = editors.guidelines.content.innerHTML;
                
                // Get sample notes content and ratings
                const sampleNotes = [];
                document.querySelectorAll('.sample-note').forEach((noteDiv, index) => {
                    const content = editors.sampleNotes[index].content.innerHTML;
                    const rating = noteDiv.querySelector('input[type="radio"]:checked')?.id?.replace(/[0-9]/g, '') || null;
                    
                    if (content && rating) {
                        sampleNotes.push({
                            content,
                            rating
                        });
                    }
                });
                
                // Save guidelines and sample notes
                await api.saveGuidelines({
                    content: guidelinesContent,
                    sample_notes: sampleNotes.map(note => note.content)
                });
                
                // Update dashboard and show it
                const guidelines = await api.getGuidelines();
                if (guidelines) {
                    elements.containers.currentGuidelines.innerHTML = guidelines.content;
                    elements.containers.sampleNotesDisplay.innerHTML = guidelines.sample_notes
                        .map(note => `<div class="note-card mb-3">${note}</div>`)
                        .join('');
                    
                    await updateStats();
                    await updateRecentNotes();
                    
                    showSection('dashboard');
                } else {
                    console.error('No guidelines returned after saving');
                    alert('Failed to save guidelines. Please try again.');
                }
            } catch (error) {
                console.error('Error saving guidelines:', error);
                alert('Failed to save guidelines. Please try again.');
            }
        });
    }
    
    // Share functionality
    elements.buttons.share?.addEventListener('click', () => {
        const shareModal = new bootstrap.Modal(document.getElementById('share-modal'));
        shareModal.show();
    });
    
    elements.buttons.copyLink?.addEventListener('click', () => {
        const input = document.getElementById('share-link');
        input.select();
        document.execCommand('copy');
        alert('Link copied to clipboard!');
    });
    
    // Form submissions
    elements.forms.guidelines?.addEventListener('submit', handleGuidelinesSubmit);
    elements.forms.note?.addEventListener('submit', handleNoteSubmit);
    elements.forms.sharedNote?.addEventListener('submit', handleSharedNoteSubmit);
    
    // Edit guidelines button
    document.getElementById('edit-guidelines-btn').addEventListener('click', () => {
        document.querySelectorAll('.section').forEach(section => section.classList.add('d-none'));
        document.getElementById('guidelines-section').classList.remove('d-none');
    });
}

// Initialize app
async function initializeApp() {
    try {
        // Initialize editors
        initializeEditors();
        
        // Setup event listeners
        setupEventListeners();
        
        // Always show welcome screen first
        showSection('welcome');
        
        // Check if we're on a shared note page
        const pathParts = window.location.pathname.split('/');
        if (pathParts[1] === 'share' && pathParts[2]) {
            try {
                const noteId = pathParts[2];
                const note = await api.getNote(noteId);
                
                // Display the shared note
                const container = elements.containers.sharedNoteDisplay;
                container.innerHTML = `
                    <div class="note-card">
                        <div class="note-content">${note.content}</div>
                        <div class="note-meta">
                            <span class="badge bg-primary">Score: ${note.score}%</span>
                            <small class="text-muted">${new Date(note.created_at).toLocaleDateString()}</small>
                        </div>
                        ${note.feedback}
                        ${note.improvedNote !== note.content ? `
                            <div class="improved-note-section mt-3">
                                <h5>Improved Version:</h5>
                                ${note.improvedNote}
                            </div>
                        ` : ''}
                    </div>
                `;
                showSection('shared');
                return;
            } catch (error) {
                console.error('Error loading shared note:', error);
                return;
            }
        }
        
        // Load dashboard
        await loadDashboard();
    } catch (error) {
        console.error('Error initializing app:', error);
    }
}

// Start the app when DOM is ready
document.addEventListener('DOMContentLoaded', initializeApp);
