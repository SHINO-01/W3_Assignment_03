import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import { Request, Response } from 'express';
import slugify from 'slugify';
import { Hotel } from '../models/hotelModel';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataPath = path.join(__dirname, '../data/');

export const createHotel = (req: Request, res: Response): void => {
  const { title, description, guestCount, bedroomCount, bathroomCount, amenities, host, address, latitude, longitude, rooms } = req.body;
  
  const hotelID = new Date().getTime().toString();  // simple unique ID
  const slug = slugify(title, { lower: true });
  
  const newHotel: Hotel = { hotelID, slug, images: [], title, description, guestCount, bedroomCount, bathroomCount, amenities, host, address, latitude, longitude, rooms };
  
  fs.writeFileSync(`${dataPath}${hotelID}.json`, JSON.stringify(newHotel, null, 2));
  
  res.status(201).json(newHotel);
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
