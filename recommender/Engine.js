class Engine {
    constructor(db) {
        this.db = db;
        this.getUser = this.getUser.bind(this);
    }

    /**
     * Create a list of recommendations for a given user.
     * @param user
     * @returns {Array}
     */
    recommend() {
        // Do a recommendation.
        return [];
    }

    async getUser(id) {
        const user = await this.db.first('User', 'id', id);
        return user;
    }
}

module.exports = Engine;
