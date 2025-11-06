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
        db.query(sql, values, callback);
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
        db.query(sql, values, callback);
    }

    static getallVendors(callback) {
        const sql = "select * from vendor_profiles ";
        db.query(sql, callback)

    }

    static addEventImages(data, callback) {
        const sql = "insert into Event_images (vendor_id , imageUrl) values(?,?)";
        db.query(sql, [data.vendor_id, data.event_profiles_url], callback)
    }

    static findVendorID(decodedUserID, callback) {
        const sql = `select vendor_id from vendor_profiles where user_id = '${decodedUserID}'`;
        db.query(sql, callback)  }

      static findVendor(decodedUserID, callback) {
        const sql = `select * from vendor_profiles where user_id = '${decodedUserID}'`;
        db.query(sql, callback)  }



}

export default VendorModel;