"use server";

import { Resend } from "resend";

const CONTACT_FROM_EMAIL =
  process.env.CONTACT_FROM_EMAIL?.trim() ||
  "EJ STUDIO <onboarding@resend.dev>";

// Replace with the public HTTPS URL of the deployed EJ STUDIO logo.
const CONTACT_EMAIL_LOGO_URL = "";

const NAME_MAX_LENGTH = 100;
const EMAIL_MAX_LENGTH = 254;
const MESSAGE_MIN_LENGTH = 10;
const MESSAGE_MAX_LENGTH = 4000;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type ContactActionResult =
  | { success: true }
  | { success: false };

function readTextField(formData: FormData, field: string) {
  const value = formData.get(field);
  return typeof value === "string" ? value.trim() : "";
}

function isValidName(name: string) {
  return (
    name.length > 0 &&
    name.length <= NAME_MAX_LENGTH &&
    !/[\u0000-\u001f\u007f]/.test(name)
  );
}

function isValidEmail(email: string) {
  return (
    email.length > 0 &&
    email.length <= EMAIL_MAX_LENGTH &&
    EMAIL_PATTERN.test(email)
  );
}

function isValidMessage(message: string) {
  return (
    message.length >= MESSAGE_MIN_LENGTH &&
    message.length <= MESSAGE_MAX_LENGTH
  );
}

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "'": "&#39;",
      '"': "&quot;",
    };

    return entities[character];
  });
}

