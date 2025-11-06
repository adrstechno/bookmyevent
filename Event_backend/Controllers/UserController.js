// User Controller  
import UserModel from '../Models/UserModel.js';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { verifyToken , generateToken } from '../Utils/Verification.js';



export const insertUser = (req, res) => {

    const userData = req.body;
   //gen unique uuid for user 
          userData.uuid = uuidv4();
          //hash password
          const saltRounds = 10;
          const plainPassword = userData.password;
          const hashedPassword = bcrypt.hashSync(plainPassword, saltRounds);
          userData.password_hash = hashedPassword;
          //set default values
          userData.is_verified = false;
          userData.is_active = true;

    UserModel.insertUser(userData, (err, results) => {
        if (err) {
            console.error('Error inserting user:', err);
            return res.status(500).json({ error: 'Database insertion error' });
        }
        res.status(201).json({ message: 'User inserted successfully', userId: results.insertId });
    });
};

export const login = (req, res) => {
    const { email, password } = req.body;

    // Validate inputs
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    UserModel.findonebyemail(email, (err, results) => {
        if (err) {
            console.error('Error fetching user:', err);
            return res.status(500).json({ error: 'Database query error' });
        }

        if (!results || results.length === 0) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const user = results[0];

        // Compare password with hash
        const passwordMatch = bcrypt.compareSync(password, user.password_hash);
        if (!passwordMatch) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Generate token
        const token = generateToken(user.uuid);

        // Set cookie
        res.cookie('auth_token', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: 3600000 // 1 hour
        });

        // Send response
        return res.status(200).json({
            message: 'Login successful',
            token: token,
            role: user.user_type,
            user_id: user.uuid
        });
    });
}; 
export const logout = (req, res) => {
    res.clearCookie('auth_token');
    res.status(200).json({ message: 'Logout successful' });
}
export const ChangePassword = async (req, res) => {
    try {
        const { email, oldPassword, newPassword } = req.body;
        const token = req.cookies.auth_token;

        // Validate inputs
        if (!email || !oldPassword || !newPassword) {
            return res.status(400).json({ error: 'Email, old password, and new password are required' });
        }

        if (!token) {
            return res.status(401).json({ error: 'Access denied. No token provided.' });
        }

        const decoded = verifyToken(token);
        if (!decoded) {
            return res.status(401).json({ error: 'Invalid or expired token.' });
        }

        // Get user by email using Promise
        const user = await new Promise((resolve, reject) => {
            UserModel.findonebyemail(email, (err, result) => {
                if (err) {
                    console.error('Error fetching user:', err);
                    reject(err);
                } else {
                    resolve(result && result.length > 0 ? result[0] : null);
                }
            });
        });

        if (!user || !user.password_hash) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Compare old password
        const passwordMatch = bcrypt.compareSync(oldPassword, user.password_hash);
        if (!passwordMatch) {
            return res.status(401).json({ error: 'Invalid password' });
        }

        // Hash and update password
        const hashedPassword = bcrypt.hashSync(newPassword, 10);
        
        await new Promise((resolve, reject) => {
            UserModel.updatepassword(email, hashedPassword, (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });

        return res.status(200).json({ message: 'Password changed successfully' });
    } catch (err) {
        console.error('Error changing password:', err);
        return res.status(500).json({ error: 'Server error', details: err.message });
    }
};




