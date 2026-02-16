import nodemailer from "nodemailer";
import "dotenv/config";

// ✅ Updated Configuration for Brevo (Using Port 465 for stability)
const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com", // Brevo ka official host
  port: 465,                    // SSL Port (Render ke liye best hai)
  secure: true,                 // Port 465 ke liye true hona chahiye
  auth: {
    user: process.env.SMTP_USER, // Brevo Login ID (e.g., a27bbd001@smtp-brevo.com)
    pass: process.env.SMTP_PASS, // Brevo se generate ki gayi SMTP Key
  },
  // ✅ Timeout settings taaki connection drop na ho
  connectionTimeout: 10000, 
  greetingTimeout: 10000,
  socketTimeout: 10000,
  tls: {
    // Certificate issues ko bypass karne ke liye
    rejectUnauthorized: false 
  }
});

/**
 * OTP Email bhejane ka function
 */
export async function sendOTPEmail(email, otp) {
  try {
    const info = await transporter.sendMail({
      // ⚠️ IMPORTANT: 'from' email Brevo par verified hona chahiye
      from: `"GoCart Official" <${process.env.SMTP_FROM}>`, 
      to: email,
      subject: "GoCart - Your Verification Code",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px; max-width: 500px; margin: auto;">
          <h2 style="color: #333; text-align: center;">Verify Your Account</h2>
          <p>Hello,</p>
          <p>Use the following One-Time Password (OTP) to complete your registration:</p>
          <div style="background: #f4f4f4; padding: 15px; text-align: center; border-radius: 5px;">
            <h1 style="color: #4f46e5; margin: 0; letter-spacing: 5px;">${otp}</h1>
          </div>
          <p style="margin-top: 20px;">This code is valid for <strong>10 minutes</strong>.</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #888; text-align: center;">If you didn't request this, please ignore this email.</p>
        </div>
      `,
    });

    console.log("✅ Email sent successfully via Brevo:", info.messageId);
    return true;
  } catch (error) {
    // Logs mein pura error dikhayega taaki debugging asaan ho
    console.error("❌ Email Error (Details):", error);
    return false;
  }
}