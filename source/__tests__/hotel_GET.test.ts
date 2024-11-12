import request from 'supertest';
import {app, server} from '../index';  // Import your Express app

describe('Hotel API', () => {
  it('GET /api/hotels - Get all hotels', async () => {
    const response = await request(app).get('/api/hotels');
    console.log('Response body:', response.body);  // For debugging

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);  // Ensure the response is an array
  });
});
