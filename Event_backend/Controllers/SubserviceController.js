import SubserviceModel from "../Models/SubserviceModel.js";

/**
 * Create Subservice (Normalized Structure)
 * - Checks if subservice exists in subservices_master
 * - If exists: reuses existing ID
 * - If new: creates new entry
 * - Creates mappings in service_subservice_map for all selected categories
 */
export const createSubservice = async (req, res) => {
  try {
    const { service_category_ids, subservice_name, description, is_active } = req.body;
    const icon_url = req.file ? req.file.path : null;

    // Validation
    if (!service_category_ids || !Array.isArray(service_category_ids) || service_category_ids.length === 0) {
      return res.status(400).json({ 
        error: 'service_category_ids is required and must be a non-empty array' 
      });
    }

    if (!subservice_name?.trim()) {
      return res.status(400).json({ error: 'subservice_name is required' });
    }

    if (!icon_url) {
      return res.status(400).json({ error: 'subservice icon file is required' });
    }

    // Step 1: Create or get subservice from master table
    const subserviceData = {
      subservice_name: subservice_name.trim(),
      description: description || null,
      icon_url: icon_url,
      is_active: is_active !== undefined ? is_active : 1
    };

    const subserviceResult = await new Promise((resolve, reject) => {
      SubserviceModel.createOrGetSubservice(subserviceData, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });

    console.log(`✅ Subservice ${subserviceResult.isNew ? 'created' : 'found'}:`, subserviceResult);

    // Step 2: Create mappings for all selected service categories
    const mappingPromises = service_category_ids.map(category_id => {
      return new Promise((resolve, reject) => {
        SubserviceModel.createServiceSubserviceMapping(
          category_id,
          subserviceResult.id,
          (err, result) => {
            if (err) reject(err);
            else resolve(result);
          }
        );
      });
    });

    await Promise.all(mappingPromises);

    console.log(`✅ Created ${service_category_ids.length} mappings for subservice ID: ${subserviceResult.id}`);

    res.status(201).json({
      success: true,
      message: subserviceResult.isNew 
        ? 'Subservice created and mapped successfully'
        : 'Existing subservice mapped to new categories',
      subservice_id: subserviceResult.id,
      subservice_name: subservice_name,
      categories_mapped: service_category_ids.length,
      icon_url: icon_url,
      isNew: subserviceResult.isNew
    });

  } catch (err) {
    console.error('❌ Error creating subservice:', err);
    
    // Handle duplicate key error
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        error: 'Subservice with this name already exists',
        details: err.message
      });
    }
    
    res.status(500).json({
      error: 'Failed to create subservice',
      details: err.message
    });
  }
};

/**
 * Get Subservices by Service Category ID (Normalized)
 * Uses JOIN between service_subservice_map and subservices_master
 */
export const getSubservicesByCategory = (req, res) => {
  try {
    const { service_category_id } = req.params;

    if (!service_category_id) {
      return res.status(400).json({ error: 'service_category_id is required' });
    }

    SubserviceModel.getSubservicesByCategory(service_category_id, (err, results) => {
      if (err) {
        console.error('❌ Error fetching subservices:', err);
        return res.status(500).json({ 
          error: 'Failed to fetch subservices',
          details: err.message 
        });
      }

      console.log(`✅ Found ${results.length} subservices for category ${service_category_id}`);

      res.status(200).json({
        success: true,
        count: results.length,
        service_category_id: parseInt(service_category_id),
        subservices: results
      });
    });

  } catch (err) {
    console.error('❌ Error in getSubservicesByCategory:', err);
    res.status(500).json({ 
      error: 'Server error',
      details: err.message 
    });
  }
};

/**
 * Get All Unique Subservices (from master table)
 */
export const getAllSubservices = (req, res) => {
  try {
    SubserviceModel.getAllSubservices((err, results) => {
      if (err) {
        console.error('❌ Error fetching all subservices:', err);
        return res.status(500).json({ 
          error: 'Failed to fetch subservices',
          details: err.message 
        });
      }

      res.status(200).json({
        success: true,
        count: results.length,
        subservices: results
      });
    });

  } catch (err) {
    console.error('❌ Error in getAllSubservices:', err);
    res.status(500).json({ 
      error: 'Server error',
      details: err.message 
    });
  }
};

/**
 * Get Subservice by ID
 */
