import UserModel from "../Models/UserModel.js";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import { sendRegistrationEmail } from "../Services/emailService.js";

/* ---------- REGISTER ---------- */
export const insertUser = async (req, res) => {
  try {
    const { first_name, last_name, email, phone, password, user_type } = req.body;

    UserModel.findByEmailOrPhone(email, phone, async (err, result) => {
      if (err) return res.status(500).json({ message: "DB error" });
      if (result.length > 0)
        return res.status(400).json({ message: "Email or phone already exists" });

      const hashedPassword = await bcrypt.hash(password, 10);

      const userData = {
        uuid: uuidv4(),
        email,
        phone,
        password_hash: hashedPassword,
        first_name,
        last_name,
        user_type,
        is_verified: 0,
        is_active: 1,
      };

      UserModel.insertUser(userData, async (err) => {
        if (err)
          return res.status(500).json({ message: "User insert failed" });

        // ✅ EMAIL SENT HERE
        try {
          await sendRegistrationEmail(email, first_name, user_type);
        } catch (emailErr) {
          console.error("❌ Email failed:", emailErr.message);
        }

        res.status(201).json({ message: "User registered successfully" });
      });
    });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

/* ---------- CHANGE PASSWORD ---------- */
export const ChangePassword = async (req, res) => {
  const { email, oldPassword, newPassword } = req.body;

  UserModel.findonebyemail(email, async (err, result) => {
    if (!result.length) return res.status(404).json({ message: "User not found" });

    const match = await bcrypt.compare(oldPassword, result[0].password_hash);
    if (!match) return res.status(400).json({ message: "Old password incorrect" });

    const hashed = await bcrypt.hash(newPassword, 10);
    UserModel.updatepassword(email, hashed, () =>
      res.json({ message: "Password updated" })
    );
  });
};

/* ---------- LOGIN ---------- */
export const login = async (req, res) => {
  res.json({ message: "Login logic here" });
};

/* ---------- LOGOUT ---------- */
export const logout = async (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out" });
};
