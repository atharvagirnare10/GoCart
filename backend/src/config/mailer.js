import nodemailer from "nodemailer";
import "dotenv/config";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS, // App Password yahan use hoga
  },
});

export async function sendOTPEmail(email, otp) {
  try {
    const info = await transporter.sendMail({
      from: `"GoCart Official" <${process.env.MAIL_USER}>`,
      to: email,
      subject: "Your Verification Code",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Your OTP is: <span style="color: blue;">${otp}</span></h2>
          <p>This code is valid for 10 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
      `,
    });
    console.log("Email sent: ", info.messageId);
    return true;
  } catch (error) {
    console.error("Email Error:", error);
    return false; // Error return karega taaki pata chale
  }
}