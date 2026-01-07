// User Controller  
import UserModel from '../Models/UserModel.js';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { verifyToken, generateToken } from '../Utils/Verification.js';



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

    console.log('Login attempt:', { email, password: password ? '***' : 'missing' });

    // Validate inputs
    if (!email || !password) {
        console.log('Missing email or password');
        return res.status(400).json({ error: 'Email and password are required ' });
    }

    UserModel.findonebyemail(email, (err, results) => {
        if (err) {
            console.error('Database error fetching user:', err);
            return res.status(500).json({ error: 'Database query error' });
        }

        console.log('Database query results:', results ? results.length : 'null', 'users found');

        if (!results || results.length === 0) {
            console.log('User not found for email:', email);
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const user = results[0];
        console.log('User found:', { 
            uuid: user.uuid, 
            email: user.email, 
            user_type: user.user_type,
            has_password_hash: !!user.password_hash 
        });

        // Compare password with hash
        const passwordMatch = bcrypt.compareSync(password, user.password_hash);
        console.log('Password match:', passwordMatch);
        
        if (!passwordMatch) {
            console.log('Password mismatch for user:', email);
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Generate token
        const token = generateToken(user.uuid);
        console.log('Token generated successfully');

        // Set cookie with cross-origin friendly settings
        const isProd = process.env.RENDER || process.env.NODE_ENV === "production";

        res.cookie("auth_token", token, {
            httpOnly: true,
            secure: isProd,
            sameSite: isProd ? "none" : "lax",
            maxAge: 3600000
        });

        console.log('Login successful for user:', email);

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




