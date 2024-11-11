import express from 'express';
import { createHotel, uploadImages, getHotel, updateHotel } from '../controllers/hotelController';
import { upload } from '../middlewares/uploadImg';

const router = express.Router();

router.post('/hotel', createHotel);
router.post('/images', upload.array('images'), uploadImages);
router.get('/hotel/:hotelID', getHotel);
router.put('/hotel/:hotelID', updateHotel);

export default router;
