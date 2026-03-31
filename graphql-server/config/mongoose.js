// graphql-server/config/mongoose.js
import mongoose from 'mongoose';
import config from './config.js';

// Explicit model imports (intentional side-effect, now documented)
import '../models/user.server.model.js';
import '../models/team.server.model.js';
import '../models/project.server.model.js';

mongoose.set('strictQuery', true);
// connect to MongoDB
const connectToDatabase = async () => {
  try {
    await mongoose.connect(config.database.mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log('✅ MongoDB connected');

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('🛑 MongoDB connection closed');
      process.exit(0);
    });
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

export default connectToDatabase;
