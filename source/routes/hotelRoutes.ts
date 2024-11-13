import express, { Router } from 'express';
import { createHotel, uploadImages, getHotel, updateHotel } from '../controllers/hotelController';
import { upload } from '../middlewares/uploadImg';

const router: Router = express.Router();

router.post('/hotel', createHotel);
router.post('/hotel/:hotelID/images', upload.array('images'), uploadImages);
router.get('/hotel/:hotelID', getHotel); // GET hotel by hotelID or slug
router.put('/hotel/:hotelID', updateHotel);

export default router;
