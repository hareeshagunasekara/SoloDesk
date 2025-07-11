const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // Use Gmail App Password
    },
  });
};

// Generate reset token
const generateResetToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Send password reset email
const sendResetEmail = async (email, resetToken, userName = 'User') => {
  try {
    const transporter = createTransporter();
    
    // Create reset link
    const resetLink = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;
    
    // Email template
    const mailOptions = {
      from: `"SoloDesk" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Reset Your SoloDesk Password',
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Password</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f4f4f4;
            }
            .container {
              background-color: white;
              padding: 40px;
              border-radius: 10px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .logo {
              font-size: 28px;
              font-weight: bold;
              color: #210B2C;
              margin-bottom: 10px;
            }
            .title {
              color: #210B2C;
              font-size: 24px;
              margin-bottom: 20px;
            }
            .content {
              margin-bottom: 30px;
            }
            .button {
              display: inline-block;
              background: linear-gradient(135deg, #FFD166 0%, #BC96E6 100%);
              color: #210B2C;
              padding: 15px 30px;
              text-decoration: none;
              border-radius: 8px;
              font-weight: bold;
              font-size: 16px;
              margin: 20px 0;
              text-align: center;
            }
            .button:hover {
              background: linear-gradient(135deg, #BC96E6 0%, #FFD166 100%);
            }
            .warning {
              background-color: #fff3cd;
              border: 1px solid #ffeaa7;
              color: #856404;
              padding: 15px;
              border-radius: 5px;
              margin: 20px 0;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #eee;
              color: #666;
              font-size: 14px;
            }
            .link {
              color: #BC96E6;
              text-decoration: none;
            }
            .link:hover {
              text-decoration: underline;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">SoloDesk</div>
            </div>
            
            <div class="content">
              <h1 class="title">Reset Your Password</h1>
              
              <p>Hello ${userName},</p>
              
              <p>We received a request to reset your password for your SoloDesk account. If you didn't make this request, you can safely ignore this email.</p>
              
              <p>To reset your password, click the button below:</p>
              
              <div style="text-align: center;">
                <a href="${resetLink}" class="button">Reset Password</a>
              </div>
              
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #BC96E6;">${resetLink}</p>
              
              <div class="warning">
                <strong>Important:</strong> This link will expire in 1 hour for security reasons. If you need to reset your password after that, please request a new link.
              </div>
              
              <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
            </div>
            
            <div class="footer">
              <p>Best regards,<br>The SoloDesk Team</p>
              <p>This is an automated email. Please do not reply to this message.</p>
              <p>
                <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}" class="link">Visit SoloDesk</a> | 
                <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/support" class="link">Support</a>
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Reset Your SoloDesk Password
        
        Hello ${userName},
        
        We received a request to reset your password for your SoloDesk account. If you didn't make this request, you can safely ignore this email.
        
        To reset your password, visit this link:
        ${resetLink}
        
        This link will expire in 1 hour for security reasons.
        
        Best regards,
        The SoloDesk Team
      `
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent:', info.messageId);
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
};

// Send welcome email
const sendWelcomeEmail = async (email, userName) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"SoloDesk" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Welcome to SoloDesk!',
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to SoloDesk</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f4f4f4;
            }
            .container {
              background-color: white;
              padding: 40px;
              border-radius: 10px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .logo {
              font-size: 28px;
              font-weight: bold;
              color: #210B2C;
              margin-bottom: 10px;
            }
            .title {
              color: #210B2C;
              font-size: 24px;
              margin-bottom: 20px;
            }
            .button {
              display: inline-block;
              background: linear-gradient(135deg, #FFD166 0%, #BC96E6 100%);
              color: #210B2C;
              padding: 15px 30px;
              text-decoration: none;
              border-radius: 8px;
              font-weight: bold;
              font-size: 16px;
              margin: 20px 0;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #eee;
              color: #666;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">SoloDesk</div>
            </div>
            
            <h1 class="title">Welcome to SoloDesk!</h1>
            
            <p>Hello ${userName},</p>
            
            <p>Welcome to SoloDesk! We're excited to have you on board. SoloDesk is your all-in-one solution for managing your freelance business.</p>
            
            <p>With SoloDesk, you can:</p>
            <ul>
              <li>Manage clients and projects</li>
              <li>Track time and create invoices</li>
              <li>Schedule appointments and meetings</li>
              <li>Analyze your business performance</li>
            </ul>
            
            <div style="text-align: center;">
              <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/login" class="button">Get Started</a>
            </div>
            
            <p>If you have any questions or need help getting started, don't hesitate to reach out to our support team.</p>
            
            <div class="footer">
              <p>Best regards,<br>The SoloDesk Team</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Welcome email sent:', info.messageId);
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    throw new Error('Failed to send welcome email');
  }
};

// Verify email configuration
const verifyEmailConfig = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('Email configuration is valid');
    return true;
  } catch (error) {
    console.error('Email configuration error:', error);
    return false;
  }
};

module.exports = {
  sendResetEmail,
  sendWelcomeEmail,
  generateResetToken,
  verifyEmailConfig
}; 