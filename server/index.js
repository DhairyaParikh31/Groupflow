import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

import { authRouter } from './routes/auth.js';
import memberRouter from './routes/members.js';
import { eventRouter } from './routes/events.js';
import { sharedInfoRouter } from './routes/sharedInfo.js';
import { leaderRouter } from './routes/leaders.js';
import { customFieldRouter } from './routes/customFields.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? false : true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use('/uploads', express.static(join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/members', memberRouter);
app.use('/api/events', eventRouter);
app.use('/api/shared-info', sharedInfoRouter);
app.use('/api/leaders', leaderRouter);
app.use('/api/custom-fields', customFieldRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});