import jwt from 'jsonwebtoken';

// Token payload uses 'uuid' key — consistent with all controllers that read decoded.uuid
export const generateToken = (userId) => {
    const token = jwt.sign({ uuid: userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
    return token;
};

export const verifyToken = (token) => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return decoded;
    } catch (err) {
        console.error('Token verification failed:', err);
        return null;
    }
};

