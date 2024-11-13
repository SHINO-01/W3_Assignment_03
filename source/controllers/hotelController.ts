import path from 'path';
import fs from 'fs';
import { Request, Response } from 'express';
import { Hotel, Room } from '../models/hotelModel';
import { __dirname } from '../dirnameHelper';
import slugify from 'slugify';

const dataPath = path.join(__dirname, '../data/');
const imageDirectory = path.join(__dirname, '../uploads/images');

if (!fs.existsSync(imageDirectory)) {
  fs.mkdirSync(imageDirectory, { recursive: true });
}

function generateUID(): string {
  const alphabets = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const digits = '0123456789';

  let uid = '';

  for (let i = 0; i < 3; i++) {
    const randomIndex = Math.floor(Math.random() * alphabets.length);
    uid += alphabets[randomIndex];
  }

  for (let i = 0; i < 3; i++) {
    const randomIndex = Math.floor(Math.random() * digits.length);
    uid += digits[randomIndex];
  }

  return uid;
}

if (!fs.existsSync(dataPath)) {
  fs.mkdirSync(dataPath, { recursive: true });
}

// Controller function to handle hotel creation and base64 image storage
export const createHotel = (req: Request, res: Response): void => {
  try {
    const {
      title,
      description,
      guestCount,
      bedroomCount,
      bathroomCount,
      amenities,
      host,
      address,
      latitude,
      longitude,
      rooms,
      hotelImages, // Expecting hotel images as an array of base64 strings
    } = req.body;

    const hotelID = generateUID();
    const slug = slugify(title, { lower: true });

    // Save base64 images to file system
    const savedHotelImages = hotelImages.map((base64Image: string, index: number) => {
      const imageFileName = `${hotelID}_hotel_${Date.now()}_${index}.png`;
      const imageDestination = path.join(imageDirectory, imageFileName);

      // Decode base64 and write to the image destination
      const imageBuffer = Buffer.from(base64Image, 'base64');
      fs.writeFileSync(imageDestination, imageBuffer);

      return `/uploads/images/${imageFileName}`;
    });

    const savedRooms = rooms.map((room: Room) => ({
      ...room,
      roomImage: room.roomImage.map((base64Image: string, index: number) => {
        const imageFileName = `${hotelID}_room_${Date.now()}_${index}.png`;
        const imageDestination = path.join(imageDirectory, imageFileName);

        const imageBuffer = Buffer.from(base64Image, 'base64');
        fs.writeFileSync(imageDestination, imageBuffer);

        return `/uploads/images/${imageFileName}`;
      })
    }));

    const newHotel: Hotel = {
      hotelID,
      slug,
      images: savedHotelImages,
      title,
      description,
      guestCount,
      bedroomCount,
      bathroomCount,
      amenities,
      host,
      address,
      latitude,
      longitude,
      rooms: savedRooms
    };

    const filePath = path.join(dataPath, `${hotelID}.json`);
    fs.writeFileSync(filePath, JSON.stringify(newHotel, null, 2));

    res.status(201).json(newHotel);
  } catch (error) {
    console.error('Error creating hotel:', error);
    res.status(500).json({
      message: 'Internal Server Error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

//==========================================UPLOAD IMAGE CONTROLLER======================================================
export const uploadImages = (req: Request, res: Response): void => {
  const { hotelId, roomTitle } = req.body;

  // Define the path for the hotel data file
  const hotelPath = path.join(dataPath, `${hotelId}.json`);

  // Check if hotel record exists
  if (!fs.existsSync(hotelPath)) {
    res.status(404).json({ message: 'Hotel not found' });
    return;
  }

  // Read the hotel data
  const hotel = JSON.parse(fs.readFileSync(hotelPath, 'utf-8'));

  // Find the room that matches the roomTitle
  const room = hotel.rooms.find((r: any) => r.roomTitle === roomTitle);
  if (!room) {
    res.status(404).json({ message: 'Room not found' });
    return;
  }

  // Ensure files are uploaded
  if (!req.files || !(req.files as Express.Multer.File[]).length) {
    res.status(400).json({ message: 'No files uploaded' });
    return;
  }

  // Map uploaded files to Base64 strings
  const imageBase64Strings = (req.files as Express.Multer.File[])?.map((file) => {
    return `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
  });

  // Append the uploaded images to the room's image array
  room.roomImage = room.roomImage.concat(imageBase64Strings || []);

  // Save the updated hotel data
  fs.writeFileSync(hotelPath, JSON.stringify(hotel, null, 2));

  // Respond with the updated room images
  res.status(200).json({
    message: 'Images uploaded successfully for the room',
    images: imageBase64Strings,
  });
};

//=============================================GET HOTEL==========================================================
export const getHotel = (req: Request, res: Response) => {
  const { hotelID } = req.params;

  // Generate the path to the hotel data file
  const hotelPath = path.join(__dirname, '../data', `${hotelID}.json`);

  // Check if the hotel file exists
  if (!fs.existsSync(hotelPath)) {
    return res.status(404).json({ message: 'Hotel not found' });
  }

  try {
    const hotelData: Hotel = JSON.parse(fs.readFileSync(hotelPath, 'utf-8'));

    // Construct full image URLs
    hotelData.images = hotelData.images.map((image) => `http://localhost:3000${image}`);
    hotelData.rooms.forEach((room) => {
      room.roomImage = room.roomImage.map((image) => `http://localhost:3000${image}`);
    });

    // Send the hotel data as the response
    return res.status(200).json(hotelData);
  } catch (error) {
    console.error('Error reading hotel data:', error); // Log the error for debugging
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

//=============================================UPDATE HOTEL========================================================
export const updateHotel = (req: Request, res: Response): void => {
  const { hotelId } = req.params;
  const hotelPath = `${dataPath}${hotelId}.json`;

  if (!fs.existsSync(hotelPath)) {
    res.status(404).json({ message: 'Hotel not found' });
    return;
  }

  const updatedHotel = { ...JSON.parse(fs.readFileSync(hotelPath, 'utf-8')), ...req.body };

  fs.writeFileSync(hotelPath, JSON.stringify(updatedHotel, null, 2));

  res.status(200).json(updatedHotel);
};
