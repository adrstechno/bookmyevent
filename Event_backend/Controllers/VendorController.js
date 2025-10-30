import VendorModel from '../Models/VendorModel.js';

export const insertVendor = (req, res) => {
    const vendorData = req.body;


    const token = req.cookies.token;
          if (!token) {
          return res.status(401).json({ message: 'Unauthorized: No token provided' });
          }

         //verify token here (omitted for brevity)
        

    const profileUrl = req.file.path;
    vendorData.profile_url = profileUrl;
    vendorData.is_verified = 0;
    vendorData.is_active = 1;

    VendorModel.insertVendor(vendorData, (err, result) => {
          
          
        if (err) {
            return res.status(500).json({ message: 'Error inserting vendor', error: err });
        }
        //add data in subscription table
          const vendorSubscriptionData = {
                    start_date: new Date(),
                    end_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)), // 1 year subscription
                    billing_cycle: 'annual',
                    status: 'active'
          };
          
          VendorModel.insertVendorSubcription(vendorSubscriptionData, (err, subResult) => {
                    if (err) {
                              return res.status(500).json({ message: 'Error inserting vendor subscription', error: err });
                    }
                    return res.status(200).json({ message: 'Vendor inserted successfully', vendorId: result.insertId, subscriptionId: subResult.insertId });
          });


      
    });








    
}