const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendResolvedEmail = async ({ to, name, subject, category }) => {
  await transporter.sendMail({
    from: `"CarMart Support" <${process.env.EMAIL_USER}>`,
    to,
    subject: `Your Support Request Has Been Resolved — CarMart`,
    html: `
      <!DOCTYPE html>
      <html>
      <body style="margin:0;padding:0;background:#f4f4f5;font-family:'Helvetica Neue',Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
          <tr><td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

              <!-- Header -->
              <tr>
                <td style="background:linear-gradient(135deg,#0f172a 0%,#1e293b 100%);padding:32px 40px;text-align:center;">
                  <h1 style="margin:0;font-size:26px;font-weight:900;color:#ffffff;letter-spacing:-0.5px;">
                    Car<span style="color:#f59e0b;">Mart</span>
                  </h1>
                  <p style="margin:4px 0 0;color:#94a3b8;font-size:13px;">Pakistan's #1 Car Marketplace</p>
                </td>
              </tr>

              <!-- Resolved Banner -->
              <tr>
                <td style="background:#ecfdf5;padding:24px 40px;text-align:center;border-bottom:1px solid #d1fae5;">
                  <div style="width:56px;height:56px;background:#10b981;border-radius:50%;margin:0 auto 12px;display:flex;align-items:center;justify-content:center;">
                    <span style="color:white;font-size:28px;">✓</span>
                  </div>
                  <h2 style="margin:0;font-size:20px;font-weight:800;color:#065f46;">Issue Resolved!</h2>
                  <p style="margin:6px 0 0;color:#047857;font-size:14px;">Your support request has been successfully resolved.</p>
                </td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="padding:32px 40px;">
                  <p style="margin:0 0 16px;font-size:15px;color:#374151;">Dear <strong>${name}</strong>,</p>
                  <p style="margin:0 0 20px;font-size:14px;color:#6b7280;line-height:1.7;">
                    We are pleased to inform you that your support request has been reviewed and resolved by our team.
                    Here are the details of your request:
                  </p>

                  <!-- Request Details Box -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;margin-bottom:24px;">
                    <tr>
                      <td style="padding:20px 24px;">
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="padding:6px 0;font-size:13px;color:#94a3b8;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;width:120px;">Subject</td>
                            <td style="padding:6px 0;font-size:13px;color:#1e293b;font-weight:600;">${subject}</td>
                          </tr>
                          <tr>
                            <td style="padding:6px 0;font-size:13px;color:#94a3b8;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Category</td>
                            <td style="padding:6px 0;font-size:13px;color:#1e293b;">${category}</td>
                          </tr>
                          <tr>
                            <td style="padding:6px 0;font-size:13px;color:#94a3b8;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Status</td>
                            <td style="padding:6px 0;">
                              <span style="background:#d1fae5;color:#065f46;font-size:12px;font-weight:700;padding:3px 10px;border-radius:20px;">Resolved</span>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>

                  <p style="margin:0 0 20px;font-size:14px;color:#6b7280;line-height:1.7;">
                    If you feel your issue has not been fully addressed or if you have any further questions,
                    please do not hesitate to reach out to us again through our support page.
                  </p>

                  <!-- CTA Button -->
                  <div style="text-align:center;margin:28px 0;">
                    <a href="http://localhost:5173/support"
                       style="background:linear-gradient(135deg,#f59e0b,#f97316);color:#1a1a1a;font-weight:800;font-size:14px;padding:14px 32px;border-radius:12px;text-decoration:none;display:inline-block;">
                      Visit Support Page
                    </a>
                  </div>

                  <p style="margin:24px 0 0;font-size:14px;color:#6b7280;line-height:1.7;">
                    Thank you for choosing CarMart. We appreciate your patience and look forward to serving you.
                  </p>
                  <p style="margin:8px 0 0;font-size:14px;color:#374151;font-weight:600;">
                    — The CarMart Support Team
                  </p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background:#f8fafc;padding:20px 40px;text-align:center;border-top:1px solid #e2e8f0;">
                  <p style="margin:0;font-size:12px;color:#94a3b8;">
                    © ${new Date().getFullYear()} CarMart Pakistan ·
                    <a href="http://localhost:5173" style="color:#f59e0b;text-decoration:none;">carmart.pk</a>
                  </p>
                  <p style="margin:4px 0 0;font-size:11px;color:#cbd5e1;">
                    This email was sent because you submitted a support request on CarMart.
                  </p>
                </td>
              </tr>

            </table>
          </td></tr>
        </table>
      </body>
      </html>
    `,
  });
};

