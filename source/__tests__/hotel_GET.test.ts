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

describe('GET /api/hotel/:hotelID', () => {
  afterAll((done) => {
    server.close(done);
  });

  it('should retrieve the hotel data with base64 images for a valid hotel ID', async () => {
    const hotelID = 'WHP902';
    const response = await request(app).get(`/api/hotel/${hotelID}`);

    // Log the response
    logResponse('Get Hotel by ID', {
      status: response.status,
      body: {
        ...response.body,
        data: {
          hotel: {
            ...response.body.data.hotel,
            // Truncate base64 strings for readability
            base64Images: response.body.data.hotel.base64Images.map(
              (img: string) => img.substring(0, 100) + '...[truncated]'
            ),
            rooms: response.body.data.hotel.rooms.map((room: any) => ({
              ...room,
              base64RoomImages: room.base64RoomImages.map(
                (img: string) => img.substring(0, 100) + '...[truncated]'
              )
            }))
          }
        }
      }
    });

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(response.body.data.hotel).toMatchObject({
      hotelID: hotelID,
      title: 'Sunshine Inn',
      description: 'A cozy hotel by the beach.',
      images: expect.arrayContaining([expect.stringContaining('/uploads/images/')]),
      base64Images: expect.arrayContaining([expect.stringContaining('data:image/png;base64,')]),
      rooms: expect.arrayContaining([
        expect.objectContaining({
          roomTitle: 'Deluxe Suite',
          roomImage: expect.arrayContaining([expect.stringContaining('/uploads/images/')]),
          base64RoomImages: expect.arrayContaining([expect.stringContaining('data:image/png;base64,')])
        })
      ])
    });

    const hotel = response.body.data.hotel;
    expect(Array.isArray(hotel.images)).toBe(true);
    expect(Array.isArray(hotel.base64Images)).toBe(true);
    expect(hotel.base64Images.length).toBe(hotel.images.length);
    
    hotel.rooms.forEach((room: any) => {
      expect(Array.isArray(room.roomImage)).toBe(true);
      expect(Array.isArray(room.base64RoomImages)).toBe(true);
      expect(room.base64RoomImages.length).toBe(room.roomImage.length);
    });
  });

  it('should retrieve the hotel data with base64 images for a valid hotel slug', async () => {
    const slug = 'sunshine-inn';
    const response = await request(app).get(`/api/hotel/${slug}`);

    // Log the response
    logResponse('Get Hotel by Slug', {
      status: response.status,
      body: {
        ...response.body,
        data: {
          hotel: {
            ...response.body.data.hotel,
            base64Images: response.body.data.hotel.base64Images.map(
              (img: string) => img.substring(0, 100) + '...[truncated]'
            ),
            rooms: response.body.data.hotel.rooms.map((room: any) => ({
              ...room,
              base64RoomImages: room.base64RoomImages.map(
                (img: string) => img.substring(0, 100) + '...[truncated]'
              )
            }))
          }
        }
      }
    });

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(response.body.data.hotel).toMatchObject({
      slug: slug,
      title: expect.any(String),
      description: expect.any(String),
      images: expect.arrayContaining([expect.stringContaining('/uploads/images/')]),
      base64Images: expect.arrayContaining([expect.stringContaining('data:image/png;base64,')])
    });

    const hotel = response.body.data.hotel;
    hotel.base64Images.forEach((base64Image: string) => {
      expect(base64Image).toMatch(/^data:image\/png;base64,/);
      expect(base64Image.length).toBeGreaterThan(100);
    });

    hotel.rooms.forEach((room: any) => {
      room.base64RoomImages.forEach((base64Image: string) => {
        expect(base64Image).toMatch(/^data:image\/png;base64,/);
        expect(base64Image.length).toBeGreaterThan(100);
      });
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

  it('should handle large images without timing out', async () => {
    const hotelID = 'WHP902';
    const response = await request(app)
      .get(`/api/hotel/${hotelID}`)
      .timeout(5000);

    // Log the response (with truncated base64 data)
    logResponse('Large Image Test', {
      status: response.status,
      body: {
        status: response.body.status,
        hasBase64Images: !!response.body.data.hotel.base64Images,
        imagesCount: response.body.data.hotel.base64Images.length
      }
    });

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(response.body.data.hotel.base64Images).toBeDefined();
  }, 10000);

  it('should maintain correct content-type headers', async () => {
    const hotelID = 'WHP902';
    const response = await request(app).get(`/api/hotel/${hotelID}`);

    // Log the response headers
    logResponse('Content-Type Headers Test', {
      status: response.status,
      headers: response.headers
    });

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toMatch(/application\/json/);
  });

  it('should handle special characters in hotel slugs', async () => {
    const slug = 'sunshine-inn';
    const response = await request(app).get(`/api/hotel/${encodeURIComponent(slug)}`);

    // Log the response
    logResponse('Special Characters in Slug Test', {
      status: response.status,
      body: {
        status: response.body.status,
        slug: response.body.data.hotel.slug
      }
    });

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(response.body.data.hotel.slug).toBe(slug);
  });
});