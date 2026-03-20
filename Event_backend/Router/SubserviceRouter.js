import express from 'express';
import { upload } from '../Utils/Upload.js';
import {
  createSubservice,
  getSubservicesByCategory,
  getAllSubservices,
  getSubserviceById,
  updateSubservice,
  deleteServiceSubserviceMapping,
  searchSubservices,
  getCategoriesBySubservice
} from '../Controllers/SubserviceController.js';

const router = express.Router();

// ============================================================================
// SUBSERVICE ROUTES (Normalized Structure)
// ============================================================================

/**
 * @route   POST /api/subservices/create
 * @desc    Create new subservice or reuse existing + create mappings
 * @access  Admin
 * @body    { service_category_ids: [1,2,3], subservice_name, description, is_active }
 * @file    icon_url (multipart/form-data)
 */
router.post('/create', upload.single('icon_url'), createSubservice);

/**
 * @route   GET /api/subservices/category/:service_category_id
 * @desc    Get all subservices for a specific service category
 * @access  Public
 */
router.get('/category/:service_category_id', getSubservicesByCategory);

/**
 * @route   GET /api/subservices/all
 * @desc    Get all unique subservices from master table
 * @access  Public
 */
router.get('/all', getAllSubservices);

/**
 * @route   GET /api/subservices/:subservice_id
 * @desc    Get subservice by ID
 * @access  Public
 */
router.get('/:subservice_id', getSubserviceById);

/**
 * @route   PUT /api/subservices/:subservice_id
 * @desc    Update subservice in master table
 * @access  Admin
 * @body    { subservice_name, description, is_active }
 * @file    icon_url (optional)
 */
router.put('/:subservice_id', upload.single('icon_url'), updateSubservice);

/**
 * @route   DELETE /api/subservices/mapping
 * @desc    Delete service-subservice mapping
 * @access  Admin
 * @body    { service_category_id, subservice_id }
 */
router.delete('/mapping', deleteServiceSubserviceMapping);

/**
 * @route   GET /api/subservices/search
 * @desc    Search subservices by name (autocomplete)
 * @access  Public
 * @query   q (search term)
 */
router.get('/search', searchSubservices);

/**
 * @route   GET /api/subservices/:subservice_id/categories
 * @desc    Get all categories mapped to a subservice
 * @access  Public
 */
router.get('/:subservice_id/categories', getCategoriesBySubservice);

// ============================================================================
// BACKWARD COMPATIBILITY ROUTES (Optional - for gradual migration)
// ============================================================================

/**
 * @route   GET /api/subservices/GetSubservicesByServiceCategoryId/:service_category_id
 * @desc    Legacy route - redirects to new normalized endpoint
 * @access  Public
 */
router.get('/GetSubservicesByServiceCategoryId/:service_category_id', getSubservicesByCategory);

export default router;