const sendListingEmail = async ({ to, name, carMake, carModel, carYear, approved }) => {
  const color   = approved ? '#10b981' : '#ef4444';
  const icon    = approved ? '✓' : '✕';
  const heading = approved ? 'Listing Approved!' : 'Listing Not Approved';
  const msg     = approved
    ? 'Great news! Your car listing has been verified and is now <strong>live on CarMart</strong>. Buyers can now find and contact you.'
    : 'Unfortunately, your car listing did not meet our listing guidelines and has not been approved. You may re-submit with updated details.';

  await transporter.sendMail({
    from: `"CarMart" <${process.env.EMAIL_USER}>`,
    to,
    subject: `Your Listing Has Been ${approved ? 'Approved' : 'Rejected'} — CarMart`,
    html: `
      <!DOCTYPE html><html><body style="margin:0;padding:0;background:#f4f4f5;font-family:'Helvetica Neue',Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
        <tr><td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
            <tr><td style="background:linear-gradient(135deg,#0f172a,#1e293b);padding:32px 40px;text-align:center;">
              <h1 style="margin:0;font-size:26px;font-weight:900;color:#fff;">Car<span style="color:#f59e0b;">Mart</span></h1>
            </td></tr>
            <tr><td style="padding:32px 40px;text-align:center;">
              <div style="width:60px;height:60px;background:${color};border-radius:50%;margin:0 auto 16px;line-height:60px;font-size:28px;color:#fff;">${icon}</div>
              <h2 style="margin:0 0 8px;color:#111;">${heading}</h2>
              <p style="color:#6b7280;font-size:14px;line-height:1.7;margin:0 0 24px;">${msg}</p>
              <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:16px 24px;text-align:left;margin-bottom:24px;">
                <p style="margin:0;font-size:13px;color:#94a3b8;font-weight:600;text-transform:uppercase;">Listing</p>
                <p style="margin:4px 0 0;font-size:16px;font-weight:800;color:#111;">${carMake} ${carModel} ${carYear}</p>
              </div>
              <a href="http://localhost:5173/sell" style="background:linear-gradient(135deg,#f59e0b,#f97316);color:#1a1a1a;font-weight:800;font-size:14px;padding:14px 32px;border-radius:12px;text-decoration:none;display:inline-block;">
                ${approved ? 'View My Listing' : 'Submit Again'}
              </a>
            </td></tr>
            <tr><td style="background:#f8fafc;padding:16px 40px;text-align:center;border-top:1px solid #e2e8f0;">
              <p style="margin:0;font-size:12px;color:#94a3b8;">© ${new Date().getFullYear()} CarMart Pakistan</p>
            </td></tr>
          </table>
        </td></tr>
      </table>
      </body></html>
    `,
  });
};

const sendPasswordResetEmail = async ({ to, name, resetUrl }) => {
  await transporter.sendMail({
    from: `"CarMart" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Reset Your CarMart Password',
    html: `
      <!DOCTYPE html><html><body style="margin:0;padding:0;background:#f4f4f5;font-family:'Helvetica Neue',Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
        <tr><td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
            <tr><td style="background:linear-gradient(135deg,#0f172a,#1e293b);padding:32px 40px;text-align:center;">
              <h1 style="margin:0;font-size:26px;font-weight:900;color:#fff;">Car<span style="color:#f59e0b;">Mart</span></h1>
            </td></tr>
            <tr><td style="padding:32px 40px;text-align:center;">
              <div style="width:60px;height:60px;background:#f59e0b;border-radius:50%;margin:0 auto 16px;line-height:60px;font-size:28px;color:#fff;">🔑</div>
              <h2 style="margin:0 0 8px;color:#111;">Password Reset Request</h2>
              <p style="color:#6b7280;font-size:14px;line-height:1.7;margin:0 0 8px;">Hi <strong>${name}</strong>,</p>
              <p style="color:#6b7280;font-size:14px;line-height:1.7;margin:0 0 24px;">Click the button below to reset your password. This link expires in <strong>15 minutes</strong>.</p>
              <a href="${resetUrl}" style="background:linear-gradient(135deg,#f59e0b,#f97316);color:#1a1a1a;font-weight:800;font-size:14px;padding:14px 32px;border-radius:12px;text-decoration:none;display:inline-block;">
                Reset Password
              </a>
              <p style="color:#94a3b8;font-size:12px;margin-top:24px;">If you didn't request this, ignore this email. Your password won't change.</p>
            </td></tr>
            <tr><td style="background:#f8fafc;padding:16px 40px;text-align:center;border-top:1px solid #e2e8f0;">
              <p style="margin:0;font-size:12px;color:#94a3b8;">© ${new Date().getFullYear()} CarMart Pakistan</p>
            </td></tr>
          </table>
        </td></tr>
      </table>
      </body></html>
    `,
  });
};

module.exports = { sendResolvedEmail, sendListingEmail, sendPasswordResetEmail };
