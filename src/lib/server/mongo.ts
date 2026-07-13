import { dev } from '$app/environment';
import dotenv from 'dotenv';
dotenv.config();
import { MongoClient, type Db } from 'mongodb';

const uri = process.env['DATABASE_URL'];

let cachedDb: Db | undefined;

if (!uri) {
	throw new Error('Please DATABASE_URL to your environment');
}

if (dev && !uri?.includes('Staging') && !uri?.includes('Test')) {
	console.info('🚨 You are using Production database in development mode 🚨');
}

if (dev && uri?.includes('Test')) {
	console.info('🚨 You are using Test database in development mode 🚨');
}

const connectToDatabase = async () => {
	if (cachedDb) return cachedDb;

	const client = await MongoClient.connect(uri);

	const currentDb = uri?.includes('Staging')
		? 'MyInfoStaging'
		: uri?.includes('Test')
			? 'MyInfoStagingTest'
			: 'MyInfo';

	const db = client.db(currentDb);
	cachedDb = db;
	return db;
};
const clientPromise = async () => await connectToDatabase();
// cachedDb = new MongoClient(uri, options);
// clientPromise = cachedDb.connect();

// Export a module-scoped MongoClient promise.
// By doing this in a separate module,
// the client can be shared across functions.
export default clientPromise;
