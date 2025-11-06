import express from 'express';
import {insertVendor , getAllVendor , AddEventImages , getvendorById } from '../Controllers/VendorController.js';
import { upload } from '../Utils/Upload.js';

const router = express.Router();

// Route to insert a new vendor with profile picture upload
router.post('/InsertVendor', upload.single('profilePicture'), insertVendor);
router.get('/Getallvendors' , getAllVendor );
router.post('/AddEventImages' , upload.array('eventImages', 5), AddEventImages)
router.get('/getvendorById' , getvendorById);


export default router;