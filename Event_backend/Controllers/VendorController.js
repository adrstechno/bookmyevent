import VendorModel from '../Models/VendorModel.js';
import { verifyToken } from '../Utils/Verification.js';


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