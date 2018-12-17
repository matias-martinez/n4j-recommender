require('dotenv').config();
const path = require('path');
const db = require('neode').fromEnv().withDirectory(path.resolve('./schema'));
const Engine = require('../Engine.js');

// Create an instance.
const engine = new Engine(db);

describe('engine', () => {
    it('should export a recommend function', () => {
        expect(engine.recommend).toBeDefined();
    });
});

describe('engine.findSimilarUsers', () => {
    it('should return at least one recommendation', async () => {
        const similarUsers = await engine.findSimilarUsers(2);
        expect(similarUsers).toBeDefined();
        expect(similarUsers.length > 0).toBe(true);
    });
});

describe('engine.recommend', () => {
    it('should return at least one recommendation', async () => {
        const similarProducts = await engine.recommend(2);
        expect(similarProducts).toBeDefined();
        expect(similarProducts.length > 0).toBe(true);
    });
});
