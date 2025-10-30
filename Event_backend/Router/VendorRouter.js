import express from 'express';
import {insertVendor , getAllVendor} from '../Controllers/VendorController.js';
import { upload } from '../Utils/Upload.js';

const router = express.Router();

// Route to insert a new vendor with profile picture upload
router.post('/InsertVendor', upload.single('profilePicture'), insertVendor);
router.get('/Getallvendors' , getAllVendor );

export default router;