// // // User Controller
// import UserModel from '../Models/UserModel.js';
// import bcrypt from 'bcrypt';
// import { v4 as uuidv4 } from 'uuid';
// import { verifyToken, generateToken } from '../Utils/Verification.js';

// export const insertUser = (req, res) => {

//     const userData = req.body;
//     //gen unique uuid for user
//     userData.uuid = uuidv4();
//     //hash password
//     const saltRounds = 10;
//     const plainPassword = userData.password;
//     const hashedPassword = bcrypt.hashSync(plainPassword, saltRounds);
//     userData.password_hash = hashedPassword;
//     //set default values
//     userData.is_verified = false;
//     userData.is_active = true;

//     UserModel.insertUser(userData, (err, results) => {
//         if (err) {
//             console.error('Error inserting user:', err);
//             return res.status(500).json({ error: 'Database insertion error' });
//         }
//         res.status(201).json({ message: 'User inserted successfully', userId: results.insertId });
//     });
// };

// export const login = (req, res) => {
//     const { email, password } = req.body;

//     console.log('Login attempt:', { email, password: password ? '***' : 'missing' });

//     // Validate inputs
//     if (!email || !password) {
//         console.log('Missing email or password');
//         return res.status(400).json({ error: 'Email and password are required ' });
//     }

//     UserModel.findonebyemail(email, (err, results) => {
//         if (err) {
//             console.error('Database error fetching user:', err);
//             return res.status(500).json({ error: 'Database query error' });
//         }

//         console.log('Database query results:', results ? results.length : 'null', 'users found');

//         if (!results || results.length === 0) {
//             console.log('User not found for email:', email);
//             return res.status(401).json({ error: 'Invalid email or password' });
//         }

//         const user = results[0];
//         console.log('User found:', {
//             uuid: user.uuid,
//             email: user.email,
//             user_type: user.user_type,
//             has_password_hash: !!user.password_hash
//         });

//         // Compare password with hash
//         const passwordMatch = bcrypt.compareSync(password, user.password_hash);
//         console.log('Password match:', passwordMatch);

//         if (!passwordMatch) {
//             console.log('Password mismatch for user:', email);
//             return res.status(401).json({ error: 'Invalid email or password' });
//         }

//         // Generate token
//         const token = generateToken(user.uuid);
//         console.log('Token generated successfully');

//         // Set cookie with cross-origin friendly settings
//         const isProd = process.env.RENDER || process.env.NODE_ENV === "production";

//         res.cookie("auth_token", token, {
//             httpOnly: true,
//             secure: isProd,
//             sameSite: isProd ? "none" : "lax",
//             maxAge: 3600000
//         });

//         console.log('Login successful for user:', email);

//         // Send response
//         return res.status(200).json({
//             message: 'Login successful',
//             token: token,
//             role: user.user_type,
//             user_id: user.uuid
//         });
//     });
// };
// export const logout = (req, res) => {
//     res.clearCookie('auth_token');
//     res.status(200).json({ message: 'Logout successful' });
// }
// export const ChangePassword = async (req, res) => {
//     try {
//         const { email, oldPassword, newPassword } = req.body;
//         const token = req.cookies.auth_token;

//         // Validate inputs
//         if (!email || !oldPassword || !newPassword) {
//             return res.status(400).json({ error: 'Email, old password, and new password are required' });
//         }

//         if (!token) {
//             return res.status(401).json({ error: 'Access denied. No token provided.' });
//         }

//         const decoded = verifyToken(token);
//         if (!decoded) {
//             return res.status(401).json({ error: 'Invalid or expired token.' });
//         }

//         // Get user by email using Promise
//         const user = await new Promise((resolve, reject) => {
//             UserModel.findonebyemail(email, (err, result) => {
//                 if (err) {
//                     console.error('Error fetching user:', err);
//                     reject(err);
//                 } else {
//                     resolve(result && result.length > 0 ? result[0] : null);
//                 }
//             });
//         });

//         if (!user || !user.password_hash) {
//             return res.status(404).json({ error: 'User not found' });
//         }

//         // Compare old password
//         const passwordMatch = bcrypt.compareSync(oldPassword, user.password_hash);
//         if (!passwordMatch) {
//             return res.status(401).json({ error: 'Invalid password' });
//         }

//         // Hash and update password
//         const hashedPassword = bcrypt.hashSync(newPassword, 10);

//         await new Promise((resolve, reject) => {
//             UserModel.updatepassword(email, hashedPassword, (err, result) => {
//                 if (err) reject(err);
//                 else resolve(result);
//             });
//         });

