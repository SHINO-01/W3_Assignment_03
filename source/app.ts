import express from 'express';
import hotelRoutes from './routes/hotelRoutes';

const app = express();
app.use(express.json());
app.use('/api', hotelRoutes);

export default app;
