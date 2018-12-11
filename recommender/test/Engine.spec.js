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

    it('should get an user', async () => {
        const user = await engine.getUser(1);
        expect(user.get('id')).toBe(1);
    });
});
