import request from 'supertest';
import {app, server} from '../../source/index';
import { Hotel } from '../../source/models/hotelModel'; 

describe('Hotel API - PUT /api/hotel/:hotelID', () => {
  const existingHotelID = 'KWF755'; 

  let existingHotelData: Hotel;

  beforeAll(async () => {
    const res = await request(app).get(`/api/hotel/${existingHotelID}`);
    expect(res.status).toBe(200);
    existingHotelData = res.body.data.hotel;
  });

  it('should update hotel information successfully', async () => {
    const updatedTitle = 'Updated Sunshine Inn';
    const updatedDescription = 'A beautiful hotel with stunning views.';

    const updatedHotel: Hotel = {
      ...existingHotelData,
      title: updatedTitle,
      description: updatedDescription,
    };

    const res = await request(app)
      .put(`/api/hotel/${existingHotelID}`)
      .send(updatedHotel);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.message).toBe('Hotel updated successfully');
    expect(res.body.data.hotel.title).toBe(updatedTitle);
    expect(res.body.data.hotel.description).toBe(updatedDescription);
  });

  it('should update hotel information partially', async () => {
    const updatedDescription = 'A newly renovated hotel with modern amenities.';

    const updatedHotel: Hotel = {
      ...existingHotelData, 
      description: updatedDescription,
    };

    const res = await request(app)
      .put(`/api/hotel/${existingHotelID}`)
      .send(updatedHotel);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.message).toBe('Hotel updated successfully');
    expect(res.body.data.hotel.description).toBe(updatedDescription);
    expect(res.body.data.hotel.title).toBe(existingHotelData.title); 
  });

  it('should return 404 if hotel not found', async () => {
    const nonExistingHotelID = 'XYZ123'; 
    const updatedHotel: Hotel = { 
      hotelID: 'XYZ123', 
      slug: 'new-hotel',
      images: [], 
      title: 'New Hotel',
      description: 'A new hotel in town',
      guestCount: 4, 
      bedroomCount: 2,
      bathroomCount: 1,
      amenities: [],
      host: 'Test Host',
      address: '123 Main St',
      latitude: 0,
      longitude: 0,
      rooms: [] 
    };

    const res = await request(app)
      .put(`/api/hotel/${nonExistingHotelID}`)
      .send(updatedHotel);

    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Hotel not found');
  });

  it('should handle invalid input gracefully', async () => {
    const invalidHotelID = '123';
    const updatedHotel: Hotel = {
      hotelID: '123', 
      slug: 'invalid-hotel', 
      images: [], 
      title: 'New Hotel',
      description: 'A new hotel in town',
      guestCount: 4, 
      bedroomCount: 2,
      bathroomCount: 1,
      amenities: [],
      host: 'Test Host',
      address: '123 Main St',
      latitude: 0,
      longitude: 0,
      rooms: [] 
    };

    const res = await request(app)
      .put(`/api/hotel/${invalidHotelID}`)
      .send(updatedHotel);

    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Hotel not found'); 
  });
});

afterAll(() => {
  server.close();
});