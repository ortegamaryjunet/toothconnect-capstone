const { Resend } = require('resend');

let resend = null;
if (process.env.RESEND_API_KEY && process.env.MOCK_EMAIL !== 'true') {
  resend = new Resend(process.env.RESEND_API_KEY);
}

async function sendEmail({ to, subject, html, text }) {
  if (process.env.MOCK_EMAIL === 'true') {
    console.log('\n=== MOCK EMAIL ===');
    console.log('To:', to);
    console.log('Subject:', subject);
    console.log('Text:', text);
    console.log('==================\n');
    return { mocked: true };
  }

  if (!resend) {
    throw new Error('Email service not configured');
  }

  const { data, error } = await resend.emails.send({
    from: process.env.RESEND_FROM,
    to,
    subject,
    html,
    text,
  });

  if (error) throw new Error(`Resend error: ${error.message}`);
  return data;
}

async function sendOTPEmail({ to, code, purpose }) {
  const purposeText = purpose === 'register'
    ? 'verify your email and complete registration'
    : 'reset your password';

  const subject = purpose === 'register'
    ? 'Verify your email'
    : 'Reset your password';

  const html = `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <h2>${subject}</h2>
      <p>Use this code to ${purposeText}:</p>
      <p style="font-size: 32px; font-weight: bold; letter-spacing: 4px; background: #f4f4f4; padding: 16px; text-align: center; border-radius: 8px;">${code}</p>
      <p style="color: #666; font-size: 14px;">This code expires in ${process.env.OTP_EXPIRES_MIN} minutes. If you did not request this, you can ignore this email.</p>
    </div>
  `;
  const text = `${subject}\n\nUse this code to ${purposeText}: ${code}\n\nThis code expires in ${process.env.OTP_EXPIRES_MIN} minutes.`;

  return sendEmail({ to, subject, html, text });
}

async function sendTempPasswordEmail({ to, name, tempPassword }) {
  const html = `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <h2>Your account is ready</h2>
      <p>Hi ${name},</p>
      <p>An admin has created your account. Use this temporary password to log in. You will be asked to set a new password on your first login.</p>
      <p style="font-size: 18px; font-weight: bold; background: #f4f4f4; padding: 12px; border-radius: 8px;">${tempPassword}</p>
    </div>
  `;
  const text = `Hi ${name},\n\nAn admin has created your account. Use this temporary password to log in: ${tempPassword}\n\nYou will be asked to set a new password on first login.`;

  return sendEmail({ to, subject: 'Your account is ready', html, text });
}

module.exports = { sendEmail, sendOTPEmail, sendTempPasswordEmail };