export const getSubserviceById = (req, res) => {
  try {
    const { subservice_id } = req.params;

    if (!subservice_id) {
      return res.status(400).json({ error: 'subservice_id is required' });
    }

    SubserviceModel.getSubserviceById(subservice_id, (err, results) => {
      if (err) {
        console.error('❌ Error fetching subservice:', err);
        return res.status(500).json({ 
          error: 'Failed to fetch subservice',
          details: err.message 
        });
      }

      if (!results || results.length === 0) {
        return res.status(404).json({ error: 'Subservice not found' });
      }

      res.status(200).json({
        success: true,
        subservice: results[0]
      });
    });

  } catch (err) {
    console.error('❌ Error in getSubserviceById:', err);
    res.status(500).json({ 
      error: 'Server error',
      details: err.message 
    });
  }
};

/**
 * Update Subservice
 */
export const updateSubservice = (req, res) => {
  try {
    const { subservice_id } = req.params;
    const updateData = req.body;

    if (req.file) {
      updateData.icon_url = req.file.path;
    }

    if (!subservice_id) {
      return res.status(400).json({ error: 'subservice_id is required' });
    }

    SubserviceModel.updateSubservice(subservice_id, updateData, (err, result) => {
      if (err) {
        console.error('❌ Error updating subservice:', err);
        return res.status(500).json({ 
          error: 'Failed to update subservice',
          details: err.message 
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Subservice not found' });
      }

      res.status(200).json({
        success: true,
        message: 'Subservice updated successfully',
        subservice_id: parseInt(subservice_id)
      });
    });

  } catch (err) {
    console.error('❌ Error in updateSubservice:', err);
    res.status(500).json({ 
      error: 'Server error',
      details: err.message 
    });
  }
};

/**
 * Delete Service-Subservice Mapping
 * (Removes mapping but keeps subservice in master table)
 */
export const deleteServiceSubserviceMapping = (req, res) => {
  try {
    const { service_category_id, subservice_id } = req.body;

    if (!service_category_id || !subservice_id) {
      return res.status(400).json({ 
        error: 'service_category_id and subservice_id are required' 
      });
    }

    SubserviceModel.deleteServiceSubserviceMapping(
      service_category_id,
      subservice_id,
      (err, result) => {
        if (err) {
          console.error('❌ Error deleting mapping:', err);
          return res.status(500).json({ 
            error: 'Failed to delete mapping',
            details: err.message 
          });
        }

        if (result.affectedRows === 0) {
          return res.status(404).json({ error: 'Mapping not found' });
        }

        res.status(200).json({
          success: true,
          message: 'Service-subservice mapping deleted successfully'
        });
      }
    );

  } catch (err) {
    console.error('❌ Error in deleteServiceSubserviceMapping:', err);
    res.status(500).json({ 
      error: 'Server error',
      details: err.message 
    });
  }
};

/**
 * Search Subservices (for autocomplete)
 */
export const searchSubservices = (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({ 
        error: 'Search query must be at least 2 characters' 
      });
    }

    SubserviceModel.searchSubservices(q.trim(), (err, results) => {
      if (err) {
        console.error('❌ Error searching subservices:', err);
        return res.status(500).json({ 
          error: 'Failed to search subservices',
          details: err.message 
        });
      }

      res.status(200).json({
        success: true,
        count: results.length,
        subservices: results
      });
    });

  } catch (err) {
    console.error('❌ Error in searchSubservices:', err);
    res.status(500).json({ 
      error: 'Server error',
      details: err.message 
    });
  }
};

/**
 * Get Categories by Subservice
 * (Shows which categories a subservice is mapped to)
 */
export const getCategoriesBySubservice = (req, res) => {
  try {
    const { subservice_id } = req.params;

    if (!subservice_id) {
      return res.status(400).json({ error: 'subservice_id is required' });
    }

    SubserviceModel.getCategoriesBySubservice(subservice_id, (err, results) => {
      if (err) {
        console.error('❌ Error fetching categories:', err);
        return res.status(500).json({ 
          error: 'Failed to fetch categories',
          details: err.message 
        });
      }

      res.status(200).json({
        success: true,
        count: results.length,
        subservice_id: parseInt(subservice_id),
        categories: results
      });
    });

  } catch (err) {
    console.error('❌ Error in getCategoriesBySubservice:', err);
    res.status(500).json({ 
      error: 'Server error',
      details: err.message 
    });
  }
};
