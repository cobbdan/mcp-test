const request = require('supertest');
const app = require('../server');
const { generateLoremIpsum } = require('../loremIpsumTool');

describe('Lorem Ipsum Generator Tool', () => {
    // Test the generateLoremIpsum function
    describe('generateLoremIpsum function', () => {
        test('should generate paragraphs', () => {
            const text = generateLoremIpsum('paragraphs', 2);
            expect(text).toBeTruthy();
            expect(text.split('\n').length).toBe(2);
        });

        test('should generate sentences', () => {
            const text = generateLoremIpsum('sentences', 3);
            expect(text).toBeTruthy();
            const sentences = text.split('. ').filter(s => s.trim());
            expect(sentences.length).toBeGreaterThanOrEqual(2);
        });

        test('should generate words', () => {
            const text = generateLoremIpsum('words', 10);
            expect(text).toBeTruthy();
            expect(text.split(' ').length).toBe(10);
        });
    });

    // Test the API endpoints
    describe('API endpoints', () => {
        test('should list lorem-ipsum tool in /tools', async () => {
            const response = await request(app).get('/tools');
            expect(response.status).toBe(200);
            const loremTool = response.body.find(tool => tool.name === 'lorem-ipsum');
            expect(loremTool).toBeTruthy();
            expect(loremTool.description).toContain('Lorem Ipsum');
        });

        test('should generate lorem ipsum text via API', async () => {
            const response = await request(app)
                .post('/execute/lorem-ipsum')
                .send({ units: 'paragraphs', count: 1, tts: false });
            
            expect(response.status).toBe(200);
            expect(response.body.result.text).toBeTruthy();
        });

        test('should handle invalid units parameter', async () => {
            const response = await request(app)
                .post('/execute/lorem-ipsum')
                .send({ units: 'invalid', count: 1 });
            
            expect(response.status).toBe(400);
        });

        test('should handle invalid count parameter', async () => {
            const response = await request(app)
                .post('/execute/lorem-ipsum')
                .send({ units: 'paragraphs', count: 101 });
            
            expect(response.status).toBe(400);
        });
    });
});