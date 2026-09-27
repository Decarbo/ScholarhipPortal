// Dev helper: boots an in-memory MongoDB, seeds it, then starts the API server
// in the SAME process so both share the memory database.
process.env.USE_MEMORY_DB = 'true';
const { MongoMemoryServer } = require('mongodb-memory-server');

(async () => {
  const mongod = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongod.getUri('scholarship_db');
  console.log('In-memory MongoDB URI:', process.env.MONGODB_URI);

  // Seed first (connectDB is idempotent via mongoose default connection),
  // then start the API in the SAME process so both share the memory database.
  const seedDatabase = require('./seed.js');
  await seedDatabase();

  require('./server.js');
  console.log('API server started on port', process.env.PORT || 5000);
})().catch((e) => { console.error(e); process.exit(1); });
