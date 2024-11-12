import request from 'supertest';
import fs from 'fs';
import path from 'path';
import { app, server } from '../index';

const testImageDir = path.join(__dirname, '../test-img');

// Helper function to read an existing test image as base64
const getTestImageAsBase64 = (imageName: string): string => {
  const testImagePath = path.join(testImageDir, imageName);

  // Check if the file exists
  if (!fs.existsSync(testImagePath)) {
    throw new Error(`Test image ${imageName} not found at ${testImagePath}`);
  }

  // Read the file and encode it to base64
  const imageData = fs.readFileSync(testImagePath);
  return `data:image/png;base64,${imageData.toString('base64')}`;
};

test('POST /api/hotel - Create a new hotel with real image data', async () => {
  // Fetch images from the directory
  const hotelImage = getTestImageAsBase64('image02.png');
  const roomImage = getTestImageAsBase64('image05.png');

  const hotelData = {
    title: 'Sunshine Inn',
    description: 'A cozy hotel by the beach.',
    guestCount: 4,
    bedroomCount: 2,
    bathroomCount: 1,
    amenities: ['WiFi', 'Pool', 'Air Conditioning'],
    host: 'John Doe',
    address: '123 Beach Ave, Miami, FL',
    latitude: 25.7617,
    longitude: -80.1918,
    hotelImages: [hotelImage], // Send image as base64
    rooms: [
      {
        roomTitle: 'Deluxe Suite',
        bedroomCount: 1,
        bathroomCount: 1,
        roomImage: [roomImage], // Send image as base64
      },
    ],
  };

  const response = await request(app)
    .post('/api/hotel')
    .send(hotelData)
    .set('Content-Type', 'application/json');

  // Validate response
  expect(response.status).toBe(201);
  expect(response.body).toHaveProperty('hotelID');
  expect(response.body).toHaveProperty('title', hotelData.title);
  expect(response.body.images.length).toBe(1); // Verify hotel image was saved
  expect(response.body.rooms[0].roomImage.length).toBe(1); // Verify room image was saved
  expect(response.body.rooms[0].roomTitle).toBe('Deluxe Suite');
  expect(response.body.rooms[0].bedroomCount).toBe(1);
});

// Close the server after all tests have run
afterAll(() => {
  server.close();
});
