import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // For development, you can use Ethereal (fake SMTP service for testing)
    // Or use your own SMTP credentials
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      // For development, if no SMTP credentials, use Ethereal
      ...(!process.env.SMTP_USER && {
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: 'ethereal.user@ethereal.email',
          pass: 'ethereal.password',
        },
      }),
    });
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    try {
      const mailOptions = {
        from: process.env.SMTP_FROM || 'noreply@powerafric.ng',
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text || options.html.replace(/<[^>]*>/g, ''),
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('📧 Email sent:', info.messageId);
      
      // If using Ethereal, log the preview URL
      if (process.env.SMTP_HOST === 'smtp.ethereal.email') {
        console.log('📧 Preview URL:', nodemailer.getTestMessageUrl(info));
      }
    } catch (error) {
      console.error('❌ Email sending failed:', error);
      throw error;
    }
  }

  async sendPasswordResetEmail(to: string, resetLink: string, firstName?: string): Promise<void> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; padding: 20px 0; border-bottom: 2px solid #1a2a8a; }
          .logo { font-size: 24px; font-weight: bold; color: #1a2a8a; }
          .content { padding: 30px 0; }
          .button {
            display: inline-block;
            padding: 12px 30px;
            background: linear-gradient(to right, #1a2a8a, #40b553);
            color: white !important;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            margin: 20px 0;
          }
          .button:hover { opacity: 0.9; }
          .footer { text-align: center; padding: 20px 0; border-top: 1px solid #eee; color: #999; font-size: 12px; }
          .warning { color: #666; font-size: 14px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🔐 Power Afric Energy</div>
          </div>
          <div class="content">
            <h2>Password Reset Request</h2>
            <p>Hello ${firstName || 'User'},</p>
            <p>We received a request to reset your password for your Power Afric Energy account.</p>
            <p>Click the button below to create a new password:</p>
            <div style="text-align: center;">
              <a href="${resetLink}" class="button">Reset Password</a>
            </div>
            <p class="warning">🔒 This link will expire in 1 hour for security reasons.</p>
            <p>If you didn't request a password reset, please ignore this email or contact support.</p>
          </div>
          <div class="footer">
            <p>Power Afric Energy Services LTD</p>
            <p>B3&B4 Khalil Rahman Complex, GRA, Katsina</p>
            <p>08033666041 • sales@powerafric.ng</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendEmail({
      to,
      subject: '🔐 Reset Your Password - Power Afric Energy',
      html,
    });
  }
}

// Singleton instance
export const emailService = new EmailService();
