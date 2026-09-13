const { MongoClient } = require('mongodb');

let clientPromise;

const getDatabase = async () => {
  // Accept both the normal value and the accidental `MONGODB_URI=` prefix
  // sometimes pasted into the value in a local .env file.
  const uri = (process.env.MONGODB_URI || '').replace(/^MONGODB_URI=/i, '').trim();
  if (!uri) {
    throw new Error('MONGODB_URI is not configured');
  }

  if (!clientPromise) {
    const client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    clientPromise = client.connect().catch((error) => {
      clientPromise = null;
      throw error;
    });
  }

  const client = await clientPromise;
  const databaseName = process.env.MONGODB_DB_NAME || 'nivo_ai';
  return client.db(databaseName);
};

const sessionsCollection = async () => {
  const database = await getDatabase();
  return database.collection('chat_sessions');
};

const usersCollection = async () => {
  const database = await getDatabase();
  const collection = database.collection('users');
  await collection.createIndex({ email: 1 }, { unique: true });
  return collection;
};

const findUserByEmail = async (email) => {
  const collection = await usersCollection();
  return collection.findOne({ email });
};

const createUser = async (user) => {
  const collection = await usersCollection();
  const result = await collection.insertOne(user);
  return { ...user, _id: result.insertedId };
};

const getSessions = async (clientId) => {
  const collection = await sessionsCollection();
  const document = await collection.findOne({ clientId }, { projection: { _id: 0, sessions: 1 } });
  return document?.sessions || [];
};

const saveSessions = async (clientId, sessions) => {
  const collection = await sessionsCollection();
  await collection.replaceOne(
    { clientId },
    { clientId, sessions, updatedAt: new Date() },
    { upsert: true },
  );
};

const deleteSessions = async (clientId) => {
  const collection = await sessionsCollection();
  await collection.deleteOne({ clientId });
};

module.exports = { getSessions, saveSessions, deleteSessions, findUserByEmail, createUser };
