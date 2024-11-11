import express from 'express';
import hotelRoutes from './routes/hotelRoutes';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON
app.use(express.json());

// Define the root route
app.get('/', (req, res) => {
  res.send('Welcome to the Hotel API');
});

// Register the hotel routes
app.use('/api', hotelRoutes);

export default app; 

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
