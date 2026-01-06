import db from "../Config/DatabaseCon.js";

class UserModel {
  static insertUser(data, callback) {
    const sql = `
      INSERT INTO users 
      (uuid, email, phone, password_hash, first_name, last_name, user_type, is_verified, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    db.query(sql, [
      data.uuid,
      data.email,
      data.phone,
      data.password_hash,
      data.first_name,
      data.last_name,
      data.user_type,
      data.is_verified,
      data.is_active,
    ], callback);
  }

  static findByEmailOrPhone(email, phone, callback) {
    db.query(
      "SELECT * FROM users WHERE email = ? OR phone = ?",
      [email, phone],
      callback
    );
  }

  static findonebyemail(email, callback) {
    db.query("SELECT * FROM users WHERE email = ?", [email], callback);
  }

  static updatepassword(email, hashed, callback) {
    db.query(
      "UPDATE users SET password_hash = ? WHERE email = ?",
      [hashed, email],
      callback
    );
  }
}

export default UserModel;
