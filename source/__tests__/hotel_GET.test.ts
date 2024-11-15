import request from 'supertest';
import { app, server } from '../index';

// Utility function to format and log JSON responses
function logResponse(testName: string, response: any) {
  console.log('\n' + '='.repeat(80));
  console.log(`Test: ${testName}`);
  console.log('Status:', response.status);
  console.log('Response Body:', JSON.stringify(response.body, null, 2));
  console.log('='.repeat(80) + '\n');
}

const hotelID = 'ADF290'; // Replace with the hotel ID from your data

describe('GET /api/hotel/:hotelID', () => {
  afterAll((done) => {
    server.close(done);
  });

  it('should retrieve the hotel data for a valid hotel ID', async () => {
    const response = await request(app).get(`/api/hotel/${hotelID}`);

    // Log the response
    logResponse('Get Hotel by ID', {
      status: response.status,
      body: response.body
    });

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(response.body.data.hotel).toMatchObject({
      hotelID: hotelID,
      title: expect.any(String),
      description: expect.any(String),
      images: expect.arrayContaining([expect.any(String)]), // No base64Images now
      rooms: expect.arrayContaining([
        expect.objectContaining({
          roomTitle: expect.any(String),
          roomImage: expect.arrayContaining([expect.any(String)]) // No base64RoomImages now
        })
      ])
    });

    const hotel = response.body.data.hotel;
    expect(Array.isArray(hotel.images)).toBe(true);
    expect(Array.isArray(hotel.rooms)).toBe(true);

    hotel.rooms.forEach((room: any) => {
      expect(Array.isArray(room.roomImage)).toBe(true);
    });
  });

  it('should retrieve the hotel data for a valid hotel slug', async () => {
    const slug = 'sunshine-inn'; // Assuming the hotel slug is 'kbf301'
    const response = await request(app).get(`/api/hotel/${slug}`);

    // Log the response
    logResponse('Get Hotel by Slug', {
      status: response.status,
      body: response.body
    });

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(response.body.data.hotel).toMatchObject({
      slug: slug,
      title: expect.any(String),
      description: expect.any(String),
      images: expect.arrayContaining([expect.any(String)])
    });
  });

  it('should return 404 for a non-existent hotel ID', async () => {
    const response = await request(app).get('/api/hotel/nonexistentID');

    // Log the response
    logResponse('Get Non-existent Hotel', {
      status: response.status,
      body: response.body
    });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      message: 'Hotel not found'
    });
  });

  it('should fetch valid PNG hotel images', async () => {
    const response = await request(app).get(`/api/hotel/${hotelID}`);

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');

    // Check each hotel image
    response.body.data.hotel.images.forEach(async (imageUrl: string) => {
      const imageResponse = await request(app).get(imageUrl);
      await new Promise(resolve => setTimeout(resolve, 500)); // Wait 500ms
      expect(imageResponse.status).toBe(200);
      expect(imageResponse.headers['content-type']).toMatch(/^image\/png/);
    });
  });

  it('should fetch valid PNG room images', async () => {
    const response = await request(app).get(`/api/hotel/${hotelID}`);

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');

    // Check each room image
    response.body.data.hotel.rooms.forEach(async (room: any) => {
      room.roomImage.forEach(async (roomImageUrl: string) => { 
        const imageResponse = await request(app).get(roomImageUrl);
        expect(imageResponse.status).toBe(200);
        expect(imageResponse.headers['content-type']).toMatch(/^image\/png/);
      });
    });
  });

  // ... (rest of your tests) ...
});
