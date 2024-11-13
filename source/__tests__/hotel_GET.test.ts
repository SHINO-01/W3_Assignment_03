import request from 'supertest';
import { app, server } from '../index'; // Ensure `app` and `server` are exported from index.ts

describe('GET /api/hotel/:hotelID', () => {
  afterAll(() => {
    server.close();
  });

  it('should retrieve the hotel data for a valid hotel ID', async () => {
    const hotelID = 'WHP902'; // Replace with an actual hotel ID that exists in your data directory
    const response = await request(app).get(`/api/hotel/${hotelID}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('hotelID', hotelID);
    expect(response.body).toHaveProperty('title');
    expect(response.body).toHaveProperty('description');
    expect(response.body).toHaveProperty('images');
    expect(Array.isArray(response.body.images)).toBe(true);
  });

  it('should retrieve the hotel data for a valid hotel slug', async () => {
    const slug = 'sunshine-inn'; // Replace with an actual slug for an existing hotel
    const response = await request(app).get(`/api/hotel/${slug}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('slug', slug);
    expect(response.body).toHaveProperty('title');
    expect(response.body).toHaveProperty('description');
    expect(response.body).toHaveProperty('images');
    expect(Array.isArray(response.body.images)).toBe(true);
  });

  it('should return 404 for a non-existent hotel ID', async () => {
    const response = await request(app).get('/api/hotel/nonexistentID');

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('message', 'Hotel not found');
  });
});
