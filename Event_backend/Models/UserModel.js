//require db 
import db from '../Config/DatabaseCon.js';

// User Model
class UserModel { 
    // insert user
    static async insertUser(data, callback) {
        const sql = 'INSERT INTO users (uuid, email, phone, password_hash, first_name, last_name, user_type, is_verified, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
        db.query(sql, [data.uuid, data.email, data.phone, data.password_hash, data.first_name, data.last_name, data.user_type, data.is_verified, data.is_active], callback);
    }

    static async findonebyemail(email , password , callback) {
        const sql = 'SELECT * FROM users WHERE email = ?';
        db.query(sql, [email], callback);
    }


}


export default UserModel;