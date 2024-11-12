import request from 'supertest';
import fs from 'fs';
import path from 'path';
import { app, server } from '../index';  // Import both app and server

// Ensure the uploads/images directory exists for testing purposes
const testImageDir = path.join(__dirname, '../test-img');
if (!fs.existsSync(testImageDir)) {
  fs.mkdirSync(testImageDir);
}

// Helper function to create a test image file
const createTestImage = (imageName: string): string => {
  const imagePath = path.join(testImageDir, imageName);
  const sampleImage = Buffer.from('sample image data');  // Simulating image data (use an actual image in production)
  fs.writeFileSync(imagePath, sampleImage);
  return imagePath;
};

test('POST /api/hotel - Create a new hotel with images', async () => {
  // Create test images
  const hotelImagePath = createTestImage('image01.png');
  const roomImagePath = createTestImage('image03.png');

  // Define hotel data with image paths
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
    hotelImages: [hotelImagePath],  // Pass the path of the hotel image
    rooms: [
      {
        roomTitle: 'Deluxe Suite',
        bedroomCount: 1,
        bathroomCount: 1,
        roomImage: [roomImagePath]  // Pass the path of the room image
      }
    ]
  };

  const response = await request(app)
    .post('/api/hotel')
    .send(hotelData)
    .set('Content-Type', 'application/json');

  // Log the response for debugging
  console.log('Response body:', response.body);

  // Validate response
  expect(response.status).toBe(201);
  expect(response.body).toHaveProperty('hotelID');
  expect(response.body).toHaveProperty('title', hotelData.title);
  expect(response.body.images.length).toBe(1);  // Verify hotel image was saved
  expect(response.body.rooms[0].roomImage.length).toBe(1);  // Verify room image was saved
  expect(response.body.rooms[0].roomTitle).toBe('Deluxe Suite');
  expect(response.body.rooms[0].bedroomCount).toBe(1);

  // Clean up: Remove the test image files after the test
  fs.unlinkSync(hotelImagePath);
  fs.unlinkSync(roomImagePath);
});

// Close the server after all tests have run
afterAll(() => {
  server.close();  // Close the server after tests are done
});
