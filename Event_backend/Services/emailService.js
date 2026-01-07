import nodemailer from "nodemailer";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

/* ------------------ ENV SETUP ------------------ */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.resolve(__dirname, "../.env"),
});

/* ------------------ TRANSPORTER ------------------ */
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Gmail App Password
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// Verify transporter
transporter.verify((error) => {
  if (error) {
    console.error("❌ Email server error:", error);
  } else {
    console.log("✅ Email server is ready");
  }
});

/* ------------------ SEND REGISTRATION EMAIL ------------------ */
export const sendRegistrationEmail = async (toEmail, firstName, userType) => {
  // 🔒 SAFETY FIX (THIS WAS THE BUG)
  const normalizedType =
    typeof userType === "string" ? userType.toLowerCase() : "user";

  const isVendor = normalizedType === "vendor";

  console.log("📧 Sending email type:", isVendor ? "VENDOR" : "USER");

  const subject = isVendor
    ? "🎉 Welcome to GoEventify – Your Vendor Account Is Ready"
    : "🎉 Welcome to GoEventify – Start Creating Extraordinary Experiences";

  const text = isVendor
    ? `Hello ${firstName},

Welcome to GoEventify!

Your Vendor account has been successfully registered.

Login:
https://www.goeventify.com/login

— GoEventify Vendor Support Team`
    : `Hello ${firstName},

Welcome to GoEventify!

Your account has been successfully registered.

Login:
https://www.goeventify.com/login

— GoEventify Team`;

  const html = `
  <div style="
    max-width:620px;
    margin:0 auto;
    font-family:Segoe UI, Arial, sans-serif;
    background:#ffffff;
    padding:40px 32px;
    color:#111827;
  ">

    <h1 style="font-size:26px; margin-bottom:16px;">
      Hello ${firstName} 👋
    </h1>

    <p style="font-size:17px; line-height:1.6;">
      Welcome to <b>GoEventify</b>!
    </p>

    <p style="font-size:17px; line-height:1.6; margin-top:14px;">
      ${
        isVendor
          ? `Your <b>Vendor account</b> has been <b>successfully registered</b>.
             GoEventify connects trusted vendors with customers planning
             <b>weddings, corporate events, and special celebrations</b>.`
          : `Your <b>User account</b> has been <b>successfully registered</b>.
             GoEventify helps you create <b>extraordinary experiences</b> —
             from elegant weddings to professional corporate events.`
      }
    </p>

    <h3 style="font-size:20px; margin-top:24px;">
      What you can do with GoEventify:
    </h3>

    <ul style="font-size:16px; line-height:1.8; padding-left:20px;">
      ${
        isVendor
          ? `
            <li>📢 Showcase your services</li>
            <li>🤝 Connect with genuine clients</li>
            <li>📊 Manage bookings & inquiries</li>
            <li>📈 Grow your business</li>
          `
          : `
            <li>🎉 Plan weddings & events</li>
            <li>🤝 Connect with trusted vendors</li>
            <li>🏛️ Discover premium venues</li>
            <li>📋 Manage everything in one place</li>
          `
      }
    </ul>

    <div style="text-align:center; margin:36px 0;">
      <a href="https://www.goeventify.com/login"
        style="
          background:#4f46e5;
          color:#ffffff;
          text-decoration:none;
          padding:16px 38px;
          border-radius:10px;
          font-size:17px;
          font-weight:600;
          display:inline-block;
        ">
       Login to GoEventify
      </a>
    </div>

    <p style="font-size:16px;">
      <b>
        ${isVendor
          ? "We’re excited to grow together. 🚀"
          : "Let’s create something extraordinary. ✨"}
      </b>
    </p>

    <p style="font-size:15px; margin-top:8px;">
      — <b>GoEventify ${isVendor ? "Vendor Support Team" : "Team"}</b>
    </p>

  </div>
  `;

  try {
    await transporter.sendMail({
      from: `"GoEventify" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject,
      text,
      html,
    });

    console.log(`✅ Registration email sent to ${toEmail}`);
  } catch (error) {
    console.error("❌ Email send failed:", error);
    throw error;
  }
};

export default transporter;

/* ------------------ TEST MODE (RUN DIRECTLY) ------------------ */
if (process.argv[1].endsWith("emailService.js")) {
  (async () => {
    try {
      console.log("🚀 Sending USER email...");
      await sendRegistrationEmail(
        "nishantteach@gmail.com",
        "Nishant",
        "user"
      );

      // console.log("🚀 Sending VENDOR email...");
      // await sendRegistrationEmail(
      //   "nishantteach@gmail.com",
      //   "Nishant",
      //   "vendor"
      // );

      console.log("✅ BOTH TEST EMAILS SENT");
    } catch (err) {
      console.error("❌ TEST FAILED:", err);
    }
  })();
}
