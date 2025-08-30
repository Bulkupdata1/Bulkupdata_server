const nodemailer = require("nodemailer");

const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD,
    },
  });
};

const transporter = createTransporter();

const sendMail = async (mailOptions) => {
  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${mailOptions.to}`);
    return true;
  } catch (error) {
    console.error(`Error sending email to ${mailOptions.to}:`, error);
    return false;
  }
};

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

  return sendMail(mailOptions);
};

const sendFeedbackEmail = async ({ name, email, suggestion }) => {
  const adminMailOptions = {
    from: `"BulkUpData Feedback" <${process.env.EMAIL_USER}>`,
    to: "support@lukasdesignlab.com",
    subject: `Suggestion from ${name}`,
    text: `
      New Suggestion Received 🚀

      Name: ${name}
      Email: ${email}
      Suggestion:
      ${suggestion}

      -----------------------------
      Sent via BulkUpData Feedback Form
    `,
  };

  const userConfirmationOptions = {
    from: `"BulkUpData Support" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "✅ Thanks for your suggestion!",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; line-height: 1.6;">
        <h2 style="color: #0066cc;">Hi ${name},</h2>
        <p>🎉 Thank you for taking the time to share your suggestion with us!</p>
        <p>
          We've received your feedback and our team will review it carefully. 
          If needed, we'll get back to you as quickly as possible.
        </p>
        <p style="margin-top: 15px;">
          Meanwhile, feel free to explore our platform and stay updated with the latest improvements.
        </p>
        
        <div style="margin-top: 25px; padding: 15px; border-left: 4px solid #0066cc; background: #f9f9f9;">
          <strong>Your Suggestion:</strong><br />
          <em>${suggestion}</em>
        </div>

        <p style="margin-top: 20px;">Thanks again for helping us improve 🚀</p>
        <p style="font-weight: bold; color: #0066cc;">– The BulkUpData Team</p>
      </div>
    `,
  };

  const [adminSent, userSent] = await Promise.all([
    sendMail(adminMailOptions),
    sendMail(userConfirmationOptions),
  ]);

  return adminSent && userSent;
};

module.exports = { sendOtpEmail, sendFeedbackEmail };
