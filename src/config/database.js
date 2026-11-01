import mongoose from 'mongoose';
import { config } from './index.js';

export const connectDatabase = async () => {
  await mongoose.connect(config.mongoUri, { serverSelectionTimeoutMS: 10000 });
  console.log('Conexión a MongoDB establecida');
};
