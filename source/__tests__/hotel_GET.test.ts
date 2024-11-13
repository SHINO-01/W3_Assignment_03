import request from 'supertest';
import { app } from '../index'; // Ensure this path points to your app instance

describe('GET /hotel/:hotelID', () => {
  it('should return the hotel data when the hotel exists', async () => {
    const hotelID = 'SVE349'; // Ensure this ID exists in your test data

    const response = await request(app).get(`/hotel/${hotelID}`);
    console.log('Response:', response.body); // Debug log

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('hotelID', hotelID);
    expect(response.body).toHaveProperty('slug', 'sunshine-inn');
    expect(response.body).toHaveProperty('images');
    expect(response.body.images[0]).toMatch(/^http:\/\/localhost:3000\/uploads\/images\//);
    expect(response.body).toHaveProperty('title', 'Sunshine Inn');
    expect(response.body).toHaveProperty('description', 'A cozy hotel by the beach.');
    expect(response.body).toHaveProperty('rooms');
    expect(response.body.rooms[0]).toHaveProperty('roomTitle', 'Deluxe Suite');
    expect(response.body.rooms[0].roomImage[0]).toMatch(/^http:\/\/localhost:3000\/uploads\/images\//);
  });

  it('should return 404 if the hotel does not exist', async () => {
    const hotelID = 'NON_EXISTENT_ID';

    const response = await request(app).get(`/hotel/${hotelID}`);
    console.log('Response:', response.body); // Debug log

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Hotel not found');
  });

  it('should handle unexpected errors gracefully', async () => {
    const response = await request(app).get('/hotel/INVALID-HOTEL-ID');
    console.log('Response:', response.body); // Debug log

    expect(response.status).toBe(500);
    expect(response.body.message).toBe('Internal Server Error');
  });
});
