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
import EmailService from "../Services/emailService.js";
import EmailVerificationService from "../Utils/emailVerification.js";
import db from "../Config/DatabaseCon.js";

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

      // 8️⃣ Send email verification (don't block registration)
      try {
        const verificationToken = EmailVerificationService.generateVerificationToken(
          userData.email, 
          userData.uuid
        );
        
        await EmailService.sendEmailVerification({
          userEmail: userData.email,
          userName: userData.first_name,
          verificationToken,
          userType: userData.user_type || userData.userType || 'user'
        });
        
        console.log('Email verification sent to:', userData.email);
      } catch (emailErr) {
        console.error("Error sending email verification:", emailErr.message);
      }

      // 9️⃣ Send registration welcome email (optional)
      try {
        await EmailService.sendRegistrationEmail(
          userData.email,
          userData.first_name,
          userData.user_type || userData.userType || 'user'
        );
      } catch (emailErr) {
        console.error("Error sending registration email:", emailErr.message);
      }

      // 🔟 Send success response
      return res.status(201).json({
        message: "Registration successful! Please check your email to verify your account.",
        userId: results.insertId,
        requiresVerification: true
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

    // Check if email is verified (optional - you can make this mandatory)
    if (!user.is_verified) {
      return res.status(403).json({ 
        message: "Please verify your email address before logging in. Check your inbox for the verification link.",
        requiresVerification: true,
        email: user.email
      });
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
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
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

/* ------------------ EMAIL VERIFICATION ------------------ */
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ 
        success: false, 
        message: "Verification token is required" 
      });
    }

    // Verify the token
    const tokenVerification = EmailVerificationService.verifyEmailToken(token);
    if (!tokenVerification.success) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid or expired verification token" 
      });
    }

    const { email, user_id } = tokenVerification.data;

    // Check if user exists
    const user = await new Promise((resolve, reject) => {
      UserModel.findonebyemail(email, (err, result) => {
        if (err) return reject(err);
        resolve(result && result.length > 0 ? result[0] : null);
      });
    });

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    if (user.is_verified) {
      return res.status(200).json({ 
        success: true, 
        message: "Email is already verified" 
      });
    }

    // Update user verification status
    await new Promise((resolve, reject) => {
      UserModel.updateVerificationStatus(user.uuid, true, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });

    return res.status(200).json({
      success: true,
      message: "Email verified successfully! You can now access all features."
    });

  } catch (err) {
    console.error("Email verification error:", err);
    return res.status(500).json({ 
      success: false, 
      message: "Server error", 
      details: err.message 
    });
  }
};

/* ------------------ RESEND EMAIL VERIFICATION ------------------ */
export const resendEmailVerification = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: "Email is required" 
      });
    }

    // Check if user exists
    const user = await new Promise((resolve, reject) => {
      UserModel.findonebyemail(email, (err, result) => {
        if (err) return reject(err);
        resolve(result && result.length > 0 ? result[0] : null);
      });
    });

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    if (user.is_verified) {
      return res.status(200).json({ 
        success: true, 
        message: "Email is already verified" 
      });
    }

    // Generate new verification token
    const verificationToken = EmailVerificationService.generateVerificationToken(
      user.email, 
      user.uuid
    );
    
    // Send verification email
    await EmailService.sendEmailVerification({
      userEmail: user.email,
      userName: user.first_name,
      verificationToken,
      userType: user.user_type
    });

    return res.status(200).json({
      success: true,
      message: "Verification email sent successfully! Please check your inbox."
    });

  } catch (err) {
    console.error("Resend verification error:", err);
    return res.status(500).json({ 
      success: false, 
      message: "Server error", 
      details: err.message 
    });
  }
};

