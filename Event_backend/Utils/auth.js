import jwt from 'jsonwebtoken';

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
        
        // Set user info from decoded token
        // The token contains userId (uuid), we need to set it properly
        req.user = {
            uuid: decoded.userId,
            user_id: decoded.userId,
            ...decoded
        };
        next();
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