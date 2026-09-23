require('dotenv').config();
const nodemailer = require('nodemailer');

function createTransporter() {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '587');
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass }
  });
}

async function sendBookingEmails(bookingDetails) {
  const transporter = createTransporter();
  const rawSmtpUser = (process.env.SMTP_USER || '').trim();
  const smtpUser = rawSmtpUser || 'harshsharma7738@gmail.com';
  const rawFromName = (process.env.SMTP_FROM || 'The Style Room').replace(/^"|"$/g, '').trim();
  const fromEmail = `"${rawFromName}" <${smtpUser}>`;
  const targetAdminEmail = (process.env.SALON_ADMIN_EMAIL || 'harshsharma7738@gmail.com').trim();

  const { customerName, email, phone, service, stylist, date, time, notes, type } = bookingDetails;
  const cleanCustomerEmail = (email || '').trim();
  const isHomeService = type === 'home_service';
  const bookingTypeTitle = isHomeService ? 'Home Service Booking' : 'Salon Appointment';

  // HTML Email Body
  const htmlContent = `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9ff; padding: 24px; border-radius: 16px; border: 1px solid #e2e8f0;">
      <div style="text-align: center; padding-bottom: 20px; border-bottom: 2px solid #43664c;">
        <h1 style="color: #43664c; margin: 0; font-size: 24px;">🌸 The Style Room</h1>
        <p style="color: #64748b; margin: 4px 0 0 0; font-size: 14px;">Premium Salon & Home Services</p>
      </div>

      <div style="padding: 24px 0; border-bottom: 1px solid #e2e8f0;">
        <h2 style="color: #1e293b; font-size: 18px; margin-top: 0;">${bookingTypeTitle} Request Confirmed!</h2>
        <p style="color: #475569; font-size: 15px; line-height: 1.6;">Hello <strong>${customerName}</strong>, thank you for booking with <strong>The Style Room</strong>. Here are your booking details:</p>
        
        <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
          <tr>
            <td style="padding: 8px 12px; background: #ffffff; font-weight: bold; color: #475569; width: 35%;">Booking Type:</td>
            <td style="padding: 8px 12px; background: #ffffff; color: #0f172a;">${bookingTypeTitle}</td>
          </tr>
          <tr>
            <td style="padding: 8px 12px; background: #f1f5f9; font-weight: bold; color: #475569;">Service:</td>
            <td style="padding: 8px 12px; background: #f1f5f9; color: #43664c; font-weight: bold;">${service}</td>
          </tr>
          <tr>
            <td style="padding: 8px 12px; background: #ffffff; font-weight: bold; color: #475569;">Stylist:</td>
            <td style="padding: 8px 12px; background: #ffffff; color: #0f172a;">${stylist || 'Any Available Specialist'}</td>
          </tr>
          <tr>
            <td style="padding: 8px 12px; background: #f1f5f9; font-weight: bold; color: #475569;">Date & Time:</td>
            <td style="padding: 8px 12px; background: #f1f5f9; color: #0f172a;">${date} (${time || 'Home Visit'})</td>
          </tr>
          <tr>
            <td style="padding: 8px 12px; background: #ffffff; font-weight: bold; color: #475569;">Contact Phone:</td>
            <td style="padding: 8px 12px; background: #ffffff; color: #0f172a;">${phone}</td>
          </tr>
          ${notes ? `
          <tr>
            <td style="padding: 8px 12px; background: #f1f5f9; font-weight: bold; color: #475569;">Address / Notes:</td>
            <td style="padding: 8px 12px; background: #f1f5f9; color: #0f172a;">${notes}</td>
          </tr>
          ` : ''}
        </table>
      </div>

      <div style="padding-top: 20px; text-align: center; color: #94a3b8; font-size: 13px;">
        <p style="margin: 0;">The Style Room • Salon & Home Doorstep Services</p>
        <p style="margin: 4px 0 0 0;">Questions? Reply directly to this email or call support.</p>
      </div>
    </div>
  `;

  if (!transporter) {
    console.log('📧 [Mail Log Simulation - SMTP credentials not set]');
    console.log(`To: ${targetAdminEmail}`);
    console.log(`Subject: 🔔 NEW ${isHomeService ? 'HOME SERVICE' : 'SALON'} BOOKING: ${customerName} - ${service}`);
    return { sent: false, reason: 'SMTP not configured. Add SMTP_USER & SMTP_PASS in .env' };
  }

  const mailOptionsAdmin = {
    from: fromEmail,
    to: targetAdminEmail,
    subject: `🔔 NEW ${isHomeService ? 'HOME SERVICE' : 'SALON'} BOOKING: ${customerName} - ${service}`,
    html: htmlContent
  };

  try {
    const adminSend = await transporter.sendMail(mailOptionsAdmin);
    console.log('✅ Booking email sent to admin (harshsharma7738@gmail.com):', adminSend.messageId || 'OK');
    return { sent: true };
  } catch (err) {
    console.error('❌ Error sending emails via Nodemailer:', err.message);
    return { sent: false, error: err.message };
  }
}

module.exports = { sendBookingEmails };
