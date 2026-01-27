import express from 'express';
import {insertVendor , getAllVendor , AddEventImages , getvendorById , GetVendorProfile , updateVendorProfile  , VendorShift , getVendorShiftforVendor , GetVendorShifts , GetvendorEventImages  , updateVendorShiftbyId  , deleteVendorShiftbyId , insertVendorPackage , updateVendorPackage , deleteVendorPackage , getAllVendorPackages , getvendorsByServiceId, getFreeVendorsByDay, GetVendorKPIs, GetVendorRecentActivities , getvendorsBysubserviceId } from '../Controllers/VendorController.js'; 
import { upload } from '../Utils/Upload.js';
import { authenticateToken } from '../Utils/auth.js';

const router = express.Router();

// Route to insert a new vendor with profile picture upload
router.post('/InsertVendor', upload.single('profilePicture'), insertVendor);
router.get('/Getallvendors' , getAllVendor );
router.post('/AddEventImages' , upload.array('eventImages', 5), AddEventImages)
router.get('/getvendorById' , getvendorById);
router.get('/GetVendorProfile' , GetVendorProfile);
router.post('/updateVendorProfile' ,upload.single('profilePicture') , updateVendorProfile);
router.post('/AddvendorShifts', VendorShift);
router.get('/getVendorShiftforVendor', getVendorShiftforVendor);
router.get('/GetVendorShifts', GetVendorShifts);
router.get('/GetvendorEventImages', GetvendorEventImages);

// Dashboard routes with authentication
router.get('/GetVendorKPIs', authenticateToken, GetVendorKPIs);
router.get('/GetVendorRecentActivities', authenticateToken, GetVendorRecentActivities);

router.post('/updateVendorShiftbyId', updateVendorShiftbyId);
router.get('/deleteVendorShiftbyId', deleteVendorShiftbyId);
router.post('/insertVendorPackage', insertVendorPackage);
router.post('/updateVendorPackage', updateVendorPackage);
router.get('/deleteVendorPackage', deleteVendorPackage);
router.get('/getAllVendorPackages', getAllVendorPackages);
router.get('/getvendorsByServiceId', getvendorsByServiceId);
router.get('/getFreeVendorsByDay', getFreeVendorsByDay);
router.get('/getvendorsBysubserviceId', getvendorsBysubserviceId);




export default router;