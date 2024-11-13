import request from 'supertest';
import fs from 'fs';
import path from 'path';
import { app, server } from '../index';

const testImageDir = path.join(__dirname, '../../test-img');

describe('Image Upload Tests', () => {
  // First, let's create a hotel and get its ID
  let hotelId: string;

  beforeAll(async () => {
    // Create a test hotel first
    const hotelData = {
      title: 'Test Hotel',
      description: 'Test Description',
      guestCount: 4,
      bedroomCount: 2,
      bathroomCount: 1,
      amenities: ['WiFi'],
      host: 'Test Host',
      address: 'Test Address',
      latitude: 0,
      longitude: 0
    };

    const createResponse = await request(app)
      .post('/api/hotel')
      .send(hotelData);

    hotelId = createResponse.body.hotelID;
  });

  test('POST /api/hotel/:hotelID/images - Upload multiple images', async () => {
    const testImage1Path = path.join(testImageDir, 'image02.png');
    const testImage2Path = path.join(testImageDir, 'image05.png');

    // Verify test images exist
    expect(fs.existsSync(testImage1Path)).toBe(true);
    expect(fs.existsSync(testImage2Path)).toBe(true);

    const response = await request(app)
      .post(`/api/hotel/${hotelId}/images`)
      .attach('images', testImage1Path)
      .attach('images', testImage2Path);

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(response.body.message).toBe('Images uploaded successfully');
    expect(response.body.data.images).toHaveLength(2);
    expect(response.body.data.images[0]).toMatch(/^\/uploads\/images\/.+\.png$/);
    expect(response.body.data.images[1]).toMatch(/^\/uploads\/images\/.+\.png$/);
  });

  test('POST /api/hotel/:hotelID/images - Handle non-existent hotel', async () => {
    const testImage1Path = path.join(testImageDir, 'image02.png');
    
    const response = await request(app)
      .post('/api/hotel/non-existent-hotel/images')
      .attach('images', testImage1Path);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Hotel not found');
  });

  test('POST /api/hotel/:hotelID/images - Handle no files uploaded', async () => {
    const response = await request(app)
      .post(`/api/hotel/${hotelId}/images`)
      .send();

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('No files uploaded');
  });

  test('POST /api/hotel/:hotelID/images - Handle invalid file type', async () => {
    // Create a temporary text file
    const invalidFilePath = path.join(testImageDir, 'test.txt');
    fs.writeFileSync(invalidFilePath, 'This is not an image');

    const response = await request(app)
      .post(`/api/hotel/${hotelId}/images`)
      .attach('images', invalidFilePath);

    // Clean up temporary file
    fs.unlinkSync(invalidFilePath);

    expect(response.status).toBe(400);
    expect(response.body.error).toContain('Only image files are allowed');
  });

  // Cleanup after all tests
  afterAll(async () => {
    // Delete the test hotel if needed
    // Add cleanup code here if necessary
    server.close();
  });
});