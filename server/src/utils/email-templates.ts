const BRAND = {
  name: 'Expense Tracker',
  tagline: 'Track spending. Split bills. Stay in control.',
  navy: '#1c2a3a',
  navyDeep: '#101926',
  amber: '#e8a23d',
  amberSoft: '#fbeed9',
  ink: '#14181f',
  inkSoft: '#4a5263',
  surface: '#f6f5f1',
  line: '#e7e4dc',
  card: '#ffffff',
  green: '#2f8f5b',
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderLayout(content: string, preheader: string): string {
  const safePreheader = escapeHtml(preheader);
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>${escapeHtml(BRAND.name)}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
</head>
<body style="margin:0;padding:0;background-color:${BRAND.surface};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${safePreheader}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:${BRAND.surface};">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px;width:100%;background-color:${BRAND.card};border-radius:16px;overflow:hidden;border:1px solid ${BRAND.line};box-shadow:0 8px 24px -12px rgba(20,24,31,0.12);">
          <tr>
            <td style="background:linear-gradient(135deg, ${BRAND.navyDeep} 0%, ${BRAND.navy} 70%);padding:24px 28px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="width:40px;height:40px;background-color:${BRAND.amber};border-radius:10px;text-align:center;vertical-align:middle;font-size:15px;font-weight:700;color:${BRAND.navyDeep};font-family:Georgia,'Times New Roman',serif;">ET</td>
                  <td style="padding-left:14px;vertical-align:middle;">
                    <div style="font-size:18px;font-weight:700;color:#ffffff;letter-spacing:-0.02em;line-height:1.2;">${BRAND.name}</div>
                    <div style="font-size:11px;color:#9aa3b5;text-transform:uppercase;letter-spacing:0.08em;margin-top:3px;">${BRAND.tagline}</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          ${content}
          <tr>
            <td style="padding:20px 28px;background-color:${BRAND.surface};border-top:1px solid ${BRAND.line};text-align:center;">
              <p style="margin:0 0 6px;font-size:12px;color:${BRAND.inkSoft};line-height:1.5;">
                This is an automated message from <strong style="color:${BRAND.ink};">${BRAND.name}</strong>.
              </p>
              <p style="margin:0;font-size:11px;color:#8b94a8;">Designed by Leo</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function renderOtpBlock(otp: string): string {
  const safeOtp = escapeHtml(otp);
  return `
          <tr>
            <td style="padding:0 28px 8px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:${BRAND.amberSoft};border:1px solid ${BRAND.amber};border-radius:14px;">
                <tr>
                  <td style="padding:22px 20px;text-align:center;">
                    <div style="font-size:11px;font-weight:600;color:${BRAND.inkSoft};text-transform:uppercase;letter-spacing:0.1em;margin-bottom:10px;">Your verification code</div>
                    <div style="font-size:34px;font-weight:700;color:${BRAND.navy};letter-spacing:0.35em;font-family:'Courier New',Courier,monospace;line-height:1.2;">${safeOtp}</div>
                    <div style="font-size:12px;color:${BRAND.inkSoft};margin-top:12px;">Valid for a single use. Do not share this code.</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>`;
}

function renderInfoBox(lines: string[]): string {
  const rows = lines
    .map(
      (line) =>
        `<p style="margin:0 0 8px;font-size:14px;color:${BRAND.ink};line-height:1.55;">${line}</p>`,
    )
    .join('');
  return `
          <tr>
            <td style="padding:0 28px 8px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:${BRAND.surface};border:1px solid ${BRAND.line};border-radius:12px;">
                <tr>
                  <td style="padding:18px 20px;">${rows}</td>
                </tr>
              </table>
            </td>
          </tr>`;
}

export interface OtpEmailContent {
  subject: string;
  preheader: string;
  title: string;
  greeting: string;
  intro: string;
  otp: string;
  plainText: string;
  html: string;
}

export function buildOtpEmail(options: {
  subject: string;
  preheader: string;
  title: string;
  greeting: string;
  intro: string;
  otp: string;
  expiryNote?: string;
}): OtpEmailContent {
  const expiryNote =
    options.expiryNote ??
    'If you did not request this code, you can safely ignore this email.';
  const safeGreeting = escapeHtml(options.greeting);
  const safeIntro = escapeHtml(options.intro);
  const safeTitle = escapeHtml(options.title);

  const body = `
          <tr>
            <td style="padding:32px 28px 16px;">
              <h1 style="margin:0 0 12px;font-size:22px;font-weight:700;color:${BRAND.ink};letter-spacing:-0.02em;line-height:1.3;">${safeTitle}</h1>
              <p style="margin:0 0 10px;font-size:15px;color:${BRAND.ink};line-height:1.6;">${safeGreeting}</p>
              <p style="margin:0;font-size:14px;color:${BRAND.inkSoft};line-height:1.65;">${safeIntro}</p>
            </td>
          </tr>
          ${renderOtpBlock(options.otp)}
          <tr>
            <td style="padding:20px 28px 28px;">
              <p style="margin:0;font-size:13px;color:${BRAND.inkSoft};line-height:1.6;">${escapeHtml(expiryNote)}</p>
            </td>
          </tr>`;

  const plainText = `${options.title}

${options.greeting}

${options.intro}

Your verification code: ${options.otp}

Please do not share this code with anyone.
${expiryNote}

— ${BRAND.name}`;

  return {
    subject: options.subject,
    preheader: options.preheader,
    title: options.title,
    greeting: options.greeting,
    intro: options.intro,
    otp: options.otp,
    plainText,
    html: renderLayout(body, options.preheader),
  };
}

export interface WelcomeEmailContent {
  subject: string;
  preheader: string;
  plainText: string;
  html: string;
}

export function buildWelcomeCredentialsEmail(options: {
  email: string;
  password: string;
}): WelcomeEmailContent {
  const safeEmail = escapeHtml(options.email);
  const safePassword = escapeHtml(options.password);
  const subject = 'Welcome to Expense Tracker';
  const preheader =
    'Your account has been created. Sign in with the credentials below.';

  const body = `
          <tr>
            <td style="padding:32px 28px 16px;">
              <h1 style="margin:0 0 12px;font-size:22px;font-weight:700;color:${BRAND.ink};letter-spacing:-0.02em;line-height:1.3;">Welcome aboard</h1>
              <p style="margin:0 0 10px;font-size:15px;color:${BRAND.ink};line-height:1.6;">Hi there,</p>
              <p style="margin:0;font-size:14px;color:${BRAND.inkSoft};line-height:1.65;">
                You have been added to a group on <strong style="color:${BRAND.ink};">${BRAND.name}</strong>.
                Use the login details below to sign in and update your profile.
              </p>
            </td>
          </tr>
          ${renderInfoBox([
            `<strong style="color:${BRAND.navy};">Email:</strong> ${safeEmail}`,
            `<strong style="color:${BRAND.navy};">Temporary password:</strong> <span style="font-family:'Courier New',Courier,monospace;font-size:15px;">${safePassword}</span>`,
          ])}
          <tr>
            <td style="padding:16px 28px 28px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#e6f4ec;border:1px solid ${BRAND.green};border-radius:12px;">
                <tr>
                  <td style="padding:14px 18px;font-size:13px;color:${BRAND.green};line-height:1.55;">
                    <strong>Security tip:</strong> Change your password after your first login and complete your profile information.
                  </td>
                </tr>
              </table>
            </td>
          </tr>`;

  const plainText = `Welcome to ${BRAND.name}

You have been added to a group. Sign in with:

Email: ${options.email}
Temporary password: ${options.password}

Please change your password after your first login.

— ${BRAND.name}`;

  return {
    subject,
    preheader,
    plainText,
    html: renderLayout(body, preheader),
  };
}
