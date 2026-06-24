import { Resend } from "resend";

function getResend() {
  const key = process.env.RESEND_API_KEY;

  if (!key) {
    throw new Error("RESEND_API_KEY is missing");
  }

  return new Resend(key);
}

export const sendOtpEmail = async (to: string, otp: string) => {
  const resend = getResend();

  return resend.emails.send({
    from: process.env.EMAIL_FROM || "onboarding@resend.dev",
    to,
    subject: "Welcome to Betta-bank",
    html: `
      <div style="font-family: sans-serif;">
        <h2>Verification Code</h2>
        <p>Your code: <b>${otp}</b></p>
        <p>Expires in 90s</p>
      </div>
    `,
  });
};