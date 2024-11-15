import path from 'path';
import fs from 'fs';
import { Request, Response } from 'express';
import { Hotel, Room } from '../models/hotelModel';
import { __dirname } from '../dirnameHelper';
import slugify from 'slugify';

const dataPath = path.join(__dirname, '../data/');
const imageDirectory = path.join(__dirname, '../uploads/images');
const imageBaseURL = 'http://localhost:3000/uploads/images'; // Base URL for serving images

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
    const savedHotelImages = hotelImages.map((imagePath: string, index: number) => {
      const imageFileName = `${hotelID}_hotel_${Date.now()}_${index}${path.extname(imagePath)}`; // Keep original extension
      const imageDestination = path.join(imageDirectory, imageFileName);

      // Copy the image to the uploads folder
      fs.copyFileSync(imagePath, imageDestination);

      return `/uploads/images/${imageFileName}`;
    });

    const savedRooms = rooms.map((room: Room) => ({
      ...room,
      roomImage: room.roomImage.map((imagePath: string, index: number) => {
        const imageFileName = `${hotelID}_room_${Date.now()}_${index}${path.extname(imagePath)}`; // Keep original extension
        const imageDestination = path.join(imageDirectory, imageFileName);

        fs.copyFileSync(imagePath, imageDestination);

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
export const uploadImages = async (req: Request, res: Response): Promise<void> => {
  try {
    const { hotelID } = req.params;
    const files = req.files as Express.Multer.File[];
    
    if (!files || files.length === 0) {
      res.status(400).json({ message: 'No files uploaded' });
      return;
    }

    const filePath = path.join(dataPath, `${hotelID}.json`);
    
    // Check if hotel exists
    if (!fs.existsSync(filePath)) {
      res.status(404).json({ message: 'Hotel not found' });
      return;
    }

    // Read existing hotel data
    const hotelData: Hotel = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    // Process and save new images
    const newImagePaths = files.map((file) => {
      const relativePath = `/uploads/images/${file.filename}`;
      return relativePath;
    });

    // Add new images to existing ones
    hotelData.images = [...hotelData.images, ...newImagePaths];

    // Save updated hotel data
    fs.writeFileSync(filePath, JSON.stringify(hotelData, null, 2));

    res.status(200).json({
      status: 'success',
      message: 'Images uploaded successfully',
      data: {
        images: newImagePaths
      }
    });
  } catch (error) {
    console.error('Error uploading images:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal Server Error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
//=============================================GET HOTEL==========================================================
export const getHotel = (req: Request, res: Response): Response | void => {
  try {
    const identifier = req.params.hotelID;
    const slugifiedIdentifier = slugify(identifier, { lower: true });

    // Initialize a variable to hold the matched hotel data
    let matchedHotelData: Hotel | null = null;

    // Loop through all files in the dataPath directory
    fs.readdirSync(dataPath).forEach((file) => {
      const filePath = path.join(dataPath, file);
      const hotelData: Hotel = JSON.parse(fs.readFileSync(filePath, 'utf8'));

      // Check if the file's data matches either the hotelID or slug
      if (hotelData.hotelID === identifier || hotelData.slug === slugifiedIdentifier) {
        matchedHotelData = hotelData;
      }
    });

    // If no match was found, return 404
    if (!matchedHotelData) {
      return res.status(404).json({ message: 'Hotel not found' });
    }

    // No need to process data to include base64 images as it is not encoded anymore
    // const processedHotelData = processHotelData(matchedHotelData);

    // Return the processed hotel data
    return res.status(200).json({
      status: 'success',
      data: {
        hotel: matchedHotelData // No need to process, just return the raw data
      }
    });

  } catch (error) {
    console.error('Error retrieving hotel:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal Server Error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
//=============================================UPDATE HOTEL========================================================
export const updateHotel = (req: Request, res: Response): Response | void => {
  try {
    const hotelID = req.params.hotelID;
    const updatedHotelData: Hotel = req.body;

    const filePath = path.join(__dirname, '..', 'data', `${hotelID}.json`);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Hotel not found' });
    }

    let existingHotelData: Hotel = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    if (existingHotelData.title !== updatedHotelData.title) {
      existingHotelData.slug = slugify(updatedHotelData.title, { lower: true });
    }

    existingHotelData = {
      ...existingHotelData,
      ...updatedHotelData,
      slug: slugify(updatedHotelData.title, { lower: true }),
      rooms: existingHotelData.rooms.map(room => ({ 
        ...room,
        hotelSlug: slugify(updatedHotelData.title, { lower: true }),
        roomSlug: room.roomTitle && typeof room.roomTitle === 'string' ? 
          slugify(room.roomTitle, { lower: true }) : // Update roomSlug if it's a string
          room.roomSlug // Otherwise keep the existing slug
      }))
    };

    fs.writeFileSync(filePath, JSON.stringify(existingHotelData, null, 2));

    return res.status(200).json({
      status: 'success',
      message: 'Hotel updated successfully',
      data: {
        hotel: existingHotelData 
      }
    });

  } catch (error) {
    console.error('Error updating hotel:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal Server Error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};