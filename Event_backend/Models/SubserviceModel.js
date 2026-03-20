import db from "../Config/DatabaseCon.js";

/**
 * SubserviceModel - Handles normalized subservices structure
 * Uses subservices_master and service_subservice_map tables
 */
class SubserviceModel {
  
  /**
   * Create or reuse a subservice in subservices_master
   * @param {Object} subserviceData - { subservice_name, description, icon_url, is_active }
   * @param {Function} callback
   */
  static createOrGetSubservice(subserviceData, callback) {
    // First, check if subservice already exists
    const checkSql = "SELECT id FROM subservices_master WHERE subservice_name = ?";
    
    db.query(checkSql, [subserviceData.subservice_name], (err, results) => {
      if (err) {
        return callback(err, null);
      }
      
      // If exists, return existing ID
      if (results && results.length > 0) {
        return callback(null, { 
          id: results[0].id, 
          isNew: false,
          message: 'Subservice already exists, reusing existing ID'
        });
      }
      
      // If doesn't exist, create new
      const insertSql = `
        INSERT INTO subservices_master 
        (subservice_name, description, icon_url, is_active)
        VALUES (?, ?, ?, ?)
      `;
      
      const values = [
        subserviceData.subservice_name,
        subserviceData.description || null,
        subserviceData.icon_url || null,
        subserviceData.is_active !== undefined ? subserviceData.is_active : 1
      ];
      
      db.query(insertSql, values, (insertErr, insertResult) => {
        if (insertErr) {
          return callback(insertErr, null);
        }
        
        callback(null, {
          id: insertResult.insertId,
          isNew: true,
          message: 'New subservice created successfully'
        });
      });
    });
  }
  
  /**
   * Create mapping between service category and subservice
   * @param {Number} service_category_id
   * @param {Number} subservice_id
   * @param {Function} callback
   */
  static createServiceSubserviceMapping(service_category_id, subservice_id, callback) {
    const sql = `
      INSERT INTO service_subservice_map 
      (service_category_id, subservice_id)
      VALUES (?, ?)
      ON DUPLICATE KEY UPDATE service_category_id = service_category_id
    `;
    
    db.query(sql, [service_category_id, subservice_id], callback);
  }
  
  /**
   * Get all subservices for a specific service category
   * @param {Number} service_category_id
   * @param {Function} callback
   */
  static getSubservicesByCategory(service_category_id, callback) {
    const sql = `
      SELECT 
        sm.id as subservice_id,
        sm.subservice_name,
        sm.description,
        sm.icon_url,
        sm.is_active,
        sm.created_at,
        sm.updated_at,
        ssm.service_category_id
      FROM service_subservice_map ssm
      INNER JOIN subservices_master sm ON ssm.subservice_id = sm.id
      WHERE ssm.service_category_id = ?
      AND sm.is_active = 1
      ORDER BY sm.subservice_name ASC
    `;
    
    db.query(sql, [service_category_id], callback);
  }
  
  /**
   * Get all unique subservices (from master table)
   * @param {Function} callback
   */
  static getAllSubservices(callback) {
    const sql = `
      SELECT 
        id as subservice_id,
        subservice_name,
        description,
        icon_url,
        is_active,
        created_at,
        updated_at
      FROM subservices_master
      WHERE is_active = 1
      ORDER BY subservice_name ASC
    `;
    
    db.query(sql, callback);
  }
  
  /**
   * Get subservice by ID
   * @param {Number} subservice_id
   * @param {Function} callback
   */
  static getSubserviceById(subservice_id, callback) {
    const sql = `
      SELECT 
        id as subservice_id,
        subservice_name,
        description,
        icon_url,
        is_active,
        created_at,
        updated_at
      FROM subservices_master
      WHERE id = ?
    `;
    
    db.query(sql, [subservice_id], callback);
  }
  
  /**
   * Update subservice in master table
   * @param {Number} subservice_id
   * @param {Object} updateData
   * @param {Function} callback
   */
  static updateSubservice(subservice_id, updateData, callback) {
    const allowedFields = ['subservice_name', 'description', 'icon_url', 'is_active'];
    const updates = [];
    const values = [];
    
    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        updates.push(`${field} = ?`);
        values.push(updateData[field]);
      }
    }
    
    if (updates.length === 0) {
      return callback(new Error('No valid fields to update'), null);
    }
    
    values.push(subservice_id);
    
    const sql = `UPDATE subservices_master SET ${updates.join(', ')} WHERE id = ?`;
    
    db.query(sql, values, callback);
  }
  
  /**
   * Delete mapping (soft delete - removes from mapping table)
   * @param {Number} service_category_id
   * @param {Number} subservice_id
   * @param {Function} callback
   */
  static deleteServiceSubserviceMapping(service_category_id, subservice_id, callback) {
    const sql = `
      DELETE FROM service_subservice_map 
      WHERE service_category_id = ? AND subservice_id = ?
    `;
    
    db.query(sql, [service_category_id, subservice_id], callback);
  }
  
  /**
   * Get all service categories mapped to a subservice
   * @param {Number} subservice_id
   * @param {Function} callback
   */
  static getCategoriesBySubservice(subservice_id, callback) {
    const sql = `
      SELECT 
        sc.category_id,
        sc.category_name,
        sc.description,
        sc.icon_url
      FROM service_subservice_map ssm
      INNER JOIN service_categories sc ON ssm.service_category_id = sc.category_id
      WHERE ssm.subservice_id = ?
      ORDER BY sc.category_name ASC
    `;
    
    db.query(sql, [subservice_id], callback);
  }
  
  /**
   * Search subservices by name (for autocomplete/search)
   * @param {String} searchTerm
   * @param {Function} callback
   */
  static searchSubservices(searchTerm, callback) {
    const sql = `
      SELECT 
        id as subservice_id,
        subservice_name,
        description,
        icon_url
      FROM subservices_master
      WHERE subservice_name LIKE ? 
      AND is_active = 1
      ORDER BY subservice_name ASC
      LIMIT 20
    `;
    
    db.query(sql, [`%${searchTerm}%`], callback);
  }
}

export default SubserviceModel;
