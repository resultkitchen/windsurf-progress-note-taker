const request = require('supertest');
const app = require('../server');
const db = require('../db');

describe('Route Tests', () => {
    describe('GET /', () => {
        it('should return 200 and render index page', async () => {
            const response = await request(app).get('/');
            expect(response.status).toBe(200);
        });
    });

    describe('GET /guidelines', () => {
        it('should return 200 and render guidelines page', async () => {
            const response = await request(app).get('/guidelines');
            expect(response.status).toBe(200);
        });
    });

    describe('POST /api/guidelines', () => {
        it('should save guidelines and return success', async () => {
            const response = await request(app)
                .post('/api/guidelines')
                .send({ content: 'Test guideline' });
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });
    });
});
