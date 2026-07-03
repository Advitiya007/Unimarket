import 'dotenv/config';
import express from 'express';
import http from 'http';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { Server } from 'socket.io';

import connectDB from './config/db.js';
import socketHandler from './socket/socketHandler.js';
import runExpiryEngine from './utils/expiryEngine.js';

import authRoutes from './routes/authRoutes.js';
import listingRoutes from './routes/listingRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import ratingRoutes from './routes/ratingRoutes.js';
import userRoutes from './routes/userRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
console.log(`__dirname: ${__dirname}`);
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL || '*', credentials: true },
});

app.use(cors({ origin: process.env.CLIENT_URL || '*', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Make io accessible in route handlers via req.io (used for live notifications)
app.use((req, res, next) => {
  req.io = io;
  next();
});

app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'UniMarket API' }));

app.use('/api/auth', authRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);

// 404 handler for unknown API routes
app.use('/api', (req, res) => res.status(404).json({ message: 'Route not found' }));

// Central error handler (e.g. multer file-size/type errors)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || 'Server error' });
});

socketHandler(io);

// Run the expiry engine every hour, plus once at boot
runExpiryEngine();
setInterval(runExpiryEngine, 60 * 60 * 1000);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`UniMarket API running on port ${PORT}`));
