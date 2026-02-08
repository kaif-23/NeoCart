import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs'

// Configure cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (filePath) => {
    try {
        if (!filePath) {
            return null
        }

        // Debug: Log config values (remove after testing)
        console.log('Cloudinary Config:', {
            cloud_name: process.env.CLOUDINARY_NAME,
            api_key: process.env.CLOUDINARY_API_KEY ? 'SET' : 'NOT SET',
            api_secret: process.env.CLOUDINARY_API_SECRET ? 'SET' : 'NOT SET'
        });

        // Re-configure to ensure env vars are loaded
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET
        });

        const uploadResult = await cloudinary.uploader.upload(filePath, {
            folder: 'neocart/profiles'
        });

        // Clean up local file after successful upload
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        return uploadResult.secure_url;

    } catch (error) {
        console.error('Cloudinary upload error:', error);

        // Clean up local file even on error
        try {
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        } catch (unlinkError) {
            console.error('Failed to delete temp file:', unlinkError);
        }

        return null;
    }

}

// Export both the cloudinary instance and the upload function
export default cloudinary;
export { uploadOnCloudinary };
