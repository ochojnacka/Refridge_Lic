import 'express-async-errors';
import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { initializeDatabase } from './database';
import authRoutes from './routes/auth';
import inventoryRoutes from './routes/inventory';
import recipesRoutes from './routes/recipes';
import wasteRoutes from './routes/waste';
import salesRoutes from './routes/sales';
import analyticsRoutes from './routes/analytics';

const app: Express = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || '*',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use('/auth', authRoutes);
app.use('/inventory', inventoryRoutes);
app.use('/recipes', recipesRoutes);
app.use('/waste', wasteRoutes);
app.use('/sales', salesRoutes);
app.use('/analytics', analyticsRoutes);

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Not Found' });
});

// Initialize HTTP + WebSocket server
const server = createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || '*',
    credentials: true,
  },
});

// WebSocket events
io.on('connection', (socket) => {
  console.log('📱 Client connected:', socket.id);

  socket.on('join-restaurant', (restaurantId: string) => {
    socket.join(`restaurant-${restaurantId}`);
    console.log(`✅ Socket joined restaurant-${restaurantId}`);
  });

  socket.on('disconnect', () => {
    console.log('📱 Client disconnected:', socket.id);
  });
});

// Export io for use in routes
export { io };

// Start server
const startServer = async () => {
  try {
    // Initialize database
    await initializeDatabase();

    server.listen(port, () => {
      console.log(`🚀 Server running on http://localhost:${port}`);
      console.log(`📊 Health check: http://localhost:${port}/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
