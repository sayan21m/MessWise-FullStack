import transporter from "../config/mailer.js";

export async function sendVerificationEmail(user_email, token) {
  const verification_link = `${process.env.FRONTEND_URL}/verify-email?token=${encodeURIComponent(token)}`;

  const info = await transporter.sendMail({
    from: `MessWise <${process.env.MAIL_FROM}>`,
    to: user_email,
    subject: "Verify your MessWise account",
    html: `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Verify your MessWise account</title>
  </head>
  <body style="margin:0;padding:0;background:#eef3ef;font-family:system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;color:#17231d;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#eef3ef;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:520px;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 25px 80px rgba(27,67,46,0.13);">
            <tr>
              <td style="padding:28px 32px;background:linear-gradient(180deg,rgba(8,30,20,0.92),rgba(7,35,23,0.96));">
                <p style="margin:0;font-size:22px;font-weight:800;letter-spacing:-1px;color:#ffffff;">
                  Mess<span style="color:#61d69d;">Wise</span>
                </p>
                <p style="margin:6px 0 0;font-size:12px;color:#c9d9cf;">Smart Mess Management</p>
              </td>
            </tr>

            <tr>
              <td style="padding:36px 32px 40px;">
                <span style="display:inline-block;margin-bottom:16px;padding:7px 11px;border-radius:8px;background:#e8f6ee;color:#096343;font-size:11px;font-weight:700;letter-spacing:0.4px;">
                  WELCOME ABOARD
                </span>

                <h1 style="margin:0;font-size:28px;line-height:1.2;letter-spacing:-1px;color:#17231d;">
                  Verify your email
                </h1>

                <p style="margin:12px 0 0;font-size:14px;line-height:1.7;color:#7b8780;">
                  Thanks for joining MessWise. Confirm your email to finish setting up your account and start managing your mess.
                </p>

                <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:28px 0 8px;">
                  <tr>
                    <td align="center" style="border-radius:12px;background:#16845b;box-shadow:0 8px 18px rgba(22,132,91,0.16);">
                      <a href="${verification_link}"
                         style="display:inline-block;padding:15px 28px;border-radius:12px;background:#16845b;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;">
                        Verify Email
                      </a>
                    </td>
                  </tr>
                </table>

                <p style="margin:24px 0 0;font-size:12px;line-height:1.7;color:#7b8780;">
                  This link expires in <strong style="color:#36453b;">15 days</strong>.
                  If you did not create a MessWise account, you can ignore this email.
                </p>

                <p style="margin:20px 0 0;padding-top:20px;border-top:1px solid #e2e9e4;font-size:11px;line-height:1.6;color:#87948b;">
                  Button not working? Paste this link into your browser:<br />
                  <a href="${verification_link}" style="color:#16845b;word-break:break-all;text-decoration:none;">
                    ${verification_link}
                  </a>
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding:16px 32px 24px;background:#fcfdfc;border-top:1px solid #e2e9e4;">
                <p style="margin:0;text-align:center;font-size:10px;color:#a0aaa2;">
                  © 2026 MessWise · Your information stays secure.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
    `,
  });

  return info.messageId;
}

export async function sendMessInvitationEmail(invited_email, token, mess_name, inviter_name) {
  const invitation_link = `${process.env.FRONTEND_URL}/accept-invitation?token=${encodeURIComponent(token)}`;

  const info = await transporter.sendMail({
    from: `MessWise <${process.env.MAIL_FROM}>`,
    to: invited_email,
    subject: `You've been invited to join ${mess_name} on MessWise`,
    html: `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>MessWise invitation</title>
  </head>
  <body style="margin:0;padding:0;background:#eef3ef;font-family:system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;color:#17231d;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#eef3ef;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:520px;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 25px 80px rgba(27,67,46,0.13);">
            <tr>
              <td style="padding:28px 32px;background:linear-gradient(180deg,rgba(8,30,20,0.92),rgba(7,35,23,0.96));">
                <p style="margin:0;font-size:22px;font-weight:800;letter-spacing:-1px;color:#ffffff;">
                  Mess<span style="color:#61d69d;">Wise</span>
                </p>
                <p style="margin:6px 0 0;font-size:12px;color:#c9d9cf;">Smart Mess Management</p>
              </td>
            </tr>

            <tr>
              <td style="padding:36px 32px 40px;">
                <span style="display:inline-block;margin-bottom:16px;padding:7px 11px;border-radius:8px;background:#e8f6ee;color:#096343;font-size:11px;font-weight:700;letter-spacing:0.4px;">
                  MESS INVITATION
                </span>

                <h1 style="margin:0;font-size:28px;line-height:1.2;letter-spacing:-1px;color:#17231d;">
                  You're invited
                </h1>

                <p style="margin:12px 0 0;font-size:14px;line-height:1.7;color:#7b8780;">
                  <strong style="color:#36453b;">${inviter_name}</strong> has invited you to join
                  <strong style="color:#36453b;">${mess_name}</strong> on MessWise.
                </p>

                <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:28px 0 8px;">
                  <tr>
                    <td align="center" style="border-radius:12px;background:#16845b;box-shadow:0 8px 18px rgba(22,132,91,0.16);">
                      <a href="${invitation_link}"
                         style="display:inline-block;padding:15px 28px;border-radius:12px;background:#16845b;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;">
                        Accept Invitation
                      </a>
                    </td>
                  </tr>
                </table>

                <p style="margin:24px 0 0;font-size:12px;line-height:1.7;color:#7b8780;">
                  This invitation expires in <strong style="color:#36453b;">7 days</strong>.
                  If you weren't expecting this, you can ignore this email.
                </p>

                <p style="margin:20px 0 0;padding-top:20px;border-top:1px solid #e2e9e4;font-size:11px;line-height:1.6;color:#87948b;">
                  Button not working? Paste this link into your browser:<br />
                  <a href="${invitation_link}" style="color:#16845b;word-break:break-all;text-decoration:none;">
                    ${invitation_link}
                  </a>
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding:16px 32px 24px;background:#fcfdfc;border-top:1px solid #e2e9e4;">
                <p style="margin:0;text-align:center;font-size:10px;color:#a0aaa2;">
                  © 2026 MessWise · Your information stays secure.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
    `,
  });

  return info.messageId;
}
