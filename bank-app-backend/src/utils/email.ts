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

  const result = await resend.emails.send({
    from: process.env.EMAIL_FROM || "onboarding@resend.dev",
    to,
    subject: "Welcome to Betta-bank",
    html: `
      <div style="margin:0;padding:0;background:#f4f7fb;font-family:Arial,sans-serif;"> <table width="100%" cellpadding="0" cellspacing="0"> <tr> <td align="center" style="padding:40px 20px;"> <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">

            <tr>
              <td style="background:#0f172a;padding:30px;text-align:center;">
                <h1 style="margin:0;color:#ffffff;font-size:28px;">
                  Betta-Bank
                </h1>
              </td>
            </tr>

            <tr>
              <td style="padding:40px 32px;">
                <h2 style="margin-top:0;color:#111827;">
                  Email Verification
                </h2>

                <p style="color:#4b5563;font-size:16px;line-height:1.6;">
                  Thank you for registering with Betta-Bank.
                  Use the verification code below to confirm your email address.
                </p>

                <div style="margin:32px 0;text-align:center;">
                  <div
                    style="
                      display:inline-block;
                      padding:18px 40px;
                      background:#eff6ff;
                      border:2px solid #2563eb;
                      border-radius:12px;
                      color:#2563eb;
                      font-size:32px;
                      font-weight:700;
                      letter-spacing:8px;
                    "
                  >
                    ${otp}
                  </div>
                </div>

                <p style="color:#374151;font-size:15px;">
                  This code expires in <strong>90 seconds</strong>.
                </p>

                <div
                  style="
                    margin-top:30px;
                    padding:16px;
                    background:#fef2f2;
                    border-left:4px solid #dc2626;
                    border-radius:8px;
                  "
                >
                  <p style="margin:0;color:#991b1b;font-size:14px;">
                    Never share this code with anyone.
                    Betta-Bank employees will never ask for your verification code.
                  </p>
                </div>
              </td>
            </tr>

            <tr>
              <td
                style="
                  background:#f8fafc;
                  padding:20px;
                  text-align:center;
                  color:#6b7280;
                  font-size:13px;
                "
              >
                © 2026 Betta-Bank. All rights reserved.
              </td>
            </tr>

          </table>
        </td>
      </tr>

      </table> </div>
    `,
  });

  console.log(result);

  return result;
};