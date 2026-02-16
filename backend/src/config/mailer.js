import nodemailer from "nodemailer";
import "dotenv/config";

// ✅ Updated: TLS Configuration (Port 587)
// Render/Cloud deployments pe strict SSL errors ko avoid karne ke liye
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // Port 587 ke liye ye false hona chahiye (STARTTLS use hota hai)
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS, // App Password hi use karna
  },
  tls: {
    // Ye line server ko self-signed certificates accept karne deti hai
    // Cloud servers pe connection block hone se bachata hai
    rejectUnauthorized: false 
  }
});

export async function sendOTPEmail(email, otp) {
  try {
    const info = await transporter.sendMail({
      from: `"GoCart Official" <${process.env.MAIL_USER}>`,
      to: email,
      subject: "GoCart - Your Verification Code",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #333;">Hello!</h2>
          <p>Your One-Time Password (OTP) for verification is:</p>
          <h1 style="color: #4f46e5; letter-spacing: 2px;">${otp}</h1>
          <p>This code is valid for <strong>10 minutes</strong>.</p>
          <p style="font-size: 12px; color: #888; margin-top: 20px;">If you didn't request this, please ignore this email.</p>
        </div>
      `,
    });
    console.log("✅ Email sent successfully:", info.messageId);
    return true;
  } catch (error) {
    console.error("❌ Email Error (Details):", error);
    return false;
  }
}