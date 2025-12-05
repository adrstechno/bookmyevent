import db from "../Config/DatabaseCon.js";

class AdminModel {
    static getAllUsers(callback) {
        const sql = `
        SELECT user_id, uuid, email, phone, first_name, last_name, user_type, is_verified, is_active, created_at
        FROM users
        ORDER BY created_at DESC
        `;
        db.query(sql, callback);
    }

    static getAllVendors(callback) {
        const sql = `
        SELECT 
        vp.vendor_id,
        vp.business_name,
        vp.service_category_id,
        vp.description,
        vp.years_experience,
        vp.contact,
        vp.address,
        vp.city,
        vp.state,
        vp.is_verified,
        vp.is_active,
        vp.profile_url,
        vp.event_profiles_url,
        u.email,
        u.phone,
        u.first_name,
        u.last_name,
        u.created_at
      FROM vendor_profiles vp
      JOIN users u ON vp.user_id = u.id
      ORDER BY vp.vendor_id DESC
        `;

        db.query(sql, callback);
    }
}

export default AdminModel;