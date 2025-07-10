import nodemailer from 'nodemailer';
import { Registration, Kegiatan } from '@/types';

interface EmailConfig {
  from: string;
  host?: string;
  port?: number;
  secure?: boolean;
  auth?: {
    user: string;
    pass: string;
  };
}

// Email service configuration
const getEmailConfig = (): EmailConfig => {
  // Check which email service is configured
  if (process.env.SENDGRID_API_KEY) {
    return {
      from: process.env.SMTP_USER || 'noreply@example.com',
      host: 'smtp.sendgrid.net',
      port: 587,
      secure: false,
      auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY,
      },
    };
  }
  
  if (process.env.RESEND_API_KEY) {
    return {
      from: process.env.SMTP_USER || 'noreply@example.com',
      host: 'smtp.resend.com',
      port: 587,
      secure: false,
      auth: {
        user: 'resend',
        pass: process.env.RESEND_API_KEY,
      },
    };
  }
  
  // Default to SMTP configuration
  return {
    from: process.env.SMTP_USER || 'noreply@example.com',
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || '',
    },
  };
};

// Create transporter
const createTransporter = () => {
  const config = getEmailConfig();
  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: config.auth,
  });
};

// Email templates
const generateRegistrationConfirmationHTML = (
  registration: Registration,
  kegiatan: Kegiatan
): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Konfirmasi Pendaftaran Kegiatan</title>
        <style>
            body { font-family: 'Manrope', Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #181818; color: white; padding: 30px; text-align: center; }
            .content { padding: 30px; background: #f9f9f9; }
            .footer { background: #333; color: white; padding: 20px; text-align: center; }
            .button { display: inline-block; padding: 12px 24px; background: #d93529; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
            .details { background: white; padding: 20px; margin: 20px 0; border-radius: 5px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Konfirmasi Pendaftaran</h1>
            </div>
            <div class="content">
                <h2>Halo ${registration.name}!</h2>
                <p>Terima kasih telah mendaftar untuk kegiatan <strong>${kegiatan.title}</strong>.</p>
                
                <div class="details">
                    <h3>Detail Kegiatan:</h3>
                    <p><strong>Nama Kegiatan:</strong> ${kegiatan.title}</p>
                    <p><strong>Tanggal:</strong> ${new Date(kegiatan.startDate).toLocaleDateString('id-ID')} - ${new Date(kegiatan.endDate).toLocaleDateString('id-ID')}</p>
                    <p><strong>Lokasi:</strong> ${kegiatan.location}</p>
                    <p><strong>Status:</strong> ${kegiatan.status}</p>
                </div>
                
                <div class="details">
                    <h3>Detail Pendaftaran:</h3>
                    <p><strong>Nama:</strong> ${registration.name}</p>
                    <p><strong>Email:</strong> ${registration.email}</p>
                    <p><strong>No. Telepon:</strong> ${registration.phone}</p>
                    <p><strong>Tanggal Daftar:</strong> ${new Date(registration.registrationDate).toLocaleDateString('id-ID')}</p>
                    <p><strong>Status:</strong> ${registration.status}</p>
                </div>
                
                <p>Anda akan menerima konfirmasi lebih lanjut mengenai detail kegiatan melalui email ini.</p>
                
                <p>Jika Anda memiliki pertanyaan, silakan hubungi kami.</p>
            </div>
            <div class="footer">
                <p>&copy; ${new Date().getFullYear()} Project WJC. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
  `;
};

const generateRegistrationConfirmationText = (
  registration: Registration,
  kegiatan: Kegiatan
): string => {
  return `
Konfirmasi Pendaftaran Kegiatan

Halo ${registration.name}!

Terima kasih telah mendaftar untuk kegiatan "${kegiatan.title}".

Detail Kegiatan:
- Nama Kegiatan: ${kegiatan.title}
- Tanggal: ${new Date(kegiatan.startDate).toLocaleDateString('id-ID')} - ${new Date(kegiatan.endDate).toLocaleDateString('id-ID')}
- Lokasi: ${kegiatan.location}
- Status: ${kegiatan.status}

Detail Pendaftaran:
- Nama: ${registration.name}
- Email: ${registration.email}
- No. Telepon: ${registration.phone}
- Tanggal Daftar: ${new Date(registration.registrationDate).toLocaleDateString('id-ID')}
- Status: ${registration.status}

Anda akan menerima konfirmasi lebih lanjut mengenai detail kegiatan melalui email ini.

Jika Anda memiliki pertanyaan, silakan hubungi kami.

© ${new Date().getFullYear()} Project WJC. All rights reserved.
  `;
};

// Email sending functions
export const sendRegistrationConfirmation = async (
  registration: Registration,
  kegiatan: Kegiatan
): Promise<{ success: boolean; error?: string }> => {
  try {
    const transporter = createTransporter();
    const config = getEmailConfig();

    const mailOptions = {
      from: config.from,
      to: registration.email,
      subject: `Konfirmasi Pendaftaran: ${kegiatan.title}`,
      text: generateRegistrationConfirmationText(registration, kegiatan),
      html: generateRegistrationConfirmationHTML(registration, kegiatan),
    };

    await transporter.sendMail(mailOptions);
    console.log(`Registration confirmation sent to ${registration.email}`);
    
    return { success: true };
  } catch (error) {
    console.error('Error sending registration confirmation:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to send email' 
    };
  }
};

export const sendAdminNotification = async (
  registration: Registration,
  kegiatan: Kegiatan
): Promise<{ success: boolean; error?: string }> => {
  try {
    const transporter = createTransporter();
    const config = getEmailConfig();
    
    // Admin email should be configured in environment variables
    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) {
      console.warn('Admin email not configured, skipping notification');
      return { success: true };
    }

    const mailOptions = {
      from: config.from,
      to: adminEmail,
      subject: `New Registration: ${kegiatan.title}`,
      html: `
        <h2>New Registration Received</h2>
        <p><strong>Kegiatan:</strong> ${kegiatan.title}</p>
        <p><strong>Participant:</strong> ${registration.name}</p>
        <p><strong>Email:</strong> ${registration.email}</p>
        <p><strong>Phone:</strong> ${registration.phone}</p>
        <p><strong>Registration Date:</strong> ${new Date(registration.registrationDate).toLocaleString('id-ID')}</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Admin notification sent for registration: ${registration.email}`);
    
    return { success: true };
  } catch (error) {
    console.error('Error sending admin notification:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to send admin notification' 
    };
  }
};

// Test email configuration
export const testEmailConfiguration = async (): Promise<{ success: boolean; error?: string }> => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('Email configuration is valid');
    return { success: true };
  } catch (error) {
    console.error('Email configuration test failed:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Email configuration invalid' 
    };
  }
};