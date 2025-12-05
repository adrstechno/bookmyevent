import db from "../Config/DatabaseCon.js";

class VendorModel {
  static insertVendor(vendorData, callback) {
    const sql =
      "INSERT INTO vendor_profiles (user_id, business_name, service_category_id, description, years_experience, contact, address, city, state, is_verified, is_active, profile_url, event_profiles_url) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)";

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
      vendorData.event_profiles_url,
    ];

    // ✅ Execute the query
    db.query(sql, values, callback);
  }

  static insertVendorSubcription(vendorSubscriptionData, callback) {
    const sql =
      "INSERT INTO vendor_subscriptions (vendor_id, start_date, end_date, billing_cycle, status) VALUES (?,?,?,?,?)";

    const values = [
      vendorSubscriptionData.vendor_id,
      vendorSubscriptionData.start_date,
      vendorSubscriptionData.end_date,
      vendorSubscriptionData.billing_cycle,
      vendorSubscriptionData.status,
    ];

    // ✅ Execute the query
    db.query(sql, values, callback);
  }

  static getallVendors(callback) {
    const sql = "select * from vendor_profiles ";
    db.query(sql, callback);
  }

  static getVendorByServiceId(service_category_id, callback) { 
    const sql = "select * from vendor_profiles where service_category_id = ?";
    db.query(sql, [service_category_id], callback);
  }
  
  static addEventImages(data, callback) {
    const sql = "insert into Event_images (vendor_id , imageUrl) values(?,?)";
    db.query(sql, [data.vendor_id, data.event_profiles_url], callback);
  }

  static findVendorID(decodedUserID, callback) {
    const sql = `select vendor_id from vendor_profiles where user_id = '${decodedUserID}'`;
    db.query(sql, callback);
  }

  static findVendor(decodedUserID, callback) {
    const sql = `select * from vendor_profiles where user_id = '${decodedUserID}'`;
    db.query(sql, callback);
  }

  static updateVendor(vendor_id, data, callback) {
    let sql = "update vendor_profiles set ";
    const values = [];
    const allowedFields = [
      "business_name",
      "service_category_id",
      "description",
      "years_experience",
      "contact",
      "address",
      "city",
      "state",
      "profile_url",
      "event_profiles_url",
    ];

    const fieldsToUpdate = [];

    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        fieldsToUpdate.push(`${field}  = ?`);
        values.push(data[field]);
      }
    }
    if (fieldsToUpdate.length === 0) {
      return callback(new Error("no vaild fields update."));
    }

    sql += fieldsToUpdate.join(",") + "where vendor_id = ?";
    values.push(vendor_id);
    db.query(sql, values, callback);
  }

  static insertVendorShift(shiftData, callback) {
    const sql =
      "INSERT INTO vendor_shifts (vendor_id, shift_name, start_time, end_time, days_of_week, is_active) VALUES (?,?,?,?,?,?)";

    const values = [
      shiftData.vendor_id,
      shiftData.shift_name,
      shiftData.start_time,
      shiftData.end_time,
      JSON.stringify(shiftData.days_of_week), // Convert array to JSON string
      shiftData.is_active || true,
    ];

    db.query(sql, values, callback);
  }

  static getVendorShifts(vendor_id, callback) {
    const sql =
      'SELECT * FROM vendor_shifts WHERE vendor_id = ? ORDER BY FIELD(days_of_week, "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"), start_time';
    db.query(sql, [vendor_id], callback);
  }

  static getShiftById(shift_id, callback) {
    const sql = "SELECT * FROM vendor_shifts WHERE shift_id = ?";

    db.query(sql, [shift_id], callback);
  }

  static updateVendorShift(shift_id, shiftData, callback) {
    const sql =
      "UPDATE vendor_shifts SET shift_name = ?, start_time = ?, end_time = ?, days_of_week = ?, is_active = ? WHERE shift_id = ?";

    const values = [
      shiftData.shift_name,
      shiftData.start_time,
      shiftData.end_time,
      shiftData.days_of_week,
      shiftData.is_active,
      shift_id,
    ];

    db.query(sql, values, callback);
  }

  static deleteVendorShift(shift_id, callback) {
    const sql = "DELETE FROM vendor_shifts WHERE shift_id = ?";

    db.query(sql, [shift_id], callback);
  }

  static getShiftsByDay(vendor_id, day_of_week, callback) {
    const sql =
      "SELECT * FROM vendor_shifts WHERE vendor_id = ? AND day_of_week = ? ORDER BY start_time";

    db.query(sql, [vendor_id, day_of_week], callback);
  }

  static getEventImages(vendor_id, callback) {
    const sql = "select * from Event_images where vendor_id = ?";
    db.query(sql, [vendor_id], callback);
  }

  
  static insertVendorPackage(data, callback) {
    const sql = `
            INSERT INTO vendor_packages 
            (package_uuid, vendor_id, package_name, package_desc, amount) 
            VALUES (?,?,?,?,?)
        `;

    const values = [
      data.package_uuid,
      data.vendor_id,
      data.package_name,
      data.package_desc,
      data.amount,
    ];

    db.query(sql, values, callback);
  }

  static getAllVendorPackages(vendor_id, callback) {
    const sql = `
            SELECT * FROM vendor_packages 
            WHERE removed_at IS NULL And vendor_id = ?
            ORDER BY package_id DESC
        `;

    db.query(sql, [vendor_id], callback);
  }

  static getVendorPackageById(package_id, callback) {
    const sql = `
            SELECT * FROM vendor_packages 
            WHERE package_id = ? AND removed_at IS NULL
            LIMIT 1
        `;

    db.query(sql, [package_id], callback);
  }

  static updateVendorPackage(package_id, data, callback) {
    const sql = `
            UPDATE vendor_packages SET
                package_name = ?,
                package_desc = ?,
                amount = ?
            WHERE package_id = ? AND removed_at IS NULL
        `;

    const values = [
      data.package_name,
      data.package_desc,
      data.amount,
      package_id,
    ];

    db.query(sql, values, callback);
  }

  static deleteVendorPackage(package_id, callback) {
    const sql = `
            UPDATE vendor_packages
            SET removed_at = NOW()
            WHERE package_id = ?
        `;

    db.query(sql, [package_id], callback);
  }

static findVendorsByDay(day, callback) {
  const sql = `
    SELECT DISTINCT vendor_id
    FROM vendor_shifts
    WHERE JSON_CONTAINS(days_of_week, ?, "$")
  `;
  db.query(sql, [`"${day}"`], callback);
}

static getVendorsByIds(ids, callback) {
  if (ids.length === 0) return callback(null, []);

  const sql = `
    SELECT vendor_id, business_name, city, state, profile_url, service_category_id
    FROM vendor_profiles
    WHERE vendor_id IN (?)
  `;
  db.query(sql, [ids], callback);
}

static findVendorsByDayAndService(day, service_category_id, callback) {
  const sql = `
    SELECT DISTINCT vs.vendor_id
    FROM vendor_shifts vs
    JOIN vendor_profiles vp ON vs.vendor_id = vp.vendor_id
    WHERE JSON_CONTAINS(vs.days_of_week, ?, "$")
      AND vp.service_category_id = ?
  `;

  db.query(sql, [`"${day}"`, service_category_id], callback);
}

}



export default VendorModel;
