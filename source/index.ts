import express from 'express';
import hotelRoutes from './routes/hotelRoutes';

const app = express();

app.use(express.json());
app.use('/api', hotelRoutes);

// Create the server instance
const server = app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});

// Named export for both app and server
export { app, server };
