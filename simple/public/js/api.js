/**
 * API client for QuickNotes
 */
class API {
    constructor() {
        this.baseUrl = 'http://localhost:3002/api';
    }

    async checkGuidelinesStatus() {
        const response = await fetch(`${this.baseUrl}/guidelines/status`);
        if (!response.ok) {
            throw new Error('Failed to check guidelines status');
        }
        return response.json();
    }

    async getGuidelines() {
        const response = await fetch(`${this.baseUrl}/guidelines`);
        if (!response.ok) {
            throw new Error('Failed to fetch guidelines');
        }
        return response.json();
    }

    async saveGuidelines(content, sampleNotes) {
        const response = await fetch(`${this.baseUrl}/guidelines`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ content, sampleNotes })
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to save guidelines');
        }
        return response.json();
    }

    async submitNote(content) {
        const response = await fetch(`${this.baseUrl}/notes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ content })
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to submit note');
        }
        return response.json();
    }

    async getRecentNotes() {
        const response = await fetch(`${this.baseUrl}/notes/recent`);
        if (!response.ok) {
            throw new Error('Failed to fetch recent notes');
        }
        return response.json();
    }

    async getStats() {
        const response = await fetch(`${this.baseUrl}/stats`);
        if (!response.ok) {
            throw new Error('Failed to fetch stats');
        }
        return response.json();
    }

    async getNote(noteId) {
        const response = await fetch(`${this.baseUrl}/notes/${noteId}`);
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to fetch note');
        }
        return response.json();
    }

    getShareUrl(noteId) {
        const baseUrl = window.location.origin;
        return `${baseUrl}/share/${noteId}`;
    }
}
