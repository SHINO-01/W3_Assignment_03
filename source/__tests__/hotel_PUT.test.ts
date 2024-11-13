import request from 'supertest';
import fs from 'fs';
import path from 'path';
import { app, server } from '../index';
import { Hotel } from '../models/hotelModel';
import { __dirname } from '../dirnameHelper';

const dataPath = path.join(__dirname, '../data/');

describe('Update Hotel Controller', () => {
  const testHotelID = 'WHP902'; // Using existing hotel ID from sample
  let originalHotelData: Hotel;

  beforeEach(() => {
    // Backup original hotel data
    const filePath = path.join(dataPath, `${testHotelID}.json`);
    originalHotelData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  });

  afterEach(() => {
    // Restore original hotel data after each test
    const filePath = path.join(dataPath, `${testHotelID}.json`);
    fs.writeFileSync(filePath, JSON.stringify(originalHotelData, null, 2));
  });

  afterAll((done) => {
    server.close(done);
  });

  it('should perform a partial update of hotel information', async () => {
    const partialUpdate = {
      title: 'Partially Updated Luxury Hotel',
      description: 'A refined luxury hotel experience'
    };

    const response = await request(app)
      .put(`/api/hotel/${testHotelID}`)
      .send(partialUpdate)
      .expect(200);

    expect(response.body.status).toBe('success');
    expect(response.body.data.hotel).toEqual(expect.objectContaining({
      ...originalHotelData,
      title: partialUpdate.title,
      description: partialUpdate.description,
      slug: 'partially-updated-luxury-hotel',
      // Verify unchanged fields remain the same
      guestCount: originalHotelData.guestCount,
      bedroomCount: originalHotelData.bedroomCount,
      bathroomCount: originalHotelData.bathroomCount,
      amenities: originalHotelData.amenities,
      host: originalHotelData.host
    }));
  });

  it('should perform a full update of hotel information', async () => {
    const fullUpdate = {
      title: 'Completely Updated Luxury Resort',
      description: 'A fully renovated luxury resort experience',
      guestCount: 8,
      bedroomCount: 4,
      bathroomCount: 3,
      amenities: ['WiFi', 'Pool', 'Spa', 'Restaurant', 'Gym', 'Beach Access'],
      host: 'John Smith',
      address: '789 Ocean Drive, Miami Beach, FL',
      latitude: 25.7617,
      longitude: -80.1918,
      rooms: [
        {
          hotelSlug: 'completely-updated-luxury-resort',
          roomSlug: 'luxury-suite',
          roomTitle: 'Luxury Suite',
          bedroomCount: 2,
          roomImage: originalHotelData.rooms[0].roomImage // Keep existing room images
        }
      ],
      images: originalHotelData.images // Keep existing hotel images
    };

    const response = await request(app)
      .put(`/api/hotel/${testHotelID}`)
      .send(fullUpdate)
      .expect(200);

    expect(response.body.status).toBe('success');
    expect(response.body.data.hotel).toEqual(expect.objectContaining({
      hotelID: testHotelID,
      slug: 'completely-updated-luxury-resort',
      title: fullUpdate.title,
      description: fullUpdate.description,
      guestCount: fullUpdate.guestCount,
      bedroomCount: fullUpdate.bedroomCount,
      bathroomCount: fullUpdate.bathroomCount,
      amenities: fullUpdate.amenities,
      host: fullUpdate.host,
      address: fullUpdate.address,
      latitude: fullUpdate.latitude,
      longitude: fullUpdate.longitude
    }));

    // Verify room data is updated correctly
    expect(response.body.data.hotel.rooms).toHaveLength(1);
    expect(response.body.data.hotel.rooms[0]).toEqual(expect.objectContaining({
      hotelSlug: 'completely-updated-luxury-resort',
      roomSlug: 'luxury-suite',
      roomTitle: 'Luxury Suite',
      bedroomCount: 2
    }));

    // Verify images are preserved
    expect(response.body.data.hotel.images).toEqual(originalHotelData.images);
  });

  it('should verify data persistence after update', async () => {
    const updateData = {
      title: 'Persistence Test Hotel',
      description: 'Testing data persistence'
    };

    await request(app)
      .put(`/api/hotel/${testHotelID}`)
      .send(updateData)
      .expect(200);

    // Read the file directly to verify persistence
    const filePath = path.join(dataPath, `${testHotelID}.json`);
    const savedData = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    expect(savedData.title).toBe(updateData.title);
    expect(savedData.description).toBe(updateData.description);
    expect(savedData.slug).toBe('persistence-test-hotel');
  });
});