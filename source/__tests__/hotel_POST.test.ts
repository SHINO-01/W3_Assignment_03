import request from 'supertest';
import { app, server } from '../index';  // Import both app and server

test('POST /api/hotel - Create a new hotel', async () => {
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
    rooms: [
      {
        title: 'Deluxe Suite',
        bedroomCount: 1,
        bathroomCount: 1
      }
    ]
  };

  const response = await request(app)
    .post('/api/hotel')
    .send(hotelData)
    .set('Content-Type', 'application/json');  // Ensure correct content type

  expect(response.status).toBe(201);
  expect(response.body).toHaveProperty('hotelID');
  expect(response.body).toHaveProperty('title', hotelData.title);
});

// Close the server after all tests have run
afterAll(() => {
  server.close();  // Close the server after tests are done
});
