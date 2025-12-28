import express from 'express';
import {
    insertService,
    getAllServices,
    getServiceById,
    updateService,
    deleteService
} from '../Controllers/ServiceController.js';

import { upload } from '../Utils/Upload.js';

const router = express.Router();

router.post(
    '/InsertService',
    upload.single('serviceIcon'),
    insertService
);

router.get('/GetAllServices', getAllServices);

router.get('/GetServiceById/:id', getServiceById);

router.put(
    '/UpdateService/:id',
    upload.single('serviceIcon'),
    updateService
);

router.delete('/DeleteService/:id', deleteService);

export default router;
