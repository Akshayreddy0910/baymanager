import nodemailer from 'nodemailer';

/**
 * Why an "App Password"?
 * Standard Gmail passwords are blocked by Google for automated scripts as a security measure.
 * If you have 2-Factor Authentication (2FA) enabled, you must generate a 16-character 
 * "App Password" from your Google Account settings to allow Nodemailer to log in.
 */

// 1. Create a transporter object using the Gmail service
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// 2. Define a function to send HTML emails easily from anywhere in the app
export const sendEmail = async (to, subject, html) => {
  try {
    // 3. Define the email options (sender, receiver, subject, and content)
    const mailOptions = {
      from: `"BayManager 🚗" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: subject,
      html: html,
    };

    // 4. Send the email using the transporter
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully: ✅', info.messageId);
    return info;
  } catch (error) {
    // 5. Log any errors if the email fails to send
    console.error('Email sending failed: ❌', error.message);
  }
};
