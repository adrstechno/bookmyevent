import jwt from 'jsonwebtoken';
import db from '../Config/DatabaseCon.js';

// Authentication middleware - supports both Bearer token and cookies
export const authenticateToken = (req, res, next) => {
    // Try to get token from Authorization header first
    const authHeader = req.headers['authorization'];
    let token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    // If no Bearer token, try to get from cookies
    if (!token && req.cookies) {
        token = req.cookies.auth_token;
    }

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Access token required'
        });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({
                success: false,
                message: 'Invalid or expired token'
            });
        }
        
        // Get full user info from database
        const userId = decoded.userId;
        
        // Query to get user info and vendor_id if exists
        // Note: vendor_profiles.user_id might store uuid (string) or user_id (int) depending on how vendor was created
        const sql = `
            SELECT u.user_id, u.uuid, u.email, u.first_name, u.last_name, u.user_type,
                   vp.vendor_id
            FROM users u
            LEFT JOIN vendor_profiles vp ON (u.user_id = vp.user_id OR u.uuid = vp.user_id)
            WHERE u.uuid = ?
            LIMIT 1
        `;
        
        db.query(sql, [userId], (dbErr, results) => {
            if (dbErr) {
                console.error('Auth DB error:', dbErr);
                return res.status(500).json({
                    success: false,
                    message: 'Authentication error'
                });
            }
            
            if (!results || results.length === 0) {
                console.log('User not found for uuid:', userId);
                return res.status(401).json({
                    success: false,
                    message: 'User not found'
                });
            }
            
            const user = results[0];
            console.log('Auth successful for user:', user.uuid, 'type:', user.user_type, 'vendor_id:', user.vendor_id);
            
            // Set user info on request
            req.user = {
                uuid: user.uuid,
                user_id: user.uuid, // Use uuid as user_id for bookings (matches event_booking.user_id which is VARCHAR)
                db_user_id: user.user_id,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                user_type: user.user_type,
                vendor_id: user.vendor_id || null
            };
            
            console.log('req.user set:', JSON.stringify(req.user));
            next();
        });
    });
};

// Role-based authorization middleware
export const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        if (!roles.includes(req.user.user_type)) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions'
            });
        }

        next();
    };
};

// Vendor authorization middleware
export const authorizeVendor = (req, res, next) => {
    if (!req.user || !req.user.vendor_id) {
        return res.status(403).json({
            success: false,
            message: 'Vendor access required'
        });
    }
    next();
};

// Admin authorization middleware
export const authorizeAdmin = (req, res, next) => {
    if (!req.user || req.user.user_type !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Admin access required'
        });
    }
    next();
};