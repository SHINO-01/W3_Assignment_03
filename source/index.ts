import express from 'express';
import { createHotel, getHotel } from './controllers/hotelController';

const app = express();

// Increase payload size limit
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Hotel routes
app.post('/api/hotel', createHotel);
app.get('/api/hotel/:hotelID', getHotel);
app.get('/api/hotel/slug/:slug', getHotel);  // Use different route for slug if desired

const server = app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});

export { app, server };
