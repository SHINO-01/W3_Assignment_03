import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { Request, Response } from 'express';
import slugify from 'slugify';
import { Hotel } from '../models/hotelModel';
import { __dirname } from '../dirnameHelper';

const dataPath = path.join(__dirname, '../data/');

function generateUID(): string {
  const alphabets = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const digits = '0123456789';

  let uid = '';

  // Generate first 3 alphabet characters
  for (let i = 0; i < 3; i++) {
    const randomIndex = Math.floor(Math.random() * alphabets.length);
    uid += alphabets[randomIndex];
  }

  // Generate last 3 digit characters
  for (let i = 0; i < 3; i++) {
    const randomIndex = Math.floor(Math.random() * digits.length);
    uid += digits[randomIndex];
  }

  return uid;
}

if (!fs.existsSync(dataPath)) {
  fs.mkdirSync(dataPath, { recursive: true }); // Create the directory if it doesn't exist
}

export const createHotel = (req: Request, res: Response): void => {
  try {
  
    const { title, description, guestCount, bedroomCount, bathroomCount, amenities, host, address, latitude, longitude, rooms } = req.body;
    
    const hotelID = generateUID();
    const slug = slugify(title, { lower: true });
    
    const newHotel: Hotel = { hotelID, slug, images: [], title, description, guestCount, bedroomCount, bathroomCount, amenities, host, address, latitude, longitude, rooms };
    
    try {
      const filePath = path.join(dataPath, `${hotelID}.json`);
      console.log('Saving hotel data to:', filePath);  // Debug log
      fs.writeFileSync(filePath, JSON.stringify(newHotel, null, 2));
    } catch (error) {
      console.error('Error writing file:', error);  // Log the error in case of failure
    }    
    
    res.status(201).json(newHotel);
  } catch (error) {
    console.error('Error creating hotel:', error); // Log the error details
    res.status(500).json({ message: 'Internal Server Error', error: error instanceof Error ? error.message : 'Unknown error' });
  }
};


export const uploadImages = (req: Request, res: Response): void => {
  const { hotelId } = req.body;
  const hotelPath = `${dataPath}${hotelId}.json`;

  if (!fs.existsSync(hotelPath)) {
    res.status(404).json({ message: 'Hotel not found' });
    return;
  }

  const hotel: Hotel = JSON.parse(fs.readFileSync(hotelPath, 'utf-8'));

  const imageBase64Strings = (req.files as Express.Multer.File[])?.map((file) => {
    return `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
  });

  hotel.images = hotel.images.concat(imageBase64Strings || []);

  fs.writeFileSync(hotelPath, JSON.stringify(hotel, null, 2));

  res.status(200).json({ message: 'Images uploaded successfully', images: imageBase64Strings });
};

export const getHotel = async (req: Request, res: Response): Promise<void> => {
  const { hotelId } = req.params;
  const hotelPath = `${dataPath}${hotelId}.json`;

  if (!fs.existsSync(hotelPath)) {
    res.status(404).json({ message: 'Hotel not found' });
    return;
  }

  const hotel: Hotel = JSON.parse(await fs.promises.readFile(hotelPath, 'utf-8'));
  res.status(200).json(hotel);
};

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
