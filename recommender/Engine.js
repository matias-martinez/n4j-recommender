class Engine {
    constructor(db) {
        this.db = db;
        this.findSimilarUsers = this.findSimilarUsers.bind(this);
        this.recommend = this.recommend.bind(this);
    }

    /**
     * Create a list of recommendations for a given user.
     * @param user
     * @returns {Array}
     */
    async recommend(product) {
        // Do a recommendation.
        const recommendations = await this.db.cypher(
            `MATCH (m:Product {id: {product}})-[:CONFORMS]->(g:Standard)<-[:CONFORMS]-(other:Product)
            WITH m, other, COUNT(g) AS intersection, COLLECT(g.name) AS i
            MATCH (m)-[:CONFORMS]->(mg:Standard)
            WITH m, other, intersection,i, COLLECT(mg.name) AS s1
            MATCH (other)-[:CONFORMS]->(og:Standard)
            WITH m,other,intersection,i, s1, COLLECT(og.name) AS s2         
            WITH m,other,intersection,s1,s2
            WITH m,other,intersection,s1+filter(x IN s2 WHERE NOT x IN s1) AS union, s1, s2
            RETURN m.name, other.description, s1,s2,((1.0*intersection)/SIZE(union)) AS jaccard 
            ORDER BY jaccard DESC LIMIT 100`,
            {product},
        );
        return recommendations.records;
    }

    /**
     * Create a list of similar users.
     * @param user
     * @returns {Array}
     */
    async findSimilarUsers(user) {
        // Do a recommendation.
        const similarUsers = await this.db.cypher(
            'MATCH (u1:User {id: {user}})-[x:VIEWED]->(p:Product)<-[y:VIEWED]-(u2:User)'
            + ' WITH COUNT(p) AS productsAmount, SUM(x.times * y.times) AS xyDotProduct,'
            + ' SQRT(REDUCE(xDot = 0.0, a IN COLLECT(x.times) | xDot + a^2)) AS xLength,'
            + ' SQRT(REDUCE(yDot = 0.0, b IN COLLECT(y.times) | yDot + b^2)) AS yLength,'
            + ' u1, u2 WHERE productsAmount > 1'
            + ' RETURN u1.name, u2.name, xyDotProduct / (xLength * yLength) AS sim'
            + ' ORDER BY sim DESC LIMIT 100;',
            {user},
        );
        return similarUsers.records;
    }
}

module.exports = Engine;
