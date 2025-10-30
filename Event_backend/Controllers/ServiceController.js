import ServiceModel from '../Models/ServiceModel.js';

export const insertService = (req, res) => {
          
    const {category_name, description, is_active } = req.body;
    
    // Cloudinary returns secure_url or url, not path
    const icon_url = req.file ? req.file.path : null;


    if (!category_name || !description || !icon_url) {
        return res.status(400).json({ error: 'All fields are required' });
    }
    
    const serviceData = {
        category_name,
        description,
        icon_url,
        is_active
    };
    
    ServiceModel.insertService(serviceData, (err, results) => {
        if (err) {
            console.error('Error inserting service category:', err);
            return res.status(500).json({ error: 'Database insertion error' });
        }
        res.status(201).json({ 
            message: 'Service category inserted successfully', 
            serviceId: results.insertId,
            icon_url: icon_url // Optional: return the uploaded URL
        });
    });
}

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
