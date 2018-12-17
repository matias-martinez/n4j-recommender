require('dotenv').config();
const Neode = require('neode');
const Engine = require('./Engine.js');

// const web = require('./interface/web.js');
class Recommender {
    constructor(db) {
        this.db = db;
        this.engine = new Engine(this.db);
        // instance methods.
        this.start = this.start.bind(this);
    }

    start() {
        // Start outside world interaction
        // web.start(engine);
    }
}

/**
 * Start the component.
 */
const db = new Neode.fromEnv().withDirectory('./schema');
const recommender = new Recommender(db);
recommender.start();
