/**
 * IndexedDB wrapper for QuickNotes
 */
class NotesDB {
    constructor() {
        this.dbName = 'quicknotes_db';
        this.dbVersion = 1;
        this.db = null;
        this.initPromise = this.init();
    }

    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Guidelines store
                if (!db.objectStoreNames.contains('guidelines')) {
                    db.createObjectStore('guidelines', { keyPath: 'id', autoIncrement: true });
                }

                // Notes store
                if (!db.objectStoreNames.contains('notes')) {
                    const notesStore = db.createObjectStore('notes', { keyPath: 'id', autoIncrement: true });
                    notesStore.createIndex('timestamp', 'timestamp');
                }
            };
        });
    }

    async ready() {
        return this.initPromise;
    }

    async saveGuidelines(content) {
        await this.ready();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['guidelines'], 'readwrite');
            const store = transaction.objectStore('guidelines');
            
            // Clear existing guidelines
            store.clear().onsuccess = () => {
                // Add new guidelines
                const request = store.add({
                    content,
                    timestamp: new Date().toISOString()
                });

                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            };
        });
    }

    async getGuidelines() {
        await this.ready();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['guidelines'], 'readonly');
            const store = transaction.objectStore('guidelines');
            const request = store.getAll();

            request.onsuccess = () => {
                const guidelines = request.result;
                resolve(guidelines.length > 0 ? guidelines[guidelines.length - 1] : null);
            };
            request.onerror = () => reject(request.error);
        });
    }

    async saveNote(content, score = null) {
        await this.ready();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['notes'], 'readwrite');
            const store = transaction.objectStore('notes');
            
            const request = store.add({
                content,
                score,
                timestamp: new Date().toISOString()
            });

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getNotes(limit = 10) {
        await this.ready();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['notes'], 'readonly');
            const store = transaction.objectStore('notes');
            const index = store.index('timestamp');
            const request = index.openCursor(null, 'prev');
            
            const notes = [];
            
            request.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor && notes.length < limit) {
                    notes.push(cursor.value);
                    cursor.continue();
                } else {
                    resolve(notes);
                }
            };
            request.onerror = () => reject(request.error);
        });
    }

    async getStats() {
        await this.ready();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['notes'], 'readonly');
            const store = transaction.objectStore('notes');
            const request = store.getAll();

            request.onsuccess = () => {
                const notes = request.result;
                const stats = {
                    count: notes.length,
                    averageScore: 0,
                    improvement: 0
                };

                if (notes.length > 0) {
                    // Calculate average score
                    const scores = notes.map(n => n.score).filter(s => s !== null);
                    if (scores.length > 0) {
                        stats.averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;
                    }

                    // Calculate improvement (comparing last 5 vs previous 5)
                    if (scores.length >= 10) {
                        const recent = scores.slice(-5);
                        const previous = scores.slice(-10, -5);
                        const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
                        const previousAvg = previous.reduce((a, b) => a + b, 0) / previous.length;
                        stats.improvement = ((recentAvg - previousAvg) / previousAvg) * 100;
                    }
                }

                resolve(stats);
            };
            request.onerror = () => reject(request.error);
        });
    }
}

// Create global instance
window.db = new NotesDB();
