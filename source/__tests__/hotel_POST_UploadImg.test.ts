import request from 'supertest';
import express from 'express';
import path from 'path';
import fs from 'fs';
import { uploadImages } from '../controllers/hotelController';

const app = express();
app.use(express.json());

// Set up the route
app.post('/api/hotel/:hotelID/images', uploadImages);

describe('Hotel Image Path Upload Tests', () => {
  const testHotelId = 'KWF755';
  const testImageDir = path.join(__dirname, '../../', 'test-img');
  const testUploadsDir = path.join(__dirname, '..', 'uploads', 'images');

  // Setup before tests
  beforeAll(() => {
    // Ensure uploads directory exists
    if (!fs.existsSync(testUploadsDir)) {
      fs.mkdirSync(testUploadsDir, { recursive: true });
    }
  });

  // Cleanup after tests - only clean uploaded files, not source files
  afterAll(() => {
    // Clean only the uploaded test files
    const files = fs.readdirSync(testUploadsDir);
    files.forEach(file => {
      if (file.startsWith('PBS773_')) {
        fs.unlinkSync(path.join(testUploadsDir, file));
      }
    });
  });

  describe('POST /api/hotel/:hotelID/images', () => {
    test('should upload hotel images from paths successfully', async () => {
      const imagePaths = [
        path.join(testImageDir, 'image01.png'),
        path.join(testImageDir, 'image02.png')
      ];

      const response = await request(app)
        .post(`/api/hotel/${testHotelId}/images`)
        .query({ type: 'hotel' })
        .send({ imagePaths })
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.uploadedImages).toHaveLength(2);
      expect(response.body.data.hotel.images).toContain(response.body.data.uploadedImages[0]);
      expect(response.body.data.hotel.images).toContain(response.body.data.uploadedImages[1]);
    });

    test('should upload room images from paths successfully', async () => {
      const imagePaths = [
        path.join(testImageDir, 'image01.png')
      ];

      const response = await request(app)
        .post(`/api/hotel/${testHotelId}/images`)
        .query({ 
          type: 'room',
          roomSlug: 'deluxe-suite'
        })
        .send({ imagePaths })
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.uploadedImages).toHaveLength(1);
      
      const roomImages = response.body.data.hotel.rooms.find(
        (room: any) => room.roomSlug === 'deluxe-suite'
      ).roomImage;
      expect(roomImages).toContain(response.body.data.uploadedImages[0]);
    });

    test('should handle non-existent image paths', async () => {
      const imagePaths = [
        path.join(testImageDir, 'nonexistent.png')
      ];

      const response = await request(app)
        .post(`/api/hotel/${testHotelId}/images`)
        .query({ type: 'hotel' })
        .send({ imagePaths })
        .expect(500);

      expect(response.body.status).toBe('error');
      expect(response.body.error).toContain('Source image not found');
    });

    test('should handle missing image paths', async () => {
      const response = await request(app)
        .post(`/api/hotel/${testHotelId}/images`)
        .query({ type: 'hotel' })
        .send({})
        .expect(400);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('No image paths provided');
    });
  });
});