//         return res.status(200).json({ message: 'Password changed successfully' });
//     } catch (err) {
//         console.error('Error changing password:', err);
//         return res.status(500).json({ error: 'Server error', details: err.message });
//     }
// };

// // User Controller
// UserController.js
// UserController.js
import UserModel from "../Models/UserModel.js";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import { verifyToken, generateToken } from "../Utils/Verification.js";
import { sendRegistrationEmail } from "../Services/emailService.js";

/* ------------------ REGISTER USER ------------------ */
export const insertUser = async (req, res) => {
  const userData = req.body;

  // 1️⃣ Validate required fields
  if (!userData.first_name || !userData.email || !userData.phone || !userData.password) {
    return res.status(400).json({ message: "Please fill all required fields" });
  }

  try {
    // 2️⃣ Check if email already exists
    const existingEmail = await new Promise((resolve, reject) => {
      UserModel.findonebyemail(userData.email, (err, result) => {
        if (err) return reject(err);
        resolve(result && result.length > 0 ? result[0] : null);
      });
    });

    if (existingEmail) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // 3️⃣ Check if phone already exists
    const existingPhone = await new Promise((resolve, reject) => {
      UserModel.findonebyphone(userData.phone, (err, result) => {
        if (err) return reject(err);
        resolve(result && result.length > 0 ? result[0] : null);
      });
    });

    if (existingPhone) {
      return res.status(400).json({ message: "Phone number already exists" });
    }

    // 4️⃣ Generate UUID for user
    userData.uuid = uuidv4();

    // 5️⃣ Hash the password
    userData.password_hash = bcrypt.hashSync(userData.password, 10);

    // 6️⃣ Set default flags
    userData.is_verified = false;
    userData.is_active = true;

    // 7️⃣ Insert user into DB
    UserModel.insertUser(userData, async (err, results) => {
      if (err) {
        console.error("Database insertion error:", err);
        return res.status(500).json({ message: "Database insertion error" });
      }

      // 8️⃣ Send registration email (optional, don't block registration)
      try {
        await sendRegistrationEmail(
          userData.email,
          userData.first_name,
          userData.user_type || userData.userType
        );
      } catch (emailErr) {
        console.error("Error sending registration email:", emailErr.message);
      }

      // 9️⃣ Send success response
      return res.status(201).json({
        message: "Registration successful",
        userId: results.insertId,
      });
    });
  } catch (err) {
    console.error("Error in insertUser:", err);
    return res.status(500).json({ message: "Server error", details: err.message });
  }
};

/* ------------------ LOGIN ------------------ */
export const login = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  UserModel.findonebyemail(email, (err, results) => {
    if (err) {
      console.error("Database query error:", err);
      return res.status(500).json({ message: "Database query error" });
    }

    if (!results || results.length === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const user = results[0];
    const passwordMatch = bcrypt.compareSync(password, user.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = generateToken(user.uuid);
    const isProd = process.env.NODE_ENV === "production";

    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      maxAge: 3600000, // 1 hour
    });

    return res.status(200).json({
      message: "Login successful",
      token,
      role: user.user_type,
      user_id: user.uuid,
    });
  });
};

/* ------------------ LOGOUT ------------------ */
export const logout = (req, res) => {
  res.clearCookie("auth_token");
  return res.status(200).json({ message: "Logout successful" });
};

/* ------------------ CHANGE PASSWORD ------------------ */
export const ChangePassword = async (req, res) => {
  try {
    const { email, oldPassword, newPassword } = req.body;
    const token = req.cookies.auth_token;

    if (!email || !oldPassword || !newPassword) {
      return res.status(400).json({ message: "Email, old password, and new password are required" });
    }

    if (!token) {
      return res.status(401).json({ message: "Access denied. No token provided." });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ message: "Invalid or expired token." });
    }

    const user = await new Promise((resolve, reject) => {
      UserModel.findonebyemail(email, (err, result) => {
        if (err) return reject(err);
        resolve(result && result.length > 0 ? result[0] : null);
      });
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const passwordMatch = bcrypt.compareSync(oldPassword, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid old password" });
    }

    const hashedPassword = bcrypt.hashSync(newPassword, 10);

    await new Promise((resolve, reject) => {
      UserModel.updatepassword(email, hashedPassword, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });

    return res.status(200).json({ message: "Password changed successfully" });
  } catch (err) {
    console.error("ChangePassword error:", err);
    return res.status(500).json({ message: "Server error", details: err.message });
  }
};
