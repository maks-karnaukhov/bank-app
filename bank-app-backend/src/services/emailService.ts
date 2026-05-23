import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendVerificationEmail = async (
  email: string,
  code: string
) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Verify your email",
    html: `
      <div>
        <h2>Email Verification</h2>
        <p>Your verification code:</p>
        <h1>${code}</h1>
        <p>This code expires in 10 minutes.</p>
      </div>
    `,
  });
};