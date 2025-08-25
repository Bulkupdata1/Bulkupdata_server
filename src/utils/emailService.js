const nodemailer = require("nodemailer");

// --- Nodemailer Transporter Configuration ---
const transporter = nodemailer.createTransport({
  service: "gmail", // Using Gmail service
  auth: {
    user: process.env.EMAIL_USER, // Your Gmail address (e.g., bulkupdata@gmail.com)
    pass: process.env.EMAIL_APP_PASSWORD, // Your generated Gmail App Password
  },
});

const sendOtpEmail = async (toEmail, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: toEmail,
    subject: "Your BulkUp One-Time Password (OTP)",
    html: `
      <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 2px solid #000; border-radius: 12px; background-color: #fffbe6;">
        <h2 style="color: #000; text-align: center; margin-bottom: 30px; font-size: 28px;">
          <span style="display: inline-block; vertical-align: middle;">🔑</span> Your One-Time Password
        </h2>

        <p style="font-size: 16px; line-height: 1.6; color: #000; margin-bottom: 20px;">
          Hello there,
        </p>

        <p style="font-size: 16px; line-height: 1.6; color: #000; margin-bottom: 30px;">
          You've requested an OTP for your BulkUp account. Please use the following code to complete your action:
        </p>

        <div style="text-align: center; margin: 30px 0;">
          <span style="display: inline-block; padding: 18px 35px; font-size: 38px; font-weight: bold; color: #000; background-color: #FFDB1B; border: 2px solid #000; border-radius: 10px; letter-spacing: 3px; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">
            ${otp}
          </span>
        </div>

        <p style="font-size: 16px; line-height: 1.6; color: #000; margin-top: 30px;">
          This OTP is valid for the next <b>5 minutes</b>. For your security, please do not share this code with anyone.
        </p>

        <p style="font-size: 14px; color: #333; margin-top: 40px; text-align: center;">
          If you did not request this OTP, please disregard this email. Your account remains secure.
        </p>

        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 2px solid #000; font-size: 13px; color: #111;">
          Thank you,<br/>
          <b>The BulkUp Team</b>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ OTP email sent successfully to ${toEmail}`);
    return true;
  } catch (error) {
    console.error(`❌ Error sending OTP email to ${toEmail}:`, error);
    return false;
  }
};

module.exports = { sendOtpEmail };
