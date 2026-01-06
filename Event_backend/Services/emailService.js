import nodemailer from "nodemailer";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.resolve(__dirname, "../.env")
});

console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("EMAIL_PASS:", process.env.EMAIL_PASS ? "LOADED" : "MISSING");
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Use App Password if 2FA enabled
  },
  tls: { rejectUnauthorized: false },
});

export const sendRegistrationEmail = async (toEmail, firstName, userType) => {
  const accountType = userType === "vendor" ? "Vendor" : "User";

  await transporter.sendMail({
    from: `"BookMyEvent" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: `🎉 ${accountType} Registration Successful!`,
    text: `Hello ${firstName}, Your registration as a ${accountType} at BookMyEvent is successful.`,
    html: `
      <h2>Hello ${firstName} 🎉</h2>
      <p>Your registration as a <b>${accountType}</b> at <b>BookMyEvent</b> was successful.</p>
      <p>You can now login and start using our services.</p>
      <br/>
      <b>BookMyEvent Team</b>
    `,
  });
};



// Optional: test email when running file directly
// if (require.main === module) {
//   (async () => {
//     try {
//       await sendRegistrationEmail("nishantteach@gmail.com", "Nishant", "user");
//       console.log("✅ Test email sent successfully!");
//     } catch (err) {
//       console.error("❌ Failed to send test email:", err);
//     }
//   })();
// }

export default transporter;
