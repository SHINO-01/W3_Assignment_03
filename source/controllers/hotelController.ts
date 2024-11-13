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
function getBase64Image(imagePath: string): string {
  try {
    const fullPath = path.join(__dirname, '..', imagePath);
    const imageBuffer = fs.readFileSync(fullPath);
    return `data:image/png;base64,${imageBuffer.toString('base64')}`;
  } catch (error) {
    console.error(`Error reading image file: ${imagePath}`, error);
    return '';
  }
}

function processHotelData(hotelData: Hotel): Hotel & { 
  base64Images: string[],
  rooms: (Room & { base64RoomImages: string[] })[] 
} {
  // Convert hotel images to base64
  const base64Images = hotelData.images.map(imagePath => getBase64Image(imagePath));

  // Process rooms and their images
  const processedRooms = hotelData.rooms.map(room => ({
    ...room,
    base64RoomImages: room.roomImage.map(imagePath => getBase64Image(imagePath)),
    roomImage: room.roomImage // Keep original paths
  }));

  return {
    ...hotelData,
    base64Images,
    rooms: processedRooms
  };
}

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

    // Process the hotel data to include base64 images
    const processedHotelData = processHotelData(matchedHotelData);

    // Return the processed hotel data
    return res.status(200).json({
      status: 'success',
      data: {
        hotel: processedHotelData
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
export const updateHotel = async (req: Request, res: Response): Promise<void> => {
  try {
    const hotelID = req.params.hotelID;
    const filePath = path.join(dataPath, `${hotelID}.json`);

    // Check if hotel exists
    if (!fs.existsSync(filePath)) {
      res.status(404).json({ message: 'Hotel not found' });
      return;
    }

    // Read existing hotel data
    const existingHotel: Hotel = JSON.parse(fs.readFileSync(filePath, 'utf8'));

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
      hotelImages, // Optional: new images to add/replace
    } = req.body;

    // Handle hotel images if provided
    let updatedHotelImages = [...existingHotel.images];
    if (hotelImages && Array.isArray(hotelImages)) {
      // Save new base64 images
      const newHotelImages = hotelImages.map((base64Image: string, index: number) => {
        const imageFileName = `${hotelID}_hotel_${Date.now()}_${index}.png`;
        const imageDestination = path.join(imageDirectory, imageFileName);
        
        const imageBuffer = Buffer.from(base64Image, 'base64');
        fs.writeFileSync(imageDestination, imageBuffer);
        
        return `/uploads/images/${imageFileName}`;
      });

      // Remove old images from filesystem
      existingHotel.images.forEach(imagePath => {
        const fullPath = path.join(__dirname, '..', imagePath);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      });

      updatedHotelImages = newHotelImages;
    }

    // Handle room updates if provided
    let updatedRooms = existingHotel.rooms;
    if (rooms && Array.isArray(rooms)) {
      // Remove old room images from filesystem
      existingHotel.rooms.forEach(room => {
        room.roomImage.forEach(imagePath => {
          const fullPath = path.join(__dirname, '..', imagePath);
          if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
          }
        });
      });

      // Process and save new room images
      updatedRooms = rooms.map((room: Room & { roomImage: string[] }) => ({
        ...room,
        hotelSlug: slugify(title || existingHotel.title, { lower: true }),
        roomImage: room.roomImage.map((base64Image: string, index: number) => {
          const imageFileName = `${hotelID}_room_${Date.now()}_${index}.png`;
          const imageDestination = path.join(imageDirectory, imageFileName);
          
          const imageBuffer = Buffer.from(base64Image, 'base64');
          fs.writeFileSync(imageDestination, imageBuffer);
          
          return `/uploads/images/${imageFileName}`;
        })
      }));
    }

    // Create updated hotel object
    const updatedHotel: Hotel = {
      ...existingHotel,
      title: title || existingHotel.title,
      slug: title ? slugify(title, { lower: true }) : existingHotel.slug,
      description: description || existingHotel.description,
      guestCount: guestCount || existingHotel.guestCount,
      bedroomCount: bedroomCount || existingHotel.bedroomCount,
      bathroomCount: bathroomCount || existingHotel.bathroomCount,
      amenities: amenities || existingHotel.amenities,
      host: host || existingHotel.host,
      address: address || existingHotel.address,
      latitude: latitude || existingHotel.latitude,
      longitude: longitude || existingHotel.longitude,
      images: updatedHotelImages,
      rooms: updatedRooms
    };

    // Save updated hotel data
    fs.writeFileSync(filePath, JSON.stringify(updatedHotel, null, 2));

    res.status(200).json({
      status: 'success',
      data: {
        hotel: updatedHotel
      }
    });
  } catch (error) {
    console.error('Error updating hotel:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal Server Error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};