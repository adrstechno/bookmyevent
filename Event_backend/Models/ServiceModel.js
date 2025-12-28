import db from "../Config/DatabaseCon.js";

// Service Model
class ServiceModel {
  // insert service
  static insertService(data, callback) {
    const sql =
      "INSERT INTO service_categories (category_name, description, icon_url, is_active) VALUES (?, ?, ?, ?)";
    db.query(
      sql,
      [data.category_name, data.description, data.icon_url, data.is_active],
      callback
    );
  }

  static getAllServices(callback) {
    const sql = "SELECT * FROM service_categories";
    db.query(sql, callback);
  }

  // Get service by ID
  static getServiceById(id, callback) {
    const sql = "SELECT * FROM service_categories WHERE category_id = ?";
    db.query(sql, [id], callback);
  }

  // Update service
  static updateService(id, data, callback) {
    let sql, params;

    if (data.icon_url) {
      // Update with new icon
      sql = "UPDATE service_categories SET category_name = ?, description = ?, icon_url = ?, is_active = ? WHERE category_id = ?";
      params = [data.category_name, data.description, data.icon_url, data.is_active, id];
    } else {
      // Update without changing icon
      sql = "UPDATE service_categories SET category_name = ?, description = ?, is_active = ? WHERE category_id = ?";
      params = [data.category_name, data.description, data.is_active, id];
    }

    db.query(sql, params, callback);
  }

  // Delete service
  static deleteService(id, callback) {
    const sql = "DELETE FROM service_categories WHERE category_id = ?";
    db.query(sql, [id], callback);
  }

  static getVendorByServiceId(service_category_id, callback) {
    const sql = "select * from vendor_profiles where service_category_id = ?";
    db.query(sql, [service_category_id], callback);
  }
}

export default ServiceModel;
