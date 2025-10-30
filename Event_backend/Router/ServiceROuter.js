import {insertService , getAllServices} from '../Controllers/ServiceController.js';
import express from 'express';
import { upload } from '../Utils/Upload.js';
const router = express.Router();

// Route to insert a new service with icon upload
router.post('/InsertService', upload.single('serviceIcon'), insertService);
// Route to get all services
router.get('/GetAllServices', getAllServices);
export default router;