import ServiceModel from '../Models/ServiceModel.js';
import SubserviceModel from '../Models/SubserviceModel.js';

export const insertService = (req, res) => {
    const { category_name, description, is_active } = req.body;
    const icon_url = req.file ? req.file.path : null;

    // Validate required fields
    if (!category_name) {
        return res.status(400).json({ error: 'category_name is required' });
    }
    if (!description) {
        return res.status(400).json({ error: 'description is required' });
    }
    if (is_active === undefined || is_active === null) {
        return res.status(400).json({ error: 'is_active is required' });
    }
    if (!icon_url) {
        return res.status(400).json({ error: 'serviceIcon file is required' });
    }

    const serviceData = {
        category_name,
        description,
        icon_url,
        is_active: parseInt(is_active)
    };

    // console.log('💾 Inserting service data:', serviceData);

    ServiceModel.insertService(serviceData, (err, results) => {
        if (err) {
            console.error('❌ Error inserting service category:', err);
            return res.status(500).json({
                error: 'Database insertion error',
                details: err.message,
                sqlMessage: err.sqlMessage
            });
        }

        // console.log('✅ Service inserted successfully:', results);

        res.status(201).json({
            message: 'Service category inserted successfully',
            serviceId: results.insertId,
            service_category_id: results.insertId,
            icon_url
        });
    });
};


export const getAllServices = (req, res) => {
    ServiceModel.getAllServices((err, results) => {
        if (err) {
            console.error('Error fetching services:', err);
            return res.status(500).json({ error: 'Database retrieval error' });
        }
        res.status(200).json(results);
    }
    );
}


export const getServiceById = (req, res) => {
    const { id } = req.params;

    // console.log('🔍 GET Service by ID called with ID:', id);

    if (!id) {
        // console.log('❌ No ID provided');
        return res.status(400).json({ error: 'Service ID is required' });
    }

    try {
        ServiceModel.getServiceById(id, (err, results) => {
            if (err) {
                console.error('❌ Database error in getServiceById:', err);
                return res.status(500).json({
                    error: 'Database retrieval error',
                    details: err.message,
                    sqlMessage: err.sqlMessage
                });
            }

            // console.log('✅ Query executed successfully, results:', results);

            if (!results || results.length === 0) {
                // console.log('⚠️ No service found with ID:', id);
                return res.status(404).json({ error: 'Service not found' });
            }

            // console.log('✅ Returning service data');
            res.status(200).json(results[0]);
        });
    } catch (error) {
        console.error('❌ Unexpected error in getServiceById:', error);
        res.status(500).json({ error: 'Unexpected server error', details: error.message });
    }
};

export const updateService = (req, res) => {
    const { id } = req.params;
    const { category_name, description, is_active } = req.body;

    // If new icon uploaded, take it; else keep old one
    const icon_url = req.file ? req.file.path : null;

    if (!id || !category_name || !description) {
        return res.status(400).json({ error: 'Required fields are missing' });
    }

    const serviceData = {
        category_name,
        description,
        icon_url,
        is_active
    };

    ServiceModel.updateService(id, serviceData, (err, results) => {
        if (err) {
            console.error('Error updating service:', err);
            return res.status(500).json({ error: 'Database update error' });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Service not found' });
        }

        res.status(200).json({ message: 'Service updated successfully' });
    });
};

export const deleteService = (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ error: 'Service ID is required' });
    }

    ServiceModel.deleteService(id, (err, results) => {
        if (err) {
            console.error('Error deleting service:', err);
            return res.status(500).json({ error: 'Database deletion error' });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Service not found' });
        }

        res.status(200).json({ message: 'Service deleted successfully' });
    });
}

// ============================================================================
// SUBSERVICES - Now using normalized structure
// ============================================================================

/**
 * Create Subservice (Normalized Structure)
 * Uses SubserviceModel for normalized subservices_master + service_subservice_map
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
        console.error('Error creating subservice:', err);
        
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
}

/**
 * Get Subservices by Service Category ID
 * Uses ONLY the new normalized structure (subservices_master with category_ids JSON)
 */
export const GetsubservicesByServiceCategoryId = (req, res) => {
    const { service_category_id } = req.params;
    
    if (!service_category_id) {
        return res.status(400).json({ error: 'service_category_id is required' });
    }
    
    // Use new normalized structure with subservices_master
    SubserviceModel.getSubservicesByCategory(service_category_id, (err, results) => {
        if (err) {
            console.error('Error fetching subservices:', err);
            return res.status(500).json({ 
                error: 'Failed to fetch subservices',
                details: err.message 
            });
        }
        
        return res.status(200).json(results || []);
    });
}

