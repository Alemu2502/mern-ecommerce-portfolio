import cron from 'node-cron';
import User from '../models/user.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('DB Connected'))
.catch(err => console.log('DB Connection Error:', err));

export const removeUnverifiedUsers = async () => {
  const expirationPeriod = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  const expirationDate = new Date(Date.now() - expirationPeriod);

  try {
    const result = await User.deleteMany({
      isVerified: false,
      createdAt: { $lt: expirationDate }
    });

    console.log(`Removed ${result.deletedCount} unverified users`);
  } catch (err) {
    console.error('Error removing unverified users:', err);
  }
};

// Schedule the task to run every day at midnight
cron.schedule('0 0 * * *', () => {
  console.log('Running daily task to remove unverified users');
  removeUnverifiedUsers();
});
