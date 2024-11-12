import request from 'supertest';
import app from '../index';

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

  console.log('Response body:', response.body); // Log the response for debugging
  
  expect(response.status).toBe(201);
  expect(response.body).toHaveProperty('hotelID');
  expect(response.body).toHaveProperty('title', hotelData.title);
});


