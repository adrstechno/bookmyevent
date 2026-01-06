import express from "express";
import {
  insertUser,
  login,
  logout,
  ChangePassword,
} from "../Controllers/UserController.js";

const router = express.Router();

router.post("/InsertUser", insertUser);
router.post("/Login", login);
router.post("/Logout", logout);
router.post("/changePassword", ChangePassword);

export default router;
