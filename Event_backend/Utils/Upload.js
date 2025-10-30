import express from 'express';
import multer from 'multer';
import cloudinary from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

// Configure Cloudinary
cloudinary.v2.config({
    cloud_name: process.env.Cloudnary_CLOUD_NAME,
    api_key: process.env.Cloudnary_API_KEY,
    api_secret: process.env.Cloudnary_API_SECRET
});

const fieldtodir = { 
    serviceIcon: 'Service_Icons',
    profilePicture: 'Vendor_Profiles'  
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
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
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