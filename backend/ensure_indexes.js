import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Complaint } from './src/models/complaint.model.js';

dotenv.config({ path: './.env' });

async function ensureIndexes() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    await Complaint.createIndexes();
    const indexes = await Complaint.collection.indexes();
    console.log('Complaint collection indexes:', JSON.stringify(indexes, null, 2));

    process.exit(0);
  } catch (err) {
    console.error('Failed to build indexes:', err);
    process.exit(1);
  }
}

ensureIndexes();