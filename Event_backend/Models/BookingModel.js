import db from "../Config/DatabaseCon.js";

// Booking model
class BookingModel {
  static insertBooking(data, callback) {
    const sql = `
        INSERT INTO event_booking 
        (booking_uuid, user_id, vendor_id, shift_id, package_id, event_address, event_date, event_time, special_requirement, status, admin_approval) 
        VALUES (
            '${data.booking_uuid}',
            '${data.user_id}',
            ${data.vendor_id},
            ${data.shift_id},
            ${data.package_id},
            '${data.event_address}',
            '${data.event_date}',
            '${data.event_time}',
            '${data.special_requirement}',
            '${data.status}',
            '${data.admin_approval}'
        )
    `;
    db.query(sql, callback);
  }

  static updateBooking(booking_id, data, callback) {
    const sql = `
        UPDATE event_booking SET
            event_address = '${data.event_address}',
            event_date = '${data.event_date}',
            event_time = '${data.event_time}',
            special_requirement = '${data.special_requirement}',
            status = '${data.status}',
            admin_approval = '${data.admin_approval}'
        WHERE booking_id = ${booking_id}
    `;
    db.query(sql, callback);
  }

  static deleteBooking(booking_id, callback) {
    const sql = `DELETE FROM event_booking WHERE booking_id = ${booking_id}`;
    db.query(sql, callback);
  }

  static getAllByVendorId(vendor_id, callback) {
    const sql = `SELECT 
    eb.booking_id,eb.booking_uuid,eb.event_address,eb.event_date,eb.event_time,eb.special_requirement,eb.status,eb.admin_approval,eb.created_at,eb.updated_at,eb.removed_at, u.first_name,u.last_name, u.email, u.phone, vp.business_name,vp.contact AS vendor_contact, vp.profile_url, vs.shift_name,vs.start_time,vs.end_time, vpk.package_name, vpk.amount FROM event_booking eb
LEFT JOIN users u 
    ON eb.user_id = u.uuid

LEFT JOIN vendor_profiles vp 
    ON eb.vendor_id = vp.vendor_id

LEFT JOIN vendor_shifts vs 
    ON eb.shift_id = vs.shift_id

LEFT JOIN vendor_packages vpk 
    ON eb.package_id = vpk.package_id

WHERE eb.vendor_id = ${vendor_id}
ORDER BY eb.booking_id DESC`;
    db.query(sql, callback);
  }
  static getBookingById(booking_id, callback) {
    const sql = `SELECT 
    eb.booking_id,eb.booking_uuid,eb.event_address,eb.event_date,eb.event_time,eb.special_requirement,eb.status,eb.admin_approval,eb.created_at,eb.updated_at,eb.removed_at, u.first_name,u.last_name, u.email, u.phone, vp.business_name,vp.contact AS vendor_contact, vp.profile_url, vs.shift_name,vs.start_time,vs.end_time, vpk.package_name, vpk.amount FROM event_booking eb
LEFT JOIN users u 
    ON eb.user_id = u.uuid

LEFT JOIN vendor_profiles vp 
    ON eb.vendor_id = vp.vendor_id

LEFT JOIN vendor_shifts vs 
    ON eb.shift_id = vs.shift_id

LEFT JOIN vendor_packages vpk 
    ON eb.package_id = vpk.package_id

WHERE eb.booking_id = ${booking_id}
ORDER BY eb.booking_id DESC`;
    db.query(sql, callback);
  }

  static getBookingsByUserId(user_id, callback) {
    const sql = `SELECT 
    eb.booking_id,eb.booking_uuid,eb.event_address,eb.event_date,eb.event_time,eb.special_requirement,eb.status,eb.admin_approval,eb.created_at,eb.updated_at,eb.removed_at, u.first_name,u.last_name, u.email, u.phone, vp.business_name,vp.contact AS vendor_contact, vp.profile_url, vs.shift_name,vs.start_time,vs.end_time, vpk.package_name, vpk.amount FROM event_booking eb
LEFT JOIN users u 
    ON eb.user_id = u.uuid

LEFT JOIN vendor_profiles vp 
    ON eb.vendor_id = vp.vendor_id

LEFT JOIN vendor_shifts vs 
    ON eb.shift_id = vs.shift_id

LEFT JOIN vendor_packages vpk 
    ON eb.package_id = vpk.package_id

WHERE eb.user_id = '${user_id}'
ORDER BY eb.booking_id DESC;
`;
    db.query(sql, callback);
  }
}
export default BookingModel;
