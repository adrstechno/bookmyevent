import { resolve } from 'url';
import VendorModel from '../Models/VendorModel.js';
import { verifyToken } from '../Utils/Verification.js';
import { rejects } from 'assert';


export const insertVendor = (req, res) => {
    // ✅ Check if file exists
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded. Please upload a profile picture.' });
    }

    const data = req.body;
    const token = req.cookies.auth_token;

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
        return res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }




    const userId = decoded.userId;
    // vendorData.user_id = userId;

    // // ✅ Get the Cloudinary URL from req.file
    const profile_url = req.file.path; // Cloudinary provides this
    // vendorData.is_verified = 0;
    // vendorData.is_active = 1;

    const vendorData = {
        user_id: userId,
        business_name: data.business_name,
        service_category_id: data.service_category_id,
        description: data.description,
        years_experience: data.years_experience,
        contact: data.contact,
        address: data.address,
        city: data.city,
        state: data.state,
        is_verified: 0,
        is_active: 1,
        profile_url: profile_url,
        event_profiles_url: data.event_profiles_url
    }



    console.log(vendorData);

    VendorModel.insertVendor(vendorData, (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Error inserting vendor', error: err });
        }
        const vendor_id = result.insertId;
        const vendorSubscriptionData = {
            vendor_id: vendor_id,
            start_date: new Date(),
            end_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
            billing_cycle: 'annual',
            status: 'active'
        };

        VendorModel.insertVendorSubcription(vendorSubscriptionData, (err, subResult) => {
            if (err) {
                return res.status(500).json({ message: 'Error inserting vendor subscription', error: err });
            }
            return res.status(200).json({
                message: 'Vendor inserted successfully',
                vendorId: result.insertId,
                subscriptionId: subResult.insertId,
                profileUrl: vendorData.profile_url // ✅ Return the URL
            });
        });
    });
};

export const getAllVendor = (req, res) => {
    //check if the user is login or not 
   const  token = req.cookies.auth_token;
    if (!token) {
        return res.status(401).json({ Messege: "Unauthorized" })
    }

    VendorModel.getallVendors((err, results) => {
        if (err) {
            return res.status(500).json({
                messege:
                    'Error geting vendors', error: err
            });
        }
        res.status(200).json(results)
    })


}



export const AddEventImages = async (req, res) => {
    try {
        // 1️⃣ Verify token
        const token = req.cookies.auth_token;
        if (!token) {
            return res.status(401).json({ message: 'Unauthorized: No token provided' });
        }

        const decoded = verifyToken(token);
        if (!decoded) {
            return res.status(401).json({ message: 'Unauthorized: Invalid token' });
        }
        
        
        // 2️⃣ Get vendor_id using a promisified helper
        const vendor_id = await promisifyFindVendorID(decoded.userId); 
        if (!vendor_id) {
            return res.status(404).json({ message: 'Vendor not found' });
        }

        console.log("✅ Vendor ID:", vendor_id);

        // 3️⃣ Validate uploaded files
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'No files uploaded' });
        }

        const imagePaths = req.files.map(file => file.path);

        // 4️⃣ Insert all images for this vendor
        const results = await Promise.all(
            imagePaths.map(url => promisifyAddEventImages(vendor_id, url))
        );

        return res.status(200).json({
            message: 'Event images added successfully',
            count: results.length,
            results
        });

    } catch (err) {
        console.error('❌ Error adding event images:', err);
        return res.status(500).json({
            message: 'Error adding event images',
            error: err.message
        });
    }
};

// 🧩 Promisify vendor lookup
const promisifyFindVendorID = (decodedUserID) => {
    return new Promise((resolve, reject) => {
        VendorModel.findVendorID(decodedUserID , (err, result) => {
            if (err) return reject(err);
            if (!result || result.length === 0) return resolve(null);
            resolve(result[0].vendor_id);
        });
    });
};

// 🧩 Promisify image insert
const promisifyAddEventImages = (vendor_id, url) => {
    return new Promise((resolve, reject) => {
        const data = { vendor_id, event_profiles_url: url };
        VendorModel.addEventImages(data, (err, result) => {
            if (err) reject(err);
            else resolve(result);
        });
    });
};


export const getvendorById = async (req, res) => {
    try {
        const token = req.cookies.auth_token;

        if (!token) {
            return res.status(401).json({ message: 'Unauthorized: No token provided' });
        }

        const decoded = verifyToken(token);
        if (!decoded) {
            return res.status(401).json({ message: 'Unauthorized: Invalid token' });
        }

        const vendor = await new Promise((resolve, reject) => {
            VendorModel.findVendor(decoded.userId, (err, result) => {
                if (err) {
                    console.error('Error fetching vendor:', err);
                    reject(err);
                } else {
                    resolve(result && result.length > 0 ? result[0] : null);
                }
            });
        });

        if (!vendor) {
            return res.status(404).json({ message: 'Vendor not found' });
        }

        return res.status(200).json({ message: 'Vendor retrieved successfully', vendor });
    } catch (err) {
        console.error('Error getting vendor:', err);
        return res.status(500).json({ error: 'Server error', details: err.message });
    }
};