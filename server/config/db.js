const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Already connected (e.g. dev-seed-server seeded the DB in this same process)
    if (mongoose.connection.readyState === 1) {
      console.log('MongoDB already connected:', mongoose.connection.host);
      return mongoose.connection;
    }

    let uri = process.env.MONGODB_URI;

    // Optional in-memory MongoDB for local development without a DB server
    if (process.env.USE_MEMORY_DB === 'true') {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      uri = mongod.getUri('scholarship_db');
      console.log('Using in-memory MongoDB instance');
    }

    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
