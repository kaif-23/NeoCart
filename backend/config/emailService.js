import nodemailer from 'nodemailer';

// Create reusable transporter
const createTransporter = () => {
    // For development: Use ethereal.email or Gmail
    // For production: Use SendGrid, AWS SES, or other service

    if (process.env.EMAIL_SERVICE === 'gmail') {
        return nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS // Use App Password, not regular password
            }
        });
    }

    // Default: Log to console in development
    return nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        auth: {
            user: process.env.EMAIL_USER || 'test@ethereal.email',
            pass: process.env.EMAIL_PASS || 'test123'
        }
    });
};

// Send password reset email
export const sendPasswordResetEmail = async (email, resetToken, userName) => {
    try {
        const transporter = createTransporter();

        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;

        const mailOptions = {
            from: `"${process.env.APP_NAME || 'NeoCart'}" <${process.env.EMAIL_FROM || 'noreply@neocart.com'}>`,
            to: email,
            subject: 'Password Reset Request',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: #007bff; color: white; padding: 20px; text-align: center; }
                        .content { background: #f9f9f9; padding: 30px; border-radius: 5px; margin: 20px 0; }
                        .button { display: inline-block; padding: 12px 30px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                        .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
                        .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 10px; margin: 15px 0; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>Password Reset Request</h1>
                        </div>
                        <div class="content">
                            <p>Hi ${userName},</p>
                            <p>You recently requested to reset your password for your NeoCart account. Click the button below to reset it:</p>
                            <div style="text-align: center;">
                                <a href="${resetUrl}" class="button">Reset Password</a>
                            </div>
                            <p>Or copy and paste this link into your browser:</p>
                            <p style="word-break: break-all; color: #007bff;">${resetUrl}</p>
                            <div class="warning">
                                <strong>⚠️ Security Notice:</strong>
                                <ul>
                                    <li>This link will expire in <strong>30 minutes</strong></li>
                                    <li>If you didn't request this, please ignore this email</li>
                                    <li>Your password won't change until you create a new one</li>
                                </ul>
                            </div>
                        </div>
                        <div class="footer">
                            <p>This is an automated email. Please do not reply.</p>
                            <p>&copy; ${new Date().getFullYear()} NeoCart. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        const info = await transporter.sendMail(mailOptions);

        // Log in development
        if (process.env.NODE_ENV !== 'production') {
            console.log('✅ Password reset email sent:', info.messageId);
            console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
        }

        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Email sending failed:', error);
        return { success: false, error: error.message };
    }
};

// Send welcome email (optional - for future use)
export const sendWelcomeEmail = async (email, userName) => {
    try {
        const transporter = createTransporter();

        const mailOptions = {
            from: `"${process.env.APP_NAME || 'NeoCart'}" <${process.env.EMAIL_FROM || 'noreply@neocart.com'}>`,
            to: email,
            subject: 'Welcome to NeoCart!',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: #28a745; color: white; padding: 20px; text-align: center; }
                        .content { background: #f9f9f9; padding: 30px; border-radius: 5px; margin: 20px 0; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>Welcome to NeoCart! 🎉</h1>
                        </div>
                        <div class="content">
                            <p>Hi ${userName},</p>
                            <p>Thank you for joining NeoCart! We're excited to have you.</p>
                            <p>Start exploring our amazing collection of products and enjoy shopping!</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        await transporter.sendMail(mailOptions);
        return { success: true };
    } catch (error) {
        console.error('❌ Welcome email failed:', error);
        return { success: false, error: error.message };
    }
};
