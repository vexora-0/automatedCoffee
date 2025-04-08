import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import connectDB from './config/db';
import { errorHandler, notFound } from './middleware/errorHandler';
import http from 'http';
import { Server } from 'socket.io';

// Import routes
import userRoutes from './routes/userRoutes';
import machineRoutes from './routes/machineRoutes';
import ingredientRoutes from './routes/ingredientRoutes';
import recipeRoutes from './routes/recipeRoutes';
import orderRoutes from './routes/orderRoutes';
import warningRoutes from './routes/warningRoutes';

// Import models for websocket updates
import Recipe from './models/Recipe';
import Machine from './models/Machine';
import MachineIngredientInventory from './models/MachineIngredientInventory';

// Initialize environment variables
dotenv.config();

// Connect to database
connectDB();

// Create express app
const app = express();
const PORT = process.env.PORT || 5000;

// Create HTTP server and WebSocket server
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/machines', machineRoutes);
app.use('/api/ingredients', ingredientRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/warnings', warningRoutes);

// Health check route
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Error handling
app.use(notFound);
app.use(errorHandler);

// WebSocket event handlers
io.on('connection', (socket) => {
  console.log('A client connected:', socket.id);

  // Join machine-specific room when requested
  socket.on('join-machine', (machineId) => {
    socket.join(`machine-${machineId}`);
    console.log(`Client ${socket.id} joined machine-${machineId} room`);
  });

  // Leave machine-specific room
  socket.on('leave-machine', (machineId) => {
    socket.leave(`machine-${machineId}`);
    console.log(`Client ${socket.id} left machine-${machineId} room`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Export socket.io instance for use in other files
export { io };

export default app; 