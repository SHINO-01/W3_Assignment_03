import request from 'supertest';
import path from 'path';
import { app, server } from '../index';

const testImageDir = path.join(__dirname, '../../test-img');

const getTestImagePath = (imageName: string): string => {
  return path.join(testImageDir, imageName);
};

test('POST /api/hotel - Create a new hotel with image file paths', async () => {
  // Fetch image paths from the directory
  const hotelImagePath = getTestImagePath('image02.png');
  const roomImagePath = getTestImagePath('image05.png');

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
    hotelImages: [hotelImagePath], // Send image paths
    rooms:[ 
      {
        roomTitle: 'Deluxe Suite',
        bedroomCount: 1,
        bathroomCount: 1,
        roomImage: [roomImagePath], // Send image paths
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

