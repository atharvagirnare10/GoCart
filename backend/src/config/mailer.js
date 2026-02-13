import { Resend } from 'resend';
import "dotenv/config";

// ✅ Resend ko API Key ke sath initialize kiya
// Ensure karein ki Render dashboard mein RESEND_API_KEY set hai
const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendOTPEmail(email, otp) {
  try {
    const { data, error } = await resend.emails.send({
      // ✅ Testing phase mein 'onboarding@resend.dev' hi use karna hoga
      from: 'GoCart <onboarding@resend.dev>',
      to: email, 
      subject: 'Your Verification Code',
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; max-width: 400px; margin: auto;">
          <h2 style="color: #4f46e5; margin-bottom: 16px;">GoCart Verification</h2>
          <p style="color: #475569; font-size: 16px;">Hello,</p>
          <p style="color: #475569; font-size: 16px;">Use the following code to verify your account:</p>
          <div style="background: #f8fafc; padding: 16px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: 800; letter-spacing: 4px; color: #0f172a;">${otp}</span>
          </div>
          <p style="color: #94a3b8; font-size: 12px; margin-top: 20px;">
            This code is valid for 10 minutes. If you didn't request this, please ignore this email.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("❌ Resend API Error:", error);
      return false;
    }

    console.log("✅ Email sent successfully! ID:", data.id);
    return true;
  } catch (error) {
    console.error("❌ Unexpected Error in Mailer:", error.message);
    return false;
  }
}