import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

const connectCloudinary = async () => {
  try {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_SECRET_KEY,
    });
    console.log('Cloudinary connected successfully');
  } catch (err) {
    console.error('Error connecting to Cloudinary:', err.message);
    process.exit(1);
  }
};

export default connectCloudinary;