const nodemailer = require("nodemailer");
let mail = {};

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true for port 465, false for other ports
  auth: {
    user: "authaffiliate.supp@gmail.com",
    pass: "rvrgkzqosmdtitun",
  },
});


mail.sendMail = async (userEmail, resetLink) => {
  try {
    await transporter.sendMail({
      from: 'authaffiliate.supp@gmail.com', // sender address
      to: userEmail, // recipient's email address
      subject: "Password Reset Request", // Subject line
      text: `Hello,

      We received a request to reset your password. Click the link below to reset it:

      ${resetLink}

      If you didn’t request a password reset, please ignore this email or let us know. This link will expire in 30 minutes.

      Thank you,
      The Support Team`, // plain text body
            html: `<p>Hello,</p>
                  <p>We received a request to reset your password. Click the link below to reset it:</p>
                  <p><a href="${resetLink}">Reset Password</a></p>
                  <p>If you didn’t request a password reset, please ignore this email or let us know. This link will expire in 30 minutes.</p>
                  <p>Thank you,<br>The Support Team</p>`, // HTML body
          });
  } catch (err) {
    console.log(err, 'mail error');
    return err;
  }
};


module.exports = mail;
