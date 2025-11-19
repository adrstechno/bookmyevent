import db from '../Config/DatabaseCon.js';

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
    const sql = `SELECT * FROM event_booking WHERE vendor_id = ${vendor_id}`;
    db.query(sql, callback);
}
static getBookingById(booking_id, callback) {
    const sql = `SELECT * FROM event_booking WHERE booking_id = ${booking_id}`;
    db.query(sql, callback);
}

static getBookingsByUserId(user_id, callback) {
    const sql = `SELECT * FROM event_booking WHERE user_id = "${user_id}"`;
    db.query(sql, callback);
}


}
export default  BookingModel;
