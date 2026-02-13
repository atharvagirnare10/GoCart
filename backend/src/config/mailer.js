import nodemailer from "nodemailer";
import "dotenv/config";

// ✅ TLS Configuration (Port 587) - Render/Cloud deployments ke liye best hai
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // 587 ke liye false hona chahiye
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false // Connection block hone se bachata hai
  }
});

export async function sendOTPEmail(email, otp) {
  try {
    const info = await transporter.sendMail({
      from: `"GoCart Official" <${process.env.MAIL_USER}>`,
      to: email,
      subject: "Your Verification Code",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Your OTP is: <span style="color: #4f46e5;">${otp}</span></h2>
          <p>This code is valid for 10 minutes.</p>
        </div>
      `,
    });
    console.log("✅ Email sent successfully:", info.messageId);
    return true;
  } catch (error) {
    console.error("❌ Email Error (Check logs):", error.message);
    return false;
  }
}