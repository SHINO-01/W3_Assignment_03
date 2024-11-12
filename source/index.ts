import express from 'express';
import { createHotel } from './controllers/hotelController';

const app = express();

// Increase payload size limit
app.use(express.json({ limit: '10mb' })); // Adjust the limit as needed
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.post('/api/hotel', createHotel);

const server = app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});

export { app, server };
