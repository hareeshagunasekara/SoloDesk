const nodemailer = require("nodemailer");
const crypto = require("crypto");

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // Use Gmail App Password
    },
  });
};

// Generate reset token
const generateResetToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

// Send password reset email
const sendResetEmail = async (email, resetToken, userName = "User") => {
  try {
    const transporter = createTransporter();

    // Create reset link
    const resetLink = `${process.env.CLIENT_URL || "http://localhost:5173"}/reset-password/${resetToken}`;

    // Email template with new SoloDesk gray theme
    const mailOptions = {
      from: `"SoloDesk" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Reset Your SoloDesk Password",
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Password</title>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6;
              color: #364153;
              background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
              padding: 20px;
              min-height: 100vh;
            }
            
            .email-container {
              max-width: 600px;
              margin: 0 auto;
              background: white;
              border-radius: 16px;
              overflow: hidden;
              box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
              border: 1px solid #e5e7eb;
            }
            
            .header {
              background: linear-gradient(135deg, #1e2939 0%, #364153 100%);
              padding: 40px 30px;
              text-align: center;
              position: relative;
            }
            
            .header::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="75" cy="75" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="50" cy="10" r="0.5" fill="rgba(255,255,255,0.1)"/><circle cx="10" cy="60" r="0.5" fill="rgba(255,255,255,0.1)"/><circle cx="90" cy="40" r="0.5" fill="rgba(255,255,255,0.1)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
              opacity: 0.3;
            }
            
            .logo {
              font-size: 32px;
              font-weight: 800;
              color: white;
              margin-bottom: 8px;
              position: relative;
              z-index: 1;
              letter-spacing: -0.02em;
            }
            
            .tagline {
              color: #d1d5dc;
              font-size: 16px;
              font-weight: 500;
              position: relative;
              z-index: 1;
            }
            
            .content {
              padding: 40px 30px;
            }
            
            .title {
              color: #1e2939;
              font-size: 28px;
              font-weight: 700;
              margin-bottom: 24px;
              text-align: center;
              letter-spacing: -0.02em;
            }
            
            .greeting {
              font-size: 18px;
              color: #4a5565;
              margin-bottom: 20px;
              font-weight: 500;
            }
            
            .message {
              font-size: 16px;
              color: #6a7282;
              margin-bottom: 32px;
              line-height: 1.7;
            }
            
            .button-container {
              text-align: center;
              margin: 32px 0;
            }
            
            .button {
              display: inline-block;
              background: linear-gradient(135deg, #1e2939 0%, #364153 100%);
              color: white;
              padding: 16px 32px;
              text-decoration: none;
              border-radius: 12px;
              font-weight: 600;
              font-size: 16px;
              transition: all 0.3s ease;
              box-shadow: 0 4px 12px rgba(30, 41, 57, 0.3);
              position: relative;
              overflow: hidden;
            }
            
            .button::before {
              content: '';
              position: absolute;
              top: 0;
              left: -100%;
              width: 100%;
              height: 100%;
              background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
              transition: left 0.5s;
            }
            
            .button:hover::before {
              left: 100%;
            }
            
            .button:hover {
              transform: translateY(-2px);
              box-shadow: 0 8px 20px rgba(30, 41, 57, 0.4);
            }
            
            .link-section {
              background: #f9fafb;
              border: 1px solid #e5e7eb;
              border-radius: 12px;
              padding: 20px;
              margin: 24px 0;
            }
            
            .link-label {
              font-size: 14px;
              color: #6a7282;
              margin-bottom: 8px;
              font-weight: 500;
            }
            
            .reset-link {
              font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
              font-size: 13px;
              color: #1e2939;
              background: white;
              padding: 12px;
              border-radius: 8px;
              border: 1px solid #d1d5dc;
              word-break: break-all;
              line-height: 1.4;
            }
            
            .warning {
              background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
              border: 1px solid #f59e0b;
              color: #92400e;
              padding: 20px;
              border-radius: 12px;
              margin: 24px 0;
              position: relative;
            }
            
            .warning::before {
              content: '⚠️';
              position: absolute;
              top: 20px;
              left: 20px;
              font-size: 20px;
            }
            
            .warning-content {
              margin-left: 40px;
            }
            
            .warning strong {
              display: block;
              margin-bottom: 8px;
              font-weight: 600;
            }
            
            .footer {
              background: #f9fafb;
              padding: 30px;
              text-align: center;
              border-top: 1px solid #e5e7eb;
            }
            
            .footer-text {
              color: #6a7282;
              font-size: 14px;
              margin-bottom: 16px;
              line-height: 1.6;
            }
            
            .footer-links {
              display: flex;
              justify-content: center;
              gap: 24px;
              margin-top: 16px;
            }
            
            .footer-link {
              color: #1e2939;
              text-decoration: none;
              font-weight: 500;
              font-size: 14px;
              transition: color 0.3s ease;
            }
            
            .footer-link:hover {
              color: #364153;
            }
            
            .divider {
              color: #d1d5dc;
            }
            
            @media (max-width: 600px) {
              body {
                padding: 10px;
              }
              
              .email-container {
                border-radius: 12px;
              }
              
              .header {
                padding: 30px 20px;
              }
              
              .content {
                padding: 30px 20px;
              }
              
              .title {
                font-size: 24px;
              }
              
              .button {
                padding: 14px 28px;
                font-size: 15px;
              }
              
              .footer-links {
                flex-direction: column;
                gap: 12px;
              }
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="header">
              <div class="logo">SoloDesk</div>
              <div class="tagline">Your Solo Business, Simplified</div>
            </div>
            
            <div class="content">
              <h1 class="title">Reset Your Password</h1>
              
              <p class="greeting">Hello ${userName},</p>
              
              <p class="message">
                We received a request to reset your password for your SoloDesk account. If you didn't make this request, you can safely ignore this email.
              </p>
              
              <p class="message">
                To reset your password, click the button below:
              </p>
              
              <div class="button-container">
                <a href="${resetLink}" class="button">Reset Password</a>
              </div>
              
              <div class="link-section">
                <div class="link-label">Or copy and paste this link into your browser:</div>
                <div class="reset-link">${resetLink}</div>
              </div>
              
              <div class="warning">
                <div class="warning-content">
                  <strong>Important Security Notice</strong>
                  This link will expire in 1 hour for security reasons. If you need to reset your password after that, please request a new link.
                </div>
              </div>
              
              <p class="message">
                If you have any questions or need assistance, please don't hesitate to contact our support team.
              </p>
            </div>
            
            <div class="footer">
              <p class="footer-text">
                Best regards,<br>
                <strong>The SoloDesk Team</strong>
              </p>
              <p class="footer-text">
                This is an automated email. Please do not reply to this message.
              </p>
              <div class="footer-links">
                <a href="${process.env.CLIENT_URL || "http://localhost:5173"}" class="footer-link">Visit SoloDesk</a>
                <span class="divider">•</span>
                <a href="${process.env.CLIENT_URL || "http://localhost:5173"}/support" class="footer-link">Support</a>
                <span class="divider">•</span>
                <a href="${process.env.CLIENT_URL || "http://localhost:5173"}/help" class="footer-link">Help Center</a>
              </div>
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
        
        Visit SoloDesk: ${process.env.CLIENT_URL || "http://localhost:5173"}
        Support: ${process.env.CLIENT_URL || "http://localhost:5173"}/support
      `,
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log("Password reset email sent:", info.messageId);

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw new Error("Failed to send password reset email");
  }
};

// Send welcome email
const sendWelcomeEmail = async (email, userName) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"SoloDesk" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Welcome to SoloDesk!",
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to SoloDesk</title>
          <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
          <style>
            body {
              font-family: 'Montserrat', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
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
              <a href="${process.env.CLIENT_URL || "http://localhost:5173"}/login" class="button">Get Started</a>
            </div>
            
            <p>If you have any questions or need help getting started, don't hesitate to reach out to our support team.</p>
            
            <div class="footer">
              <p>Best regards,<br>The SoloDesk Team</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Welcome email sent:", info.messageId);

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending welcome email:", error);
    throw new Error("Failed to send welcome email");
  }
};

// Verify email configuration
const verifyEmailConfig = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log("Email configuration is valid");
    return true;
  } catch (error) {
    console.error("Email configuration error:", error);
    return false;
  }
};

module.exports = {
  sendResetEmail,
  sendWelcomeEmail,
  generateResetToken,
  verifyEmailConfig,
};
