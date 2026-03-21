import db from "../Config/DatabaseCon.js";

/**
 * SubserviceModel - Handles subservices with category_ids JSON array
 * Uses subservices_master table with category_ids column
 */
class SubserviceModel {
  
  /**
   * Create or reuse a subservice in subservices_master
   * @param {Object} subserviceData - { subservice_name, description, icon_url, is_active, category_ids }
   * @param {Function} callback
   */
  static createOrGetSubservice(subserviceData, callback) {
    // First, check if subservice already exists
    const checkSql = "SELECT id, category_ids FROM subservices_master WHERE subservice_name = ?";
    
    db.query(checkSql, [subserviceData.subservice_name], (err, results) => {
      if (err) {
        return callback(err, null);
      }
      
      // If exists, update category_ids by merging with existing
      if (results && results.length > 0) {
        const existingId = results[0].id;
        const existingCategoryIds = JSON.parse(results[0].category_ids || '[]');
        const newCategoryIds = subserviceData.category_ids || [];
        
        // Merge and deduplicate category IDs
        const mergedCategoryIds = [...new Set([...existingCategoryIds, ...newCategoryIds])];
        
        const updateSql = `
          UPDATE subservices_master 
          SET category_ids = ?,
              description = ?,
              icon_url = ?,
              is_active = ?
          WHERE id = ?
        `;
        
        db.query(
          updateSql,
          [
            JSON.stringify(mergedCategoryIds),
            subserviceData.description || null,
            subserviceData.icon_url || null,
            subserviceData.is_active !== undefined ? subserviceData.is_active : 1,
            existingId
          ],
          (updateErr) => {
            if (updateErr) {
              return callback(updateErr, null);
            }
            
            callback(null, { 
              id: existingId, 
              isNew: false,
              message: 'Subservice already exists, category IDs updated',
              category_ids: mergedCategoryIds
            });
          }
        );
        return;
      }
      
      // If doesn't exist, create new
      const insertSql = `
        INSERT INTO subservices_master 
        (subservice_name, description, icon_url, is_active, category_ids)
        VALUES (?, ?, ?, ?, ?)
      `;
      
      const categoryIdsJson = JSON.stringify(subserviceData.category_ids || []);
      
      const values = [
        subserviceData.subservice_name,
        subserviceData.description || null,
        subserviceData.icon_url || null,
        subserviceData.is_active !== undefined ? subserviceData.is_active : 1,
        categoryIdsJson
      ];
      
      db.query(insertSql, values, (insertErr, insertResult) => {
        if (insertErr) {
          return callback(insertErr, null);
        }
        
        callback(null, {
          id: insertResult.insertId,
          isNew: true,
          message: 'New subservice created successfully',
          category_ids: subserviceData.category_ids || []
        });
      });
    });
  }
  
  /**
   * Get all subservices for a specific service category
   * Uses MEMBER OF operator to find subservices that include the category_id
   * @param {Number} service_category_id
   * @param {Function} callback
   */
  static getSubservicesByCategory(service_category_id, callback) {
    // Convert to number to match JSON array type
    const categoryIdNumber = parseInt(service_category_id, 10);
    
    const sql = `
      SELECT 
        id as subservice_id,
        subservice_name,
        description,
        icon_url,
        is_active,
        category_ids,
        created_at,
        updated_at
      FROM subservices_master
      WHERE ? MEMBER OF(category_ids)
      AND is_active = 1
      ORDER BY subservice_name ASC
    `;
    
    db.query(sql, [categoryIdNumber], callback);
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
        category_ids,
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
        category_ids,
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
    const allowedFields = ['subservice_name', 'description', 'icon_url', 'is_active', 'category_ids'];
    const updates = [];
    const values = [];
    
    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        updates.push(`${field} = ?`);
        // Convert category_ids array to JSON string
        if (field === 'category_ids' && Array.isArray(updateData[field])) {
          values.push(JSON.stringify(updateData[field]));
        } else {
          values.push(updateData[field]);
        }
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
   * Add category ID to subservice's category_ids array
   * @param {Number} subservice_id
   * @param {Number} category_id
   * @param {Function} callback
   */
  static addCategoryToSubservice(subservice_id, category_id, callback) {
    // First get current category_ids
    const getSql = "SELECT category_ids FROM subservices_master WHERE id = ?";
    
    db.query(getSql, [subservice_id], (err, results) => {
      if (err) return callback(err, null);
      if (!results || results.length === 0) {
        return callback(new Error('Subservice not found'), null);
      }
      
      const currentIds = JSON.parse(results[0].category_ids || '[]');
      
      // Add new category_id if not already present
      if (!currentIds.includes(category_id)) {
        currentIds.push(category_id);
        
        const updateSql = "UPDATE subservices_master SET category_ids = ? WHERE id = ?";
        db.query(updateSql, [JSON.stringify(currentIds), subservice_id], callback);
      } else {
        callback(null, { message: 'Category already exists in subservice' });
      }
    });
  }
  
  /**
   * Remove category ID from subservice's category_ids array
   * @param {Number} subservice_id
   * @param {Number} category_id
   * @param {Function} callback
   */
  static removeCategoryFromSubservice(subservice_id, category_id, callback) {
    // First get current category_ids
    const getSql = "SELECT category_ids FROM subservices_master WHERE id = ?";
    
    db.query(getSql, [subservice_id], (err, results) => {
      if (err) return callback(err, null);
      if (!results || results.length === 0) {
        return callback(new Error('Subservice not found'), null);
      }
      
      const currentIds = JSON.parse(results[0].category_ids || '[]');
      
      // Remove category_id
      const updatedIds = currentIds.filter(id => id !== category_id);
      
      const updateSql = "UPDATE subservices_master SET category_ids = ? WHERE id = ?";
      db.query(updateSql, [JSON.stringify(updatedIds), subservice_id], callback);
    });
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
        icon_url,
        category_ids
      FROM subservices_master
      WHERE subservice_name LIKE ? 
      AND is_active = 1
      ORDER BY subservice_name ASC
      LIMIT 20
    `;
    
    db.query(sql, [`%${searchTerm}%`], callback);
  }
  
  /**
   * Get all categories that a subservice belongs to
   * @param {Number} subservice_id
   * @param {Function} callback
   */
  static getCategoriesBySubservice(subservice_id, callback) {
    const sql = `
      SELECT 
        sm.category_ids,
        sm.subservice_name
      FROM subservices_master sm
      WHERE sm.id = ?
    `;
    
    db.query(sql, [subservice_id], (err, results) => {
      if (err) return callback(err, null);
      if (!results || results.length === 0) {
        return callback(new Error('Subservice not found'), null);
      }
      
      // mysql2 returns JSON as JavaScript objects/arrays automatically
      const categoryIds = Array.isArray(results[0].category_ids) 
        ? results[0].category_ids 
        : [];
      
      if (categoryIds.length === 0) {
        return callback(null, []);
      }
      
      // Get category details
      const getCategoriesSql = `
        SELECT 
          category_id,
          category_name,
          description,
          icon_url
        FROM service_categories
        WHERE category_id IN (?)
        ORDER BY category_name ASC
      `;
      
      db.query(getCategoriesSql, [categoryIds], callback);
    });
  }
}

export default SubserviceModel;
