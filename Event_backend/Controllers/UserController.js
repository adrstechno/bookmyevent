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
     // passwoerd hesh convert 
    UserModel.findonebyemail(email, password, (err, results) => {
        if (err) {
            console.error('Error fetching user:', err);
            return res.status(500).json({ error: 'Database query error' });
        }
        if (results.length === 0) {
            return  res.status(401).json({ error: 'Invalid email or password' });
        }
        const user = results[0];
        const passwordMatch = bcrypt.compareSync(password, user.password_hash);
        if (!passwordMatch) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        //when password is match create token and storge in cookies 
        const token = generateToken(user.uuid);
        //store in session or cookies
        res.cookie('auth_token', token, { httpOnly: true, secure: true, maxAge: 3600000 }); // 1 hour expiry
    
        // Successful login
        res.status(200).json({ message: 'Login successful', token: token  , role : user.user_type});
    }
    );
}

export const logout = (req, res) => {
    res.clearCookie('auth_token');
    res.status(200).json({ message: 'Logout successful' });
}



