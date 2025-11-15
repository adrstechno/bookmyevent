import express from 'express';
import {insertVendor , getAllVendor , AddEventImages , getvendorById , updateVendorProfile  , VendorShift , getVendorShiftforVendor  , GetvendorEventImages  , updateVendorShiftbyId  , deleteVendorShiftbyId} from '../Controllers/VendorController.js';
import { upload } from '../Utils/Upload.js';

const router = express.Router();

// Route to insert a new vendor with profile picture upload
router.post('/InsertVendor', upload.single('profilePicture'), insertVendor);
router.get('/Getallvendors' , getAllVendor );
router.post('/AddEventImages' , upload.array('eventImages', 5), AddEventImages)
router.get('/getvendorById' , getvendorById);
router.post('/updateVendorProfile' ,upload.single('profilePicture') , updateVendorProfile);
router.post('/AddvendorShifts', VendorShift);
router.get('/getVendorShiftforVendor', getVendorShiftforVendor);
router.get('/GetvendorEventImages', GetvendorEventImages);
router.post('/updateVendorShiftbyId', updateVendorShiftbyId);
router.get('/deleteVendorShiftbyId', deleteVendorShiftbyId);



export default router;