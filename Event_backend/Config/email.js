// emailService.js
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

// 1️⃣ Create transporter
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true for 465, false for 587
  auth: {
    user: process.env.EMAIL_USER, // your Gmail
    pass: process.env.EMAIL_PASS, // App Password (if 2FA enabled)
  },
  tls: {
    rejectUnauthorized: false, // avoids certificate issues
  },
});

// 2️⃣ Function to send registration email
export const sendRegistrationEmail = async (toEmail, firstName) => {
  try {
    const info = await transporter.sendMail({
      from: `"BookMyEvent" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: "🎉 Registration Successful!",
      text: `Hello ${firstName}, your registration at BookMyEvent was successful!`, // plain-text fallback
      html: `
        <html>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <h2 style="color: #1a73e8;">Hello ${firstName} 🎉</h2>
            <p>Your registration was successful. Welcome to <strong>BookMyEvent</strong>!</p>
            <p>We are excited to have you on board. Explore events, book tickets, and enjoy!</p>
            <hr style="border: none; border-top: 1px solid #eee;" />
            <p style="font-size: 0.9em; color: #666;">This is an automated message, please do not reply.</p>
          </body>
        </html>
      `,
    });

    console.log("✅ Registration email sent:", info.messageId);
  } catch (error) {
    console.error("❌ Error sending registration email:", error);
  }
};

// 3️⃣ Optional: test function
const testEmail = async () => {
  await sendRegistrationEmail("nishantteach@gmail.com", "Nishant");
};

// Run test
testEmail();

export default transporter;
