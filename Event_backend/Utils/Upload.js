import multer from 'multer';
import cloudinary from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

// Configure Cloudinary immediately (environment variables should be loaded by Server.js before this module is imported)
// Note: This module is imported by routers, which are imported by Server.js AFTER dotenv.config()
cloudinary.v2.config({
    cloud_name: process.env.Cloudnary_CLOUD_NAME,
    api_key: process.env.Cloudnary_API_KEY,
    api_secret: process.env.Cloudnary_API_SECRET
});

// Validate configuration (will log warning but not crash if missing)
if (!process.env.Cloudnary_CLOUD_NAME || !process.env.Cloudnary_API_KEY || !process.env.Cloudnary_API_SECRET) {
    console.error('⚠️  Cloudinary configuration incomplete in Upload.js:');
    console.error('   cloud_name:', process.env.Cloudnary_CLOUD_NAME || '❌ MISSING');
    console.error('   api_key:', process.env.Cloudnary_API_KEY ? '✅ Present' : '❌ MISSING');
    console.error('   api_secret:', process.env.Cloudnary_API_SECRET ? '✅ Present' : '❌ MISSING');
    console.error('   Note: If you see this, environment variables were not loaded before Upload.js was imported');
} else {
    console.log('✅ Cloudinary configured in Upload.js');
}

const fieldtodir = {
    serviceIcon: 'Service_Icons',
    profilePicture: 'Vendor_Profiles',
    eventImages: 'eventImages',
    icon_url: 'Subservice_Icons'
}

// Configure Cloudinary Storage
const storage = new CloudinaryStorage({
    cloudinary: cloudinary.v2,
    params: async (req, file) => {
        const folderName = fieldtodir[file.fieldname] || 'General_Uploads';
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const publicId = `${folderName}/${file.fieldname}-${uniqueSuffix}`;

        req.uploadedFilePath = publicId;

        return {
            folder: folderName,
            public_id: publicId,
            resource_type: 'auto'
        };
    }
});

// Add file filter
const fileFilter = (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

export { upload };