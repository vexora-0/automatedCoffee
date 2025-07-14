import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import connectDB from './config/db';
import { errorHandler, notFound } from './middleware/errorHandler';
import http from 'http';
import { Server } from 'socket.io';
import dbChangeService from './services/dbChangeService';
import mongoose from 'mongoose';
import websocketService, { WebSocketEvents } from './services/websocketService';

// Import routes
import userRoutes from './routes/userRoutes';
import machineRoutes from './routes/machineRoutes';
import ingredientRoutes from './routes/ingredientRoutes';
import recipeRoutes from './routes/recipeRoutes';
import orderRoutes from './routes/orderRoutes';
import warningRoutes from './routes/warningRoutes';
import authRoutes from './routes/authRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import staffRoutes from './routes/staffRoutes';

// Import models for websocket updates
import Recipe from './models/Recipe';
import Machine from './models/Machine';
import MachineIngredientInventory from './models/MachineIngredientInventory';

// Initialize environment variables
dotenv.config();

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

// Track active connections for health monitoring
const activeConnections = new Map();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/machines', machineRoutes);
app.use('/api/ingredients', ingredientRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/warnings', warningRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/staff', staffRoutes);

// Health check route
app.get('/api/health-check', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Expose connection metrics endpoint for monitoring
app.get('/api/socket-metrics', (req, res) => {
  res.json({
    activeConnections: activeConnections.size,
    connectionDetails: Array.from(activeConnections.entries()).map(([id, data]) => ({
      id,
      connectedSince: data.connectedAt,
      lastActivity: data.lastActivity,
      idleTime: Date.now() - data.lastActivity
    }))
  });
});

// Error handling
app.use(notFound);
app.use(errorHandler);

// WebSocket event handlers
io.on('connection', (socket) => {
  console.log('A client connected:', socket.id);
  
  // Track connection for health monitoring
  activeConnections.set(socket.id, {
    connectedAt: Date.now(),
    lastActivity: Date.now(),
    clientInfo: socket.handshake.headers['user-agent']
  });
  
  // Update last activity on any event
  socket.onAny(() => {
    if (activeConnections.has(socket.id)) {
      const conn = activeConnections.get(socket.id);
      conn.lastActivity = Date.now();
      activeConnections.set(socket.id, conn);
    }
  });

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

  // Handle request-data event to send data on demand
  socket.on('request-data', async (data) => {
    try {
      console.log(`Client ${socket.id} requested data:`, data);
      
      if (data && data.machine_id) {
        const machineId = data.machine_id;
        
        // Send recipes
        const recipes = await Recipe.find({}).lean();
        socket.emit(WebSocketEvents.RECIPE_UPDATE, recipes);
        
        // Send recipe ingredients for availability calculation
        const RecipeIngredient = require('./models/RecipeIngredient').default;
        const recipeIngredients = await RecipeIngredient.find({}).lean();
        socket.emit('recipe-ingredients-update', recipeIngredients);
        
        // Send machine status
        const machine = await Machine.findOne({ machine_id: machineId }).lean();
        if (machine) {
          socket.emit(WebSocketEvents.MACHINE_STATUS_UPDATE, {
            machine_id: machineId,
            status: machine.status,
            location: machine.location
          });
          
          // Send machine temperature
          socket.emit(WebSocketEvents.MACHINE_TEMPERATURE_UPDATE, {
            machine_id: machineId,
            temperature_c: machine.temperature_c
          });
        }
        
        // Send machine inventory
        const inventory = await MachineIngredientInventory.find({ machine_id: machineId }).lean();
        socket.emit(WebSocketEvents.MACHINE_INVENTORY_UPDATE, {
          machine_id: machineId,
          inventory: inventory
        });
        
        console.log(`Sent requested data to client ${socket.id} for machine ${machineId}`);
      }
    } catch (error) {
      console.error('Error handling request-data event:', error);
      socket.emit('error', { message: 'Failed to fetch requested data' });
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    activeConnections.delete(socket.id);
  });
});

// Start server
server.listen(PORT, async () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  
  // Connect to database first and wait for it to be ready
  await connectDB();
  
  // Initialize DB change streams after server starts and MongoDB is connected
  try {
    // Give MongoDB connection a moment to fully initialize
    setTimeout(async () => {
      // Check if MongoDB deployment supports change streams
      const isReplicaSet = await checkReplicaSetStatus();
      
      if (isReplicaSet) {
        await dbChangeService.initChangeStreams();
        console.log('Using MongoDB change streams for real-time updates');
      } else {
        console.log('MongoDB not running as a replica set - using polling for updates');
        // Initialize polling fallback
        startPollingFallback();
      }
    }, 2000); // Wait 2 seconds for connection to fully establish
  } catch (error) {
    console.error('Failed to initialize real-time updates:', error);
  }
});

/**
 * Check if the MongoDB deployment supports change streams
 */
async function checkReplicaSetStatus() {
  try {
    // Get connection URI that was actually used
    const mongoUri = (mongoose as any).mongoUri || process.env.MONGODB_URI;
    
    // If we're using MongoDB Atlas, change streams are always supported
    if (mongoUri && mongoUri.includes('mongodb+srv')) {
      return true;
    }
    
    // Try to get replica set status or ismaster info
    const db = mongoose.connection.db;
    if (!db) {
      console.error('Database connection not found');
      return false;
    }
    
    // For non-Atlas connections, check replica set status
    try {
      const admin = db.admin();
      const info = await admin.command({ isMaster: 1 });
      return !!info.setName || !!info.isreplicaset;
    } catch (adminError) {
      console.error('Error checking replica set status via admin command:', adminError);
      return false;
    }
  } catch (error) {
    console.error('Error in checkReplicaSetStatus:', error);
    return false;
  }
}

/**
 * Fallback to polling for updates if change streams aren't available
 */
function startPollingFallback() {
  // Poll for machine updates
  setInterval(async () => {
    try {
      const machines = await Machine.find({}).lean();
      machines.forEach(machine => {
        websocketService.emitMachineStatusUpdate(machine);
        websocketService.emitMachineTemperatureUpdate(machine);
      });
    } catch (error) {
      console.error('Error polling machine updates:', error);
    }
  }, 5000); // Poll every 5 seconds
  
  // Poll for recipe updates
  setInterval(async () => {
    try {
      const recipes = await Recipe.find({}).lean();
      websocketService.emitRecipeUpdate(recipes);
    } catch (error) {
      console.error('Error polling recipe updates:', error);
    }
  }, 30000); // Poll every 30 seconds
  
  // Poll for inventory updates
  setInterval(async () => {
    try {
      // Group inventory items by machine for efficiency
      const inventories = await MachineIngredientInventory.find({}).lean();
      const byMachine: Record<string, any[]> = {};
      
      inventories.forEach(item => {
        if (!byMachine[item.machine_id]) {
          byMachine[item.machine_id] = [];
        }
        byMachine[item.machine_id].push(item);
      });
      
      // Emit updates for each machine
      Object.entries(byMachine).forEach(([machineId, inventory]) => {
        websocketService.emitMachineInventoryUpdate(machineId, inventory);
      });
    } catch (error) {
      console.error('Error polling inventory updates:', error);
    }
  }, 10000); // Poll every 10 seconds
}

// Export socket.io instance for use in other files
export { io };

export default app; 