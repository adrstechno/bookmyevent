import db from "../Config/DatabaseCon.js";

// Service Model
class ServiceModel {
  // insert service
  static async insertService(data, callback) {
    const sql =
      "INSERT INTO service_categories (category_name, description, icon_url, is_active) VALUES (?, ?, ?, ?)";
    db.query(
      sql,
      [data.category_name, data.description, data.icon_url, data.is_active],
      callback
    );
  }

  static async getAllServices(callback) {
    const sql = "SELECT * FROM service_categories";
    db.query(sql, callback);
  }
  static getVendorByServiceId(service_category_id, callback) {
    const sql = "select * from vendor_profiles where service_category_id = ?";
    db.query(sql, [service_category_id], callback);
  }
}
export default ServiceModel;
