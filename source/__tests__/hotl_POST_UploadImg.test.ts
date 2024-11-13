import fs from 'fs';
import path from 'path';
import request from 'supertest';
import { app, server } from '../index';
import { __dirname } from '../dirnameHelper';
import { Hotel, Room } from '../models/hotelModel';

const dataPath = path.join(__dirname, '../data/');
const imageDirectory = path.join(__dirname, '../uploads/images');

afterAll(() => {
    server.close();
  });
  
  describe('UploadImage Controller', () => {
    let existingHotelID: string;
  
    beforeEach(() => {
      // Get the first hotel ID from the data directory
      const files = fs.readdirSync(dataPath);
      existingHotelID = files[0].replace('.json', '');
    });
  
    test('should upload hotel images', async () => {
      // Prepare test images
      const imageFile1 = fs.readFileSync(path.join(__dirname, 'test_images', 'image1.png'));
      const imageFile2 = fs.readFileSync(path.join(__dirname, 'test_images', 'image2.png'));
  
      // Send the request to upload images
      const response = await request(app)
        .post(`/api/images/${existingHotelID}`)
        .attach('images', imageFile1, 'image1.png')
        .attach('images', imageFile2, 'image2.png');
  
      expect(response.status).toBe(200);
  
      // Verify that the hotel data has been updated
      const updatedHotelData = JSON.parse(
        fs.readFileSync(path.join(dataPath, `${existingHotelID}.json`), 'utf8')
      ) as Hotel;
      expect(updatedHotelData.images.length).toBe(2);
    });
  
    test('should upload room images', async () => {
      // Get the first room from the existing hotel
      const hotelData = JSON.parse(fs.readFileSync(path.join(dataPath, `${existingHotelID}.json`), 'utf8')) as Hotel;
      const firstRoom = hotelData.rooms.find((r: Room) => r.roomSlug === hotelData.rooms[0].roomSlug) as Room;
  
      // Prepare test images
      const imageFile1 = fs.readFileSync(path.join(__dirname, 'test_images', 'image1.png'));
      const imageFile2 = fs.readFileSync(path.join(__dirname, 'test_images', 'image2.png'));
  
      // Send the request to upload images
      const response = await request(app)
        .post(`/api/images/${existingHotelID}?roomID=${firstRoom.roomSlug}`)
        .attach('images', imageFile1, 'image1.png')
        .attach('images', imageFile2, 'image2.png');
  
      expect(response.status).toBe(200);
  
      // Verify that the room data has been updated
      const updatedHotelData = JSON.parse(
        fs.readFileSync(path.join(dataPath, `${existingHotelID}.json`), 'utf8')
      ) as Hotel;
      const updatedRoom = updatedHotelData.rooms.find((r: Room) => r.roomSlug === firstRoom.roomSlug) as Room;
      expect(updatedRoom.roomImage.length).toBe(2);
    });
  
    test('should return 404 if hotel not found', async () => {
      const response = await request(app)
        .post('/api/images/INVALID_ID')
        .attach('images', Buffer.from(''), 'image.png');
  
      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Hotel not found');
    });
  
    test('should return 404 if room not found', async () => {
      const response = await request(app)
        .post(`/api/images/${existingHotelID}?roomID=INVALID_ROOM_ID`)
        .attach('images', Buffer.from(''), 'image.png');
  
      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Room not found');
    });
  });