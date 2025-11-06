import  jwt from 'jsonwebtoken';



export const generateToken = (userId) => {
          const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
          return token;
          }

export const verifyToken = (token) => {
          try {
                    const decoded = jwt.verify(token, process.env.JWT_SECRET);
                    return decoded;
          }
          catch (err) {
                    console.error('Token verification failed:', err);
                    return null;
          }
}





