import express from 'express';
import {insertUser , login , logout , ChangePassword } from '../Controllers/UserController.js';

const router = express.Router();

// Route to insert a new user
router.post('/InsertUser', insertUser);
// Route for user login
router.post('/Login', login);
// Route for user logout
router.post('/Logout', logout);
router.post('/changePassword' , ChangePassword );



export default router;