function createContactEmailHtml(name: string, email: string, message: string) {
  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeMessage = escapeHtml(message).replace(/\r?\n/g, "<br />");
  const replyHref = escapeHtml(`mailto:${email}`);
  const logoUrl = CONTACT_EMAIL_LOGO_URL.trim();
  const logoMarkup = /^https:\/\//i.test(logoUrl)
    ? `<td width="54" valign="middle" style="width:54px; padding:0 14px 0 0;">
                    <img src="${escapeHtml(logoUrl)}" width="40" alt="EJ STUDIO logo" style="display:block; width:40px; max-width:40px; height:auto; border:0; outline:none; text-decoration:none;" />
                  </td>`
    : "";

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="light only" />
    <title>New EJ STUDIO Inquiry</title>
    <style>
      @media only screen and (max-width: 600px) {
        .email-pad { padding-left: 24px !important; padding-right: 24px !important; }
        .inquiry-title { font-size: 48px !important; line-height: 50px !important; }
        .detail-label { width: 92px !important; }
      }
    </style>
  </head>
  <body style="margin:0; padding:0; background-color:#f3f0e9; color:#20201e;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%; background-color:#f3f0e9; border-collapse:collapse;">
      <tr>
        <td align="center" style="padding:32px 16px;">
          <table role="presentation" width="700" cellspacing="0" cellpadding="0" border="0" style="width:100%; max-width:700px; border-collapse:collapse;">
            <tr>
              <td class="email-pad" style="padding:44px 48px 38px; background-color:#f3f0e9; border:1px solid #d8d3c9; border-bottom:0;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%; border-collapse:collapse;">
                  <tr>
                    ${logoMarkup}
                    <td valign="middle" style="padding:0;">
                      <div style="font-family:Arial, Helvetica, sans-serif; font-size:20px; font-weight:700; line-height:24px; letter-spacing:0.14em; color:#20201e;">EJ STUDIO</div>
                      <div style="padding-top:8px; font-family:'Courier New', Courier, monospace; font-size:10px; line-height:16px; letter-spacing:0.18em; color:#68645d;">ARCHITECTURE &middot; SPACE &middot; EXPERIENCE</div>
                    </td>
                  </tr>
                </table>
                <div style="height:1px; margin-top:30px; background-color:#d8d3c9; line-height:1px; font-size:1px;">&nbsp;</div>
              </td>
            </tr>
            <tr>
              <td class="email-pad" style="padding:52px 48px 46px; background-color:#20201e; color:#f2efe8;">
                <div style="font-family:'Courier New', Courier, monospace; font-size:10px; line-height:16px; letter-spacing:0.2em; color:#d7b995;">NEW PROJECT</div>
                <div class="inquiry-title" style="padding-top:6px; font-family:Georgia, 'Times New Roman', serif; font-size:64px; font-weight:400; line-height:66px; letter-spacing:-0.035em; color:#f2efe8;">INQUIRY</div>
                <p style="max-width:470px; margin:22px 0 0; font-family:Arial, Helvetica, sans-serif; font-size:15px; line-height:24px; color:#b9b4aa;">You&rsquo;ve received a new inquiry from your website contact form.</p>

                <div style="height:1px; margin:42px 0 34px; background-color:#45443f; line-height:1px; font-size:1px;">&nbsp;</div>

                <div style="padding-bottom:16px; font-family:'Courier New', Courier, monospace; font-size:10px; line-height:16px; letter-spacing:0.18em; color:#d7b995;">INQUIRY DETAILS</div>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%; border-collapse:collapse;">
                  <tr>
                    <td class="detail-label" width="120" valign="top" style="width:120px; padding:18px 12px 18px 0; border-top:1px solid #45443f; font-family:'Courier New', Courier, monospace; font-size:10px; line-height:18px; letter-spacing:0.14em; color:#8f8b83;">NAME</td>
                    <td valign="top" style="padding:18px 0; border-top:1px solid #45443f; font-family:Arial, Helvetica, sans-serif; font-size:15px; line-height:22px; color:#f2efe8;">${safeName}</td>
                  </tr>
                  <tr>
                    <td class="detail-label" width="120" valign="top" style="width:120px; padding:18px 12px 18px 0; border-top:1px solid #45443f; border-bottom:1px solid #45443f; font-family:'Courier New', Courier, monospace; font-size:10px; line-height:18px; letter-spacing:0.14em; color:#8f8b83;">EMAIL</td>
                    <td valign="top" style="padding:18px 0; border-top:1px solid #45443f; border-bottom:1px solid #45443f; font-family:Arial, Helvetica, sans-serif; font-size:15px; line-height:22px; color:#f2efe8; word-break:break-word;"><a href="${replyHref}" style="color:#f2efe8; text-decoration:none;">${safeEmail}</a></td>
                  </tr>
                </table>

                <div style="padding:38px 0 16px; font-family:'Courier New', Courier, monospace; font-size:10px; line-height:16px; letter-spacing:0.18em; color:#d7b995;">MESSAGE</div>
                <div style="padding:24px; border:1px solid #45443f; border-radius:2px; background-color:#292927; font-family:Arial, Helvetica, sans-serif; font-size:15px; line-height:25px; color:#dedad1; word-break:break-word;">${safeMessage}</div>

                <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin-top:30px; border-collapse:collapse;">
                  <tr>
                    <td style="border:1px solid #b99e7d; background-color:#20201e;">
                      <a href="${replyHref}" style="display:inline-block; padding:13px 18px; font-family:'Courier New', Courier, monospace; font-size:10px; line-height:16px; letter-spacing:0.15em; color:#e0c5a5; text-decoration:none;">REPLY TO INQUIRY &#8599;</a>
                    </td>
                  </tr>
                </table>

                <div style="height:1px; margin:44px 0 28px; background-color:#45443f; line-height:1px; font-size:1px;">&nbsp;</div>
                <div style="font-family:Arial, Helvetica, sans-serif; font-size:13px; font-weight:700; line-height:20px; letter-spacing:0.12em; color:#f2efe8;">EJ STUDIO</div>
                <div style="padding-top:5px; font-family:Arial, Helvetica, sans-serif; font-size:12px; line-height:20px; color:#8f8b83;">Batangas, Philippines</div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export async function sendContactMessage(
  formData: FormData,
): Promise<ContactActionResult> {
  const name = readTextField(formData, "name");
  const email = readTextField(formData, "email").toLowerCase();
  const message = readTextField(formData, "message");
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const contactEmail = process.env.CONTACT_EMAIL?.trim();
  const nameValid = isValidName(name);
  const emailValid = isValidEmail(email);
  const messageValid = isValidMessage(message);

  if (!nameValid || !emailValid || !messageValid) {
    return { success: false };
  }

  if (!apiKey || !contactEmail || !isValidEmail(contactEmail)) {
    console.error("Contact form email delivery failed.");
    return { success: false };
  }

  const emailText = [
    "New EJ STUDIO Inquiry",
    "",
    `Name: ${name}`,
    `Email: ${email}`,
    "",
    "Message:",
    message,
  ].join("\n");
  const emailHtml = createContactEmailHtml(name, email, message);

  try {
    if (process.env.NODE_ENV === "development") {
      console.log("CONTACT: sending email through Resend");
    }

    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: CONTACT_FROM_EMAIL,
      to: contactEmail,
      replyTo: email,
      subject: `EJ STUDIO \u2014 New Inquiry from ${name}`,
      html: emailHtml,
      text: emailText,
    });

    if (error) {
      console.error("Contact form email delivery failed.");
      return { success: false };
    }

    if (process.env.NODE_ENV === "development") {
      console.log("CONTACT: Resend accepted email");
    }

    return { success: true };
  } catch {
    console.error("Contact form email delivery failed.");
    return { success: false };
  }
}
