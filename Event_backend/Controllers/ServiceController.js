import ServiceModel from '../Models/ServiceModel.js';

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

    console.log('💾 Inserting service data:', serviceData);

    ServiceModel.insertService(serviceData, (err, results) => {
        if (err) {
            console.error('❌ Error inserting service category:', err);
            return res.status(500).json({
                error: 'Database insertion error',
                details: err.message,
                sqlMessage: err.sqlMessage
            });
        }

        console.log('✅ Service inserted successfully:', results);

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

    console.log('🔍 GET Service by ID called with ID:', id);

    if (!id) {
        console.log('❌ No ID provided');
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

            console.log('✅ Query executed successfully, results:', results);

            if (!results || results.length === 0) {
                console.log('⚠️ No service found with ID:', id);
                return res.status(404).json({ error: 'Service not found' });
            }

            console.log('✅ Returning service data');
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

    // function to create Subservices
   export const  createSubservice = (req, res) => {
    try {
        const { service_category_ids, subservice_name, description, is_active } = req.body;
        const icon_url = req.file ? req.file.path : null;

        // ✅ Validations
        if (!Array.isArray(service_category_ids) || service_category_ids.length === 0) {
            return res.status(400).json({ error: 'At least one service_category_id is required' });
        }

        if (!subservice_name?.trim()) {
            return res.status(400).json({ error: 'subservice_name is required' });
        }

        if (!description?.trim()) {
            return res.status(400).json({ error: 'description is required' });
        }

        if (is_active === undefined || is_active === null) {
            return res.status(400).json({ error: 'is_active is required' });
        }

        if (!icon_url) {
            return res.status(400).json({ error: 'subserviceIcon file is required' });
        }

        // ✅ Prepare data for bulk insert
        const subserviceRows = service_category_ids.map(service_category_id => ([
            service_category_id,
            subservice_name,
            description,
            icon_url,
            parseInt(is_active)
        ]));

        // ✅ Call model
        ServiceModel.createSubservice(subserviceRows, (err, result) => {
            if (err) {
                console.error('❌ Error creating subservice:', err);
                return res.status(500).json({
                    error: 'Database insertion error',
                    details: err.message
                });
            }

            res.status(201).json({
                message: 'Subservice created successfully',
                insertedRows: result.affectedRows,
                icon_url
            });
        });

    } catch (error) {
        console.error('❌ Server Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }


}

export const GetsubservicesByServiceCategoryId = (req, res) => {
    const { service_category_id } = req.params;
    if (!service_category_id) {
        return res.status(400).json({ error: 'service_category_id is required' });
    }
    ServiceModel.getsubservicesByServiceCategoryId(service_category_id, (err, results) => {
        if (err) {
            console.error('Error fetching subservices:', err);
            return res.status(500).json({ error: 'Database retrieval error' });
        }
        res.status(200).json(results);
    });
}

