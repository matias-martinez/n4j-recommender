const neode = require('neode');
const {
    products, users, standards, events, conformity,
} = require('./data.json');

// Global constants.
const MAX_RETRIES = 10;

// Global variables.
let globalProductId = 0;
let retries = 0;
let neo4j = null;

/**
 * Exec Cypher inside a session.
 * @param elements
 * @param runner
 * @returns {Promise<void>}
 */
const runInSession = async (elements, runner) => {
    const session = neo4j.driver.session();
    await Promise.all(elements.map(element => runner(session, element)));
    session.close();
    return Promise.resolve();
};

const createProduct = async (session, {market, industry, description}) => {
    globalProductId += 1;
    return session.run('CREATE (p: Product ) '
        + 'SET p.market = {market}, '
        + '    p.industry = {industry}, '
        + '    p.description = {description}, '
        + '    p.id = toInteger({productId})', {
        market,
        industry,
        description,
        productId: globalProductId,
    });
};

const createUser = (session, {id, name}) => session.run('CREATE (u: User ) '
    + 'SET u.id = toInteger({id}), '
    + '    u.name = {name}', {id, name});

const createUserProductRelationships = (session, event) => {
    const {payload: {userId, productId}, type} = event;
    return session.run(`${'MATCH (u:User), (p:Product)'
        + '   WHERE u.id = toInteger({userId}) and p.id = toInteger({productId})'
        + '   MERGE (u)-[r:'}${type}]->(p)`
        + '   ON CREATE SET r.times = 1'
        + '   ON MATCH SET r.times = r.times +1'
        + '   RETURN r;', {userId, productId});
};

const createStandard = (session, {id, name}) => session.run('CREATE (s: Standard ) '
    + 'SET s.id = toInteger({id}), '
    + '    s.name = {name}', {id, name});

const createProductStandardRelationships = (session, conformity) => {
    const {payload: {productId, standardId}, type} = conformity;
    return session.run(`${'MATCH (p:Product), (s: Standard)'
        + '   WHERE p.id = toInteger({productId}) and s.id = toInteger({standardId})'
        + '   MERGE (p)-[r:'}${type}]->(s)`
        + '   RETURN r;', {productId, standardId});
};

const ingestor = () => {
    console.log('Running INGESTOR');
    runInSession(users, createUser)
        .then(() => runInSession(products, createProduct))
        .then(() => runInSession(standards, createStandard))
        .then(() => runInSession(events, createUserProductRelationships))
        .then(() => runInSession(conformity, createProductStandardRelationships));
};

// Wait for Neo4J and run.

const waitForConnection = async () => {
    try {
        retries++;
        console.log('Trying to connect...');
        neo4j = neode.fromEnv();
        await neo4j.driver.session().run('MATCH (a) RETURN a;');
        ingestor();
    } catch (e) {
        console.log(`Connection not available: ${retries}`);
        if (retries < MAX_RETRIES) {
            setTimeout(waitForConnection, 5000);
        }
    }
};

waitForConnection();
