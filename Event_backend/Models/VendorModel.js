import db from '../Config/DatabaseCon.js';

class VendorModel {
          static insertVendor(vendorData , callback) {
                    const sql = 'INSERT INTO vendor_profiles (business_name , service_category_id , description , years_experience , contact , address , city , state , is_verified , is_active , profile_url , event_profiles_url ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)';
                    const values = [
                              vendorData.business_name,vendorData.service_category_id,vendorData.description,vendorData.years_experience,vendorData.contact,vendorData.address, vendorData.city, vendorData.state,vendorData.is_verified, vendorData.is_active, vendorData.profile_url, vendorData.event_profiles_url
                    ]
}

   
static insertVendorSubcription(vendorSubscriptionData, callback) {
          const sql = 'INSERT INTO vendor_subscriptions (start_date, end_date, billing_cycle, status) VALUES (?,?,?,?)';
          const values = [
                    vendorSubscriptionData.start_date,
                    vendorSubscriptionData.end_date,
                    vendorSubscriptionData.billing_cycle,
                    vendorSubscriptionData.status,
                    
          ];

}

}

export default VendorModel;