/* ------------------ TEST EMAIL FUNCTIONALITY ------------------ */
export const testEmail = async (req, res) => {
  try {
    const { email, type = 'test' } = req.body;

    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: "Email is required" 
      });
    }

    console.log('Testing email functionality...');
    console.log('Email service config check...');
    
    // Test email service configuration
    const configTest = await EmailService.testEmailConfig();
    console.log('Email config test result:', configTest);

    if (!configTest.success) {
      return res.status(500).json({
        success: false,
        message: "Email service configuration error",
        details: configTest.error
      });
    }

    // Send test email based on type
    let result;
    switch (type) {
      case 'vendor-booking':
        result = await EmailService.sendVendorBookingNotification({
          vendorEmail: email,
          vendorName: 'Test Vendor',
          userName: 'Test User',
          userEmail: 'testuser@example.com',
          userPhone: '9876543210',
          packageName: 'Test Package',
          eventDate: new Date().toISOString().split('T')[0],
          eventTime: '10:00 AM',
          amount: '50000',
          bookingId: 'TEST123',
          bookingUuid: 'test-uuid-123'
        });
        break;

      case 'vendor-approval':
        result = await EmailService.sendVendorBookingApprovalNotification({
          vendorEmail: email,
          vendorName: 'Test Vendor',
          businessName: 'Test Business',
          bookingId: 'TEST123',
          packageName: 'Test Package',
          eventDate: new Date().toISOString().split('T')[0],
          customerName: 'Test Customer'
        });
        break;
      
      case 'verification':
        const verificationToken = EmailVerificationService.generateVerificationToken(email, 'test-user-id');
        result = await EmailService.sendEmailVerification({
          userEmail: email,
          userName: 'Test User',
          verificationToken,
          userType: 'user'
        });
        break;
      
      default:
        result = await EmailService.sendRegistrationEmail(email, 'Test User', 'user');
    }

    console.log('Email send result:', result);

    return res.status(200).json({
      success: true,
      message: `Test email sent successfully to ${email}`,
      details: result
    });

  } catch (err) {
    console.error("Test email error:", err);
    return res.status(500).json({ 
      success: false, 
      message: "Failed to send test email", 
      details: err.message 
    });
  }
};

/* ------------------ DEBUG VENDOR DATA ------------------ */
export const debugVendorData = async (req, res) => {
  try {
    const { vendor_id } = req.params;

    if (!vendor_id) {
      return res.status(400).json({ 
        success: false, 
        message: "vendor_id is required" 
      });
    }

    console.log('Debugging vendor data for vendor_id:', vendor_id);

    // Test the vendor query
    const vendorQuery = `
      SELECT u.first_name, u.last_name, u.email, vp.vendor_id, vp.business_name, vp.user_id
      FROM vendor_profiles vp 
      JOIN users u ON vp.user_id = u.user_id 
      WHERE vp.vendor_id = ?
    `;
    
    const vendorResult = await new Promise((resolve, reject) => {
      db.query(vendorQuery, [vendor_id], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

    console.log('Vendor query result:', vendorResult);

    // Also check if vendor exists in vendor_profiles
    const profileQuery = `SELECT * FROM vendor_profiles WHERE vendor_id = ?`;
    const profileResult = await new Promise((resolve, reject) => {
      db.query(profileQuery, [vendor_id], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

    console.log('Vendor profile result:', profileResult);

    return res.status(200).json({
      success: true,
      message: "Vendor debug data retrieved",
      data: {
        vendor_id,
        vendorJoinResult: vendorResult,
        vendorProfileResult: profileResult,
        vendorFound: vendorResult && vendorResult.length > 0,
        profileFound: profileResult && profileResult.length > 0
      }
    });

  } catch (err) {
    console.error("Debug vendor data error:", err);
    return res.status(500).json({ 
      success: false, 
      message: "Failed to debug vendor data", 
      details: err.message 
    });
  }
};

/* ------------------ VALIDATE TOKEN ------------------ */
export const validateToken = async (req, res) => {
  try {
    const token = req.cookies.auth_token || req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: "No token provided" 
      });
    }

    // Verify the token
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid or expired token" 
      });
    }

    // Get user data to ensure user still exists
    const user = await new Promise((resolve, reject) => {
      UserModel.findByUuid(decoded.uuid, (err, result) => {
        if (err) return reject(err);
        resolve(result && result.length > 0 ? result[0] : null);
      });
    });

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    return res.status(200).json({
      success: true,
      message: "Token is valid",
      user: {
        uuid: user.uuid,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        user_type: user.user_type,
        is_verified: user.is_verified
      }
    });

  } catch (err) {
    console.error("Token validation error:", err);
    return res.status(401).json({ 
      success: false, 
      message: "Token validation failed", 
      details: err.message 
    });
  }
};
