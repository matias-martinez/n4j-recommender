require('dotenv').config();
const Neode = require('neode');
const Engine = require('./Engine.js');

// const web = require('./interface/web.js');
class Recommender {
    constructor() {
        this.db = new Neode.fromEnv().withDirectory('./schema');
        this.engine = new Engine(this.db);
        // instance methods.
        this.start = this.start.bind(this);
    }

    start() {
        // Start outside world interaction
        // web.start(engine);
    }
}

const recommender = new Recommender();
recommender.start();
