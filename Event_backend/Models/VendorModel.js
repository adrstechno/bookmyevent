import db from '../Config/DatabaseCon.js';

class VendorModel {
    static insertVendor(vendorData, callback) {
        const sql = 'INSERT INTO vendor_profiles (user_id, business_name, service_category_id, description, years_experience, contact, address, city, state, is_verified, is_active, profile_url, event_profiles_url) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)';
        
        const values = [
            vendorData.user_id,
            vendorData.business_name,
            vendorData.service_category_id,
            vendorData.description,
            vendorData.years_experience,
            vendorData.contact,
            vendorData.address,
            vendorData.city,
            vendorData.state,
            vendorData.is_verified,
            vendorData.is_active,
            vendorData.profile_url,
            vendorData.event_profiles_url
        ];

        // ✅ Execute the query
        db.query(sql, values, (err, result) => {
            if (err) {
                console.error('❌ Insert Vendor Error:', err);
                return callback(err);
            }
            console.log('✅ Vendor inserted:', result.insertId);
            callback(null, result);
        });
    }

    static insertVendorSubcription(vendorSubscriptionData, callback) {
        const sql = 'INSERT INTO vendor_subscriptions (vendor_id, start_date, end_date, billing_cycle, status) VALUES (?,?,?,?,?)';
        
        const values = [
            vendorSubscriptionData.vendor_id,
            vendorSubscriptionData.start_date,
            vendorSubscriptionData.end_date,
            vendorSubscriptionData.billing_cycle,
            vendorSubscriptionData.status
        ];

        // ✅ Execute the query
        db.query(sql, values, (err, result) => {
            if (err) {
                console.error('❌ Insert Subscription Error:', err);
                return callback(err);
            }
            console.log('✅ Subscription inserted:', result.insertId);
            callback(null, result);
        });
    }
}

export default VendorModel;