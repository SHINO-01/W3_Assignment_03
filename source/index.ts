import express from 'express';
import hotelRoutes from './routes/hotelRoutes';
import path from 'path';

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files (e.g., images) from the "uploads/images" directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads/images')));

// Use hotel-related routes
app.use('/api', hotelRoutes);

// Create the server instance
const server = app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});

// Named export for both app and server
export { app, server };
