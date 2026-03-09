import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import ReviewTokenService from '../Utils/reviewToken.js';
import SendGridService from './sendgridService.js';

dotenv.config();

class EmailService {
    constructor() {
        this.isConnectionVerified = false;
        this.connectionError = null;
        
        // Check if SendGrid is available (preferred for production)
        this.useSendGrid = !!process.env.SENDGRID_API_KEY;
        
        if (this.useSendGrid) {
            console.log('📧 Using SendGrid for email delivery');
        } else {
            // Using SMTP (Gmail)
            this.createTransporter();
            this.verifyConnection();
        }
    }

    createTransporter(useAlternativePort = false) {
        const port = useAlternativePort ? 465 : 587;
        const secure = useAlternativePort ? true : false;
        
        console.log(`Creating email transporter with port ${port} (secure: ${secure})`);
        
        this.transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: port,
            secure: secure, // true for 465, false for 587
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            },
            // Additional options for better reliability on production
            connectionTimeout: 60000, // 60 seconds (very generous for slow networks)
            greetingTimeout: 30000,
            socketTimeout: 60000,
            pool: true, // Use connection pooling
            maxConnections: 5, // Max concurrent connections
            maxMessages: 100, // Max messages per connection
            rateDelta: 1000, // Rate limiting
            rateLimit: 5, // Max 5 emails per second
            tls: {
                rejectUnauthorized: false, // More permissive for cloud platforms
                minVersion: 'TLSv1.2'
            },
            logger: false, // Disable in production
            debug: false // Disable in production
        });
    }

    // Verify SMTP connection (non-blocking)
    async verifyConnection() {
        try {
            await this.transporter.verify();
            this.isConnectionVerified = true;
            this.connectionError = null;
            console.log('✅ Email service is ready to send emails');
            return true;
        } catch (error) {
            this.isConnectionVerified = false;
            this.connectionError = error.message;
            console.error('❌ Email service connection failed:', error.message);
            console.error('   Please check EMAIL_USER and EMAIL_PASS in .env file');
            console.error('   Note: Connection will be retried when sending emails');
            
            // Don't throw error - allow app to start even if email fails
            return false;
        }
    }

    // Helper method to send email with retry logic and port fallback
    async sendMailWithRetry(mailOptions, maxRetries = 3) {
        // If SendGrid is configured, use it (works on Render)
        if (this.useSendGrid) {
            try {
                console.log(`📧 Sending email via SendGrid to: ${mailOptions.to}`);
                const result = await SendGridService.sendEmail(mailOptions);
                return result;
            } catch (error) {
                console.error('❌ SendGrid failed:', error.message);
                return { 
                    success: false, 
                    error: error.message,
                    provider: 'sendgrid'
                };
            }
        }
        
        // Otherwise use SMTP (works locally, may fail on Render)
        let lastError;
        
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                console.log(`Sending email to ${mailOptions.to} (attempt ${attempt}/${maxRetries})...`);
                
                // If first attempt fails and we haven't verified connection, try alternative port
                if (attempt === 2 && !this.isConnectionVerified) {
                    console.log('Trying alternative SMTP port configuration...');
                    this.createTransporter(true); // Try port 465
                }
                
                const info = await this.transporter.sendMail(mailOptions);
                console.log(`✅ Email sent successfully on attempt ${attempt}:`, info.messageId);
                this.isConnectionVerified = true;
                return { success: true, messageId: info.messageId, provider: 'smtp' };
            } catch (error) {
                lastError = error;
                console.error(`❌ Email send attempt ${attempt} failed:`, error.message);
                
                // Don't retry on authentication errors
                if (error.responseCode === 535 || error.message.includes('authentication') || error.message.includes('Invalid login')) {
                    console.error('🔒 Authentication error - check EMAIL_USER and EMAIL_PASS');
                    return { 
                        success: false, 
                        error: 'Email authentication failed. Please check your email credentials.',
                        provider: 'smtp'
                    };
                }
                
                // If connection timeout, try alternative configuration on next attempt
                if (error.code === 'ETIMEDOUT' || error.code === 'ECONNECTION') {
                    console.error('⏱️ Connection timeout - network or firewall issue');
                }
                
                // Wait before retrying (exponential backoff)
                if (attempt < maxRetries) {
                    const waitTime = Math.min(2000 * Math.pow(2, attempt - 1), 15000);
                    console.log(`⏳ Waiting ${waitTime}ms before retry...`);
                    await new Promise(resolve => setTimeout(resolve, waitTime));
                }
            }
        }
        
        // All retries failed
        console.error(`❌ All ${maxRetries} email send attempts failed`);
        console.error('Last error:', lastError.message);
        
        // Log helpful troubleshooting info
        if (lastError.code === 'ETIMEDOUT') {
            console.error('');
            console.error('🔧 SMTP BLOCKED ON RENDER - SOLUTION:');
            console.error('   1. Sign up for SendGrid: https://sendgrid.com/');
            console.error('   2. Get API key from SendGrid dashboard');
            console.error('   3. Add SENDGRID_API_KEY to Render environment variables');
            console.error('   4. Run: npm install @sendgrid/mail');
            console.error('   5. Redeploy your app');
            console.error('   See Event_backend/RENDER_EMAIL_FIX.md for details');
            console.error('');
        }
        
        // Return error info instead of throwing - allows app to continue
        return { 
            success: false, 
            error: lastError.message,
            code: lastError.code,
            provider: 'smtp',
            troubleshooting: 'SMTP blocked by Render. Use SendGrid instead - see RENDER_EMAIL_FIX.md'
        };
    }

    // Send OTP email to user
    async sendOTPEmail(emailData) {
        const { 
            userEmail, 
            userName, 
            otpCode, 
            vendorName, 
            eventDate, 
            expiresAt,
            bookingId 
        } = emailData;

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: userEmail,
            subject: `OTP Code for Your Booking Verification - ${vendorName}`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(135deg, #284b63, #3c6e71); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                        .otp-box { background: #fff; border: 3px solid #f9a826; padding: 20px; text-align: center; margin: 20px 0; border-radius: 10px; }
                        .otp-code { font-size: 36px; font-weight: bold; color: #284b63; letter-spacing: 8px; }
                        .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
                        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
                        .btn { display: inline-block; background: #f9a826; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🔐 Booking Verification Required</h1>
                            <p>Your OTP code for booking verification</p>
                        </div>
                        
                        <div class="content">
                            <h2>Hello ${userName}!</h2>
                            
                            <p>Your booking with <strong>${vendorName}</strong> for <strong>${new Date(eventDate).toLocaleDateString('en-US', { 
                                weekday: 'long', 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                            })}</strong> has been approved!</p>
                            
                            <p>Please share the following OTP code with your vendor to complete the verification process:</p>
                            
                            <div class="otp-box">
                                <div class="otp-code">${otpCode}</div>
                                <p style="margin: 10px 0 0 0; color: #666;">Your 6-digit verification code</p>
                            </div>
                            
                            <div class="warning">
                                <strong>⚠️ Important Security Information:</strong>
                                <ul style="margin: 10px 0;">
                                    <li>This OTP expires at <strong>${new Date(expiresAt).toLocaleString()}</strong></li>
                                    <li>Only share this code with <strong>${vendorName}</strong> at the time of service</li>
                                    <li>Never share this code with anyone else</li>
                                    <li>Our team will never ask for this code</li>
                                </ul>
                            </div>
                            
                            <h3>📋 Booking Details:</h3>
                            <ul>
                                <li><strong>Booking ID:</strong> #${bookingId}</li>
                                <li><strong>Vendor:</strong> ${vendorName}</li>
                                <li><strong>Event Date:</strong> ${new Date(eventDate).toLocaleDateString('en-US', { 
                                    weekday: 'long', 
                                    year: 'numeric', 
                                    month: 'long', 
                                    day: 'numeric' 
                                })}</li>
                                <li><strong>OTP Expires:</strong> ${new Date(expiresAt).toLocaleString()}</li>
                            </ul>
                            
                            <p>If you have any questions or concerns, please contact our support team.</p>
                        </div>
                        
                        <div class="footer">
                            <p>This is an automated message from GoEventify. Please do not reply to this email.</p>
                            <p>&copy; ${new Date().getFullYear()} GoEventify. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        try {
            return await this.sendMailWithRetry(mailOptions);
        } catch (error) {
            console.error('Error sending OTP email:', error);
            throw error;
        }
    }

    // Send booking confirmation email after OTP verification (work completed)
    async sendWorkCompletionEmail(emailData) {
        const { 
            userEmail, 
            userName, 
            vendorName, 
            eventDate, 
            packageName,
            bookingId 
        } = emailData;

        // Generate secure review token
        const reviewToken = ReviewTokenService.generateReviewToken(bookingId, userEmail);
        const reviewLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/review/${bookingId}?token=${reviewToken}`;
        
        console.log('Generated review token for booking:', bookingId, 'user:', userEmail);
        console.log('Review link:', reviewLink);

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: userEmail,
            subject: `Service Completed! Share Your Experience - ${vendorName} 🌟`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(135deg, #28a745, #20c997); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                        .success-box { background: #d4edda; border: 2px solid #28a745; padding: 20px; text-align: center; margin: 20px 0; border-radius: 10px; }
                        .review-box { background: #fff; border: 3px solid #f9a826; padding: 20px; text-align: center; margin: 20px 0; border-radius: 10px; }
                        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
                        .btn { display: inline-block; background: #f9a826; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; margin: 15px 0; font-weight: bold; font-size: 16px; }
                        .btn:hover { background: #e67e22; }
                        .stars { color: #f9a826; font-size: 24px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🎉 Service Completed Successfully!</h1>
                            <p>Your event booking has been completed</p>
                        </div>
                        
                        <div class="content">
                            <h2>Congratulations ${userName}!</h2>
                            
                            <div class="success-box">
                                <h3 style="color: #28a745; margin: 0;">✅ OTP Verification Successful</h3>
                                <p style="margin: 10px 0 0 0;">Your service with ${vendorName} has been completed and verified!</p>
                            </div>
                            
                            <h3>📋 Completed Service Details:</h3>
                            <ul>
                                <li><strong>Booking ID:</strong> #${bookingId}</li>
                                <li><strong>Vendor:</strong> ${vendorName}</li>
                                <li><strong>Package:</strong> ${packageName}</li>
                                <li><strong>Event Date:</strong> ${new Date(eventDate).toLocaleDateString('en-US', { 
                                    weekday: 'long', 
                                    year: 'numeric', 
                                    month: 'long', 
                                    day: 'numeric' 
                                })}</li>
                                <li><strong>Status:</strong> Completed ✅</li>
                            </ul>
                            
                            <div class="review-box">
                                <div class="stars">⭐⭐⭐⭐⭐</div>
                                <h3 style="color: #f9a826; margin: 15px 0;">How was your experience?</h3>
                                <p style="margin: 10px 0;">Help others by sharing your review!</p>
                                
                                <div style="text-align: center; margin: 20px 0;">
                                    <a href="${reviewLink}" class="btn">
                                        ⭐ Write Your Review
                                    </a>
                                </div>
                            </div>
                            
                            <p><strong>What's Next?</strong></p>
                            <ul>
                                <li>Save this confirmation email for your records</li>
                                <li>Share your experience by leaving a review</li>
                                <li>Book ${vendorName} again for future events</li>
                                <li>Recommend us to friends and family</li>
                            </ul>
                            
                            <p>Thank you for choosing GoEventify! We hope you had an amazing experience.</p>
                        </div>
                        
                        <div class="footer">
                            <p>This is an automated message from GoEventify. Please do not reply to this email.</p>
                            <p>&copy; ${new Date().getFullYear()} GoEventify. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        try {
            return await this.sendMailWithRetry(mailOptions);
        } catch (error) {
            console.error('Error sending work completion email:', error);
            throw error;
        }
    }

    // Send registration welcome email
    async sendRegistrationEmail(userEmail, userName, userType) {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: userEmail,
            subject: `Welcome to GoEventify! 🎉`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(135deg, #284b63, #3c6e71); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                        .welcome-box { background: #fff; border: 3px solid #f9a826; padding: 20px; text-align: center; margin: 20px 0; border-radius: 10px; }
                        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
                        .btn { display: inline-block; background: #f9a826; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🎉 Welcome to GoEventify!</h1>
                            <p>Your account has been created successfully</p>
                        </div>
                        
                        <div class="content">
                            <h2>Hello ${userName}!</h2>
                            
                            <div class="welcome-box">
                                <h3 style="color: #284b63; margin: 0;">✅ Registration Successful</h3>
                                <p style="margin: 10px 0 0 0;">Welcome to the GoEventify community!</p>
                            </div>
                            
                            <p>Thank you for joining GoEventify as a <strong>${userType}</strong>. We're excited to have you on board!</p>
                            
                            <h3>🚀 What's Next?</h3>
                            <ul>
                                ${userType === 'vendor' ? 
                                    '<li>Complete your vendor profile to start receiving bookings</li><li>Add your services and packages</li><li>Set up your availability and shifts</li>' :
                                    '<li>Explore our amazing vendors and services</li><li>Book your first event</li><li>Manage your bookings from your dashboard</li>'
                                }
                                <li>Update your profile settings</li>
                                <li>Contact our support team if you need help</li>
                            </ul>
                            
                            <div style="text-align: center; margin: 30px 0;">
                                <a href="${process.env.FRONTEND_URL || 'https://goeventify.com'}/login" class="btn">
                                    Get Started Now
                                </a>
                            </div>
                            
                            <p>If you have any questions or need assistance, our support team is here to help!</p>
                        </div>
                        
                        <div class="footer">
                            <p>This is an automated message from GoEventify. Please do not reply to this email.</p>
                            <p>&copy; ${new Date().getFullYear()} GoEventify. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        try {
            return await this.sendMailWithRetry(mailOptions);
        } catch (error) {
            console.error('Error sending registration email:', error);
            throw error;
        }
    }

    // Send booking confirmation email when admin approves
    async sendBookingConfirmationEmail(emailData) {
        const { 
            userEmail, 
            userName, 
            vendorName, 
            eventDate, 
            packageName,
            bookingId 
        } = emailData;

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: userEmail,
            subject: `Booking Approved! 🎉 - ${vendorName}`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(135deg, #284b63, #3c6e71); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                        .success-box { background: #d4edda; border: 2px solid #28a745; padding: 20px; text-align: center; margin: 20px 0; border-radius: 10px; }
                        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🎉 Booking Approved!</h1>
                            <p>Your booking has been confirmed by our admin team</p>
                        </div>
                        
                        <div class="content">
                            <h2>Great news, ${userName}!</h2>
                            
                            <div class="success-box">
                                <h3 style="color: #28a745; margin: 0;">✅ Admin Approval Received</h3>
                                <p style="margin: 10px 0 0 0;">Your booking is now confirmed and ready!</p>
                            </div>
                            
                            <h3>📋 Confirmed Booking Details:</h3>
                            <ul>
                                <li><strong>Booking ID:</strong> #${bookingId}</li>
                                <li><strong>Vendor:</strong> ${vendorName}</li>
                                <li><strong>Package:</strong> ${packageName}</li>
                                <li><strong>Event Date:</strong> ${new Date(eventDate).toLocaleDateString('en-US', { 
                                    weekday: 'long', 
                                    year: 'numeric', 
                                    month: 'long', 
                                    day: 'numeric' 
                                })}</li>
                                <li><strong>Status:</strong> Approved & Confirmed ✅</li>
                            </ul>
                            
                            <p><strong>What's Next?</strong></p>
                            <ul>
                                <li>You will receive an OTP code for verification on the event day</li>
                                <li>Share the OTP with your vendor to complete the service</li>
                                <li>The vendor may contact you for final arrangements</li>
                                <li>Save this confirmation email for your records</li>
                            </ul>
                            
                            <p>Thank you for choosing GoEventify! We hope you have an amazing event.</p>
                        </div>
                        
                        <div class="footer">
                            <p>This is an automated message from GoEventify. Please do not reply to this email.</p>
                            <p>&copy; ${new Date().getFullYear()} GoEventify. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        try {
            return await this.sendMailWithRetry(mailOptions);
        } catch (error) {
            console.error('Error sending booking confirmation email:', error);
            throw error;
        }
    }
    async sendReviewReminderEmail(emailData) {
        const { 
            userEmail, 
            userName, 
            vendorName, 
            eventDate, 
            packageName,
            bookingId 
        } = emailData;

        // Generate secure review token
        const reviewToken = ReviewTokenService.generateReviewToken(bookingId, userEmail);
        const reviewLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/review/${bookingId}?token=${reviewToken}`;

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: userEmail,
            subject: `Share Your Experience - ${vendorName} 🌟`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(135deg, #f9a826, #f39c12); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                        .review-box { background: #fff; border: 3px solid #f9a826; padding: 20px; text-align: center; margin: 20px 0; border-radius: 10px; }
                        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
                        .btn { display: inline-block; background: #f9a826; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; margin: 15px 0; font-weight: bold; font-size: 16px; }
                        .btn:hover { background: #e67e22; }
                        .stars { color: #f9a826; font-size: 24px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🌟 How was your experience?</h1>
                            <p>Help others by sharing your review</p>
                        </div>
                        
                        <div class="content">
                            <h2>Hello ${userName}!</h2>
                            
                            <p>We hope you had an amazing experience with <strong>${vendorName}</strong> for your event on <strong>${new Date(eventDate).toLocaleDateString('en-US', { 
                                weekday: 'long', 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                            })}</strong>!</p>
                            
                            <div class="review-box">
                                <div class="stars">⭐⭐⭐⭐⭐</div>
                                <h3 style="color: #f9a826; margin: 15px 0;">Share Your Experience</h3>
                                <p style="margin: 10px 0 0 0; color: #666;">Your feedback helps other customers make informed decisions</p>
                            </div>
                            
                            <h3>📋 Event Details:</h3>
                            <ul>
                                <li><strong>Vendor:</strong> ${vendorName}</li>
                                <li><strong>Package:</strong> ${packageName}</li>
                                <li><strong>Event Date:</strong> ${new Date(eventDate).toLocaleDateString('en-US', { 
                                    weekday: 'long', 
                                    year: 'numeric', 
                                    month: 'long', 
                                    day: 'numeric' 
                                })}</li>
                                <li><strong>Booking ID:</strong> #${bookingId}</li>
                            </ul>
                            
                            <div style="text-align: center; margin: 30px 0;">
                                <a href="${reviewLink}" class="btn">
                                    ⭐ Write Your Review
                                </a>
                            </div>
                            
                            <p><strong>Why leave a review?</strong></p>
                            <ul>
                                <li>Help other customers choose the right vendor</li>
                                <li>Share your experience and feedback</li>
                                <li>Support quality service providers</li>
                                <li>It only takes 2 minutes!</li>
                            </ul>
                            
                            <p style="font-size: 14px; color: #666; margin-top: 20px;">
                                <strong>Note:</strong> This review link is unique to your booking and will expire in 30 days. 
                                If you have any issues, please contact our support team.
                            </p>
                        </div>
                        
                        <div class="footer">
                            <p>This is an automated message from GoEventify. Please do not reply to this email.</p>
                            <p>&copy; ${new Date().getFullYear()} GoEventify. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        try {
            return await this.sendMailWithRetry(mailOptions);
        } catch (error) {
            console.error('Error sending review reminder email:', error);
            throw error;
        }
    }

    // Send booking notification email to vendor
    async sendVendorBookingNotification(emailData) {
        const { 
            vendorEmail, 
            vendorName, 
            userName, 
            userEmail,
            userPhone,
            packageName,
            eventDate,
            eventTime,
            amount,
            bookingId,
            bookingUuid
        } = emailData;

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: vendorEmail,
            subject: `🎉 New Booking Received! - ${packageName}`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(135deg, #284b63, #3c6e71); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                        .booking-box { background: #fff; border: 3px solid #28a745; padding: 20px; text-align: center; margin: 20px 0; border-radius: 10px; }
                        .details-box { background: #fff; border: 1px solid #ddd; padding: 20px; margin: 20px 0; border-radius: 10px; }
                        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
                        .btn { display: inline-block; background: #3c6e71; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; margin: 15px 0; font-weight: bold; font-size: 16px; }
                        .btn:hover { background: #284b63; }
                        .amount { font-size: 24px; font-weight: bold; color: #28a745; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🎉 New Booking Received!</h1>
                            <p>You have a new booking request</p>
                        </div>
                        
                        <div class="content">
                            <h2>Hello ${vendorName}!</h2>
                            
                            <div class="booking-box">
                                <h3 style="color: #28a745; margin: 0;">✅ New Booking Request</h3>
                                <p style="margin: 10px 0 0 0;">A customer has booked your services!</p>
                            </div>
                            
                            <div class="details-box">
                                <h3 style="color: #284b63; margin-top: 0;">📋 Booking Details:</h3>
                                <table style="width: 100%; border-collapse: collapse;">
                                    <tr style="border-bottom: 1px solid #eee;">
                                        <td style="padding: 8px 0; font-weight: bold;">Booking ID:</td>
                                        <td style="padding: 8px 0;">#${bookingUuid || bookingId}</td>
                                    </tr>
                                    <tr style="border-bottom: 1px solid #eee;">
                                        <td style="padding: 8px 0; font-weight: bold;">Package:</td>
                                        <td style="padding: 8px 0;">${packageName}</td>
                                    </tr>
                                    <tr style="border-bottom: 1px solid #eee;">
                                        <td style="padding: 8px 0; font-weight: bold;">Event Date:</td>
                                        <td style="padding: 8px 0;">${new Date(eventDate).toLocaleDateString('en-US', { 
                                            weekday: 'long', 
                                            year: 'numeric', 
                                            month: 'long', 
                                            day: 'numeric' 
                                        })}</td>
                                    </tr>
                                    <tr style="border-bottom: 1px solid #eee;">
                                        <td style="padding: 8px 0; font-weight: bold;">Event Time:</td>
                                        <td style="padding: 8px 0;">${eventTime}</td>
                                    </tr>
                                    <tr style="border-bottom: 1px solid #eee;">
                                        <td style="padding: 8px 0; font-weight: bold;">Amount:</td>
                                        <td style="padding: 8px 0;"><span class="amount">₹${amount}</span></td>
                                    </tr>
                                </table>
                            </div>

                            <div class="details-box">
                                <h3 style="color: #284b63; margin-top: 0;">👤 Customer Details:</h3>
                                <table style="width: 100%; border-collapse: collapse;">
                                    <tr style="border-bottom: 1px solid #eee;">
                                        <td style="padding: 8px 0; font-weight: bold;">Name:</td>
                                        <td style="padding: 8px 0;">${userName}</td>
                                    </tr>
                                    <tr style="border-bottom: 1px solid #eee;">
                                        <td style="padding: 8px 0; font-weight: bold;">Email:</td>
                                        <td style="padding: 8px 0;">${userEmail}</td>
                                    </tr>
                                    <tr style="border-bottom: 1px solid #eee;">
                                        <td style="padding: 8px 0; font-weight: bold;">Phone:</td>
                                        <td style="padding: 8px 0;">${userPhone || 'Not provided'}</td>
                                    </tr>
                                </table>
                            </div>
                            
                            <div style="text-align: center; margin: 30px 0;">
                                <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/vendor/bookings" class="btn">
                                    📋 View Booking Details
                                </a>
                            </div>
                            
                            <p><strong>What's Next?</strong></p>
                            <ul>
                                <li>Review the booking details in your vendor dashboard</li>
                                <li>Contact the customer if you need additional information</li>
                                <li>Prepare for the event on the scheduled date</li>
                                <li>The booking is pending admin approval</li>
                            </ul>
                            
                            <p>Thank you for being part of GoEventify! We wish you a successful event.</p>
                        </div>
                        
                        <div class="footer">
                            <p>This is an automated message from GoEventify. Please do not reply to this email.</p>
                            <p>&copy; ${new Date().getFullYear()} GoEventify. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        try {
            return await this.sendMailWithRetry(mailOptions);
        } catch (error) {
            console.error('Error sending vendor booking notification email:', error);
            throw error;
        }
    }

    // Send email verification link during signup
    async sendEmailVerification(emailData) {
        const { 
            userEmail, 
            userName, 
            verificationToken,
            userType 
        } = emailData;

        const verificationLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${verificationToken}`;

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: userEmail,
            subject: `🔐 Verify Your Email Address - GoEventify`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(135deg, #284b63, #3c6e71); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                        .verification-box { background: #fff; border: 3px solid #f9a826; padding: 20px; text-align: center; margin: 20px 0; border-radius: 10px; }
                        .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
                        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
                        .btn { display: inline-block; background: #f9a826; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; margin: 15px 0; font-weight: bold; font-size: 16px; }
                        .btn:hover { background: #e67e22; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🔐 Email Verification Required</h1>
                            <p>Please verify your email address to activate your account</p>
                        </div>
                        
                        <div class="content">
                            <h2>Hello ${userName}!</h2>
                            
                            <p>Thank you for signing up with GoEventify as a <strong>${userType}</strong>! To complete your registration and secure your account, please verify your email address.</p>
                            
                            <div class="verification-box">
                                <h3 style="color: #f9a826; margin: 0;">📧 Email Verification</h3>
                                <p style="margin: 10px 0 0 0;">Click the button below to verify your email address</p>
                            </div>
                            
                            <div style="text-align: center; margin: 30px 0;">
                                <a href="${verificationLink}" class="btn">
                                    ✅ Verify Email Address
                                </a>
                            </div>
                            
                            <div class="warning">
                                <strong>⚠️ Important:</strong>
                                <ul style="margin: 10px 0;">
                                    <li>This verification link expires in <strong>24 hours</strong></li>
                                    <li>You must verify your email to access all features</li>
                                    <li>If you didn't create this account, please ignore this email</li>
                                    <li>For security, never share this link with anyone</li>
                                </ul>
                            </div>
                            
                            <p><strong>What happens after verification?</strong></p>
                            <ul>
                                ${userType === 'vendor' ? 
                                    '<li>Complete your vendor profile to start receiving bookings</li><li>Add your services and packages</li><li>Set up your availability and shifts</li>' :
                                    '<li>Explore our amazing vendors and services</li><li>Book your first event</li><li>Manage your bookings from your dashboard</li>'
                                }
                                <li>Access all GoEventify features</li>
                                <li>Receive important notifications</li>
                            </ul>
                            
                            <p>If the button doesn't work, copy and paste this link into your browser:</p>
                            <p style="word-break: break-all; background: #f0f0f0; padding: 10px; border-radius: 5px; font-family: monospace;">
                                ${verificationLink}
                            </p>
                            
                            <p>Welcome to the GoEventify community!</p>
                        </div>
                        
                        <div class="footer">
                            <p>This is an automated message from GoEventify. Please do not reply to this email.</p>
                            <p>&copy; ${new Date().getFullYear()} GoEventify. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        try {
            return await this.sendMailWithRetry(mailOptions);
        } catch (error) {
            console.error('Error sending email verification:', error);
            throw error;
        }
    }

    async testEmailConfig() {
        try {
            await this.transporter.verify();
            console.log('Email service is ready');
            return { success: true, message: 'Email service is configured correctly' };
        } catch (error) {
            console.error('Email service configuration error:', error);
            return { success: false, error: error.message };
        }
    }

    // Send vendor notification when admin approves booking
    async sendVendorBookingApprovalNotification(emailData) {
        const { 
            vendorEmail, 
            vendorName, 
            businessName,
            bookingId,
            packageName,
            eventDate,
            customerName
        } = emailData;

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: vendorEmail,
            subject: `🎉 Booking Approved by Admin - ${packageName}`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(135deg, #28a745, #20c997); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                        .approval-box { background: #d4edda; border: 2px solid #28a745; padding: 20px; text-align: center; margin: 20px 0; border-radius: 10px; }
                        .details-box { background: #fff; border: 1px solid #ddd; padding: 20px; margin: 20px 0; border-radius: 10px; }
                        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
                        .btn { display: inline-block; background: #28a745; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; margin: 15px 0; font-weight: bold; font-size: 16px; }
                        .btn:hover { background: #218838; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🎉 Booking Approved!</h1>
                            <p>Admin has approved your booking</p>
                        </div>
                        
                        <div class="content">
                            <h2>Great news, ${vendorName}!</h2>
                            
                            <div class="approval-box">
                                <h3 style="color: #28a745; margin: 0;">✅ Admin Approval Received</h3>
                                <p style="margin: 10px 0 0 0;">Your booking has been approved by our admin team!</p>
                            </div>
                            
                            <div class="details-box">
                                <h3 style="color: #28a745; margin-top: 0;">📋 Approved Booking Details:</h3>
                                <table style="width: 100%; border-collapse: collapse;">
                                    <tr style="border-bottom: 1px solid #eee;">
                                        <td style="padding: 8px 0; font-weight: bold;">Booking ID:</td>
                                        <td style="padding: 8px 0;">#${bookingId}</td>
                                    </tr>
                                    <tr style="border-bottom: 1px solid #eee;">
                                        <td style="padding: 8px 0; font-weight: bold;">Business:</td>
                                        <td style="padding: 8px 0;">${businessName}</td>
                                    </tr>
                                    <tr style="border-bottom: 1px solid #eee;">
                                        <td style="padding: 8px 0; font-weight: bold;">Package:</td>
                                        <td style="padding: 8px 0;">${packageName}</td>
                                    </tr>
                                    <tr style="border-bottom: 1px solid #eee;">
                                        <td style="padding: 8px 0; font-weight: bold;">Customer:</td>
                                        <td style="padding: 8px 0;">${customerName}</td>
                                    </tr>
                                    <tr style="border-bottom: 1px solid #eee;">
                                        <td style="padding: 8px 0; font-weight: bold;">Event Date:</td>
                                        <td style="padding: 8px 0;">${new Date(eventDate).toLocaleDateString('en-US', { 
                                            weekday: 'long', 
                                            year: 'numeric', 
                                            month: 'long', 
                                            day: 'numeric' 
                                        })}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 0; font-weight: bold;">Status:</td>
                                        <td style="padding: 8px 0;"><span style="color: #28a745; font-weight: bold;">✅ Approved & Confirmed</span></td>
                                    </tr>
                                </table>
                            </div>
                            
                            <div style="text-align: center; margin: 30px 0;">
                                <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/vendor/bookings" class="btn">
                                    📋 View Booking Details
                                </a>
                            </div>
                            
                            <p><strong>What's Next?</strong></p>
                            <ul>
                                <li>The customer will receive an OTP code for verification on the event day</li>
                                <li>Collect the OTP from the customer to complete the service verification</li>
                                <li>Contact the customer if you need to discuss event details</li>
                                <li>Prepare for the event on the scheduled date</li>
                            </ul>
                            
                            <p>Thank you for being part of GoEventify! We wish you a successful event.</p>
                        </div>
                        
                        <div class="footer">
                            <p>This is an automated message from GoEventify. Please do not reply to this email.</p>
                            <p>&copy; ${new Date().getFullYear()} GoEventify. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        try {
            return await this.sendMailWithRetry(mailOptions);
        } catch (error) {
            console.error('Error sending vendor booking approval notification email:', error);
            throw error;
        }
    }

    // Send subscription confirmation email
    async sendSubscriptionConfirmationEmail(emailData) {
        const {
            vendorEmail,
            vendorName,
            businessName,
            amount,
            startDate,
            endDate,
            paymentId
        } = emailData;

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: vendorEmail,
            subject: '🎉 Subscription Activated - GoEventify Vendor Platform',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(135deg, #284b63, #3c6e71); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                        .success-box { background: #d4edda; border: 2px solid #28a745; padding: 20px; text-align: center; margin: 20px 0; border-radius: 10px; }
                        .details-box { background: #fff; padding: 20px; margin: 20px 0; border-radius: 10px; border-left: 4px solid #f9a826; }
                        .amount { font-size: 28px; font-weight: bold; color: #28a745; }
                        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
                        .btn { display: inline-block; background: #f9a826; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1 style="margin: 0;">🎉 Subscription Activated!</h1>
                            <p style="margin: 10px 0 0 0;">Welcome to GoEventify Vendor Platform</p>
                        </div>
                        
                        <div class="content">
                            <h2>Hello ${vendorName}!</h2>
                            
                            <div class="success-box">
                                <h3 style="color: #28a745; margin-top: 0;">✅ Payment Successful</h3>
                                <p style="margin: 5px 0;">Your annual subscription is now active!</p>
                            </div>
                            
                            <div class="details-box">
                                <h3 style="color: #284b63; margin-top: 0;">📋 Subscription Details:</h3>
                                <table style="width: 100%; border-collapse: collapse;">
                                    <tr style="border-bottom: 1px solid #eee;">
                                        <td style="padding: 8px 0; font-weight: bold;">Business Name:</td>
                                        <td style="padding: 8px 0;">${businessName}</td>
                                    </tr>
                                    <tr style="border-bottom: 1px solid #eee;">
                                        <td style="padding: 8px 0; font-weight: bold;">Plan:</td>
                                        <td style="padding: 8px 0;">Annual Subscription</td>
                                    </tr>
                                    <tr style="border-bottom: 1px solid #eee;">
                                        <td style="padding: 8px 0; font-weight: bold;">Amount Paid:</td>
                                        <td style="padding: 8px 0;"><span class="amount">₹${amount}</span></td>
                                    </tr>
                                    <tr style="border-bottom: 1px solid #eee;">
                                        <td style="padding: 8px 0; font-weight: bold;">Start Date:</td>
                                        <td style="padding: 8px 0;">${new Date(startDate).toLocaleDateString('en-US', { 
                                            year: 'numeric', 
                                            month: 'long', 
                                            day: 'numeric' 
                                        })}</td>
                                    </tr>
                                    <tr style="border-bottom: 1px solid #eee;">
                                        <td style="padding: 8px 0; font-weight: bold;">Valid Until:</td>
                                        <td style="padding: 8px 0;">${new Date(endDate).toLocaleDateString('en-US', { 
                                            year: 'numeric', 
                                            month: 'long', 
                                            day: 'numeric' 
                                        })}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 0; font-weight: bold;">Payment ID:</td>
                                        <td style="padding: 8px 0; font-size: 12px; color: #666;">${paymentId}</td>
                                    </tr>
                                </table>
                            </div>
                            
                            <div style="text-align: center; margin: 30px 0;">
                                <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/vendor/dashboard" class="btn">
                                    🚀 Go to Dashboard
                                </a>
                            </div>
                            
                            <p><strong>What's Next?</strong></p>
                            <ul>
                                <li>✅ Your vendor profile is now active and visible to customers</li>
                                <li>✅ You can now accept and manage bookings</li>
                                <li>✅ Access all premium features of the platform</li>
                                <li>✅ Receive booking notifications and manage your calendar</li>
                            </ul>
                            
                            <p style="background: #fff3cd; padding: 15px; border-radius: 5px; border-left: 4px solid #f9a826;">
                                <strong>📅 Renewal Reminder:</strong> Your subscription will automatically expire on 
                                ${new Date(endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}. 
                                We'll send you a reminder 30 days before expiry.
                            </p>
                            
                            <p>Thank you for choosing GoEventify! We're excited to help you grow your business.</p>
                        </div>
                        
                        <div class="footer">
                            <p>This is an automated message from GoEventify. Please do not reply to this email.</p>
                            <p>For support, contact us at ${process.env.EMAIL_USER}</p>
                            <p>&copy; ${new Date().getFullYear()} GoEventify. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        try {
            return await this.sendMailWithRetry(mailOptions);
        } catch (error) {
            console.error('Error sending subscription confirmation email:', error);
            throw error;
        }
    }

    // Send subscription expiry reminder (7 days before)
    async sendSubscriptionExpiryReminder(emailData) {
        const {
            vendorEmail,
            vendorName,
            businessName,
            expiryDate,
            daysRemaining
        } = emailData;

        const formattedExpiryDate = new Date(expiryDate).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: vendorEmail,
            subject: '⚠️ Your Subscription Expires in 7 Days - GoEventify',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(135deg, #f9a826, #e67e22); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                        .warning-box { background: #fff3cd; border: 3px solid #f9a826; padding: 20px; text-align: center; margin: 20px 0; border-radius: 10px; }
                        .info-box { background: #fff; border: 1px solid #ddd; padding: 15px; margin: 15px 0; border-radius: 8px; }
                        .btn { display: inline-block; background: #f9a826; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; margin: 15px 0; font-weight: bold; }
                        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>⚠️ Subscription Expiry Reminder</h1>
                            <p>Your subscription is expiring soon!</p>
                        </div>
                        
                        <div class="content">
                            <h2>Hello ${vendorName}!</h2>
                            
                            <p>This is a friendly reminder that your GoEventify vendor subscription for <strong>${businessName}</strong> will expire in <strong>${daysRemaining} days</strong>.</p>
                            
                            <div class="warning-box">
                                <h3 style="color: #f9a826; margin: 0;">📅 Expiry Date</h3>
                                <p style="font-size: 24px; font-weight: bold; margin: 10px 0;">${formattedExpiryDate}</p>
                            </div>
                            
                            <div class="info-box">
                                <h4>⚠️ What happens when your subscription expires?</h4>
                                <ul style="margin: 10px 0; padding-left: 20px;">
                                    <li>You will no longer be able to accept new bookings</li>
                                    <li>Your vendor profile will be hidden from customers</li>
                                    <li>Existing bookings will remain active</li>
                                    <li>You will lose access to vendor dashboard features</li>
                                </ul>
                            </div>
                            
                            <div style="text-align: center; margin: 30px 0;">
                                <a href="${process.env.FRONTEND_URL}/vendor/dashboard" class="btn">
                                    🔄 Renew Subscription Now
                                </a>
                            </div>
                            
                            <div class="info-box">
                                <h4>💰 Subscription Details</h4>
                                <p><strong>Plan:</strong> Annual Vendor Subscription</p>
                                <p><strong>Price:</strong> ₹999/year</p>
                                <p><strong>Benefits:</strong></p>
                                <ul style="margin: 10px 0; padding-left: 20px;">
                                    <li>Accept unlimited bookings</li>
                                    <li>Manage calendar and shifts</li>
                                    <li>Receive instant notifications</li>
                                    <li>Customer reviews and ratings</li>
                                    <li>24/7 customer support</li>
                                </ul>
                            </div>
                            
                            <p style="margin-top: 20px;">Don't let your business opportunities slip away! Renew your subscription today to continue receiving bookings and growing your business.</p>
                            
                            <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
                            
                            <div class="footer">
                                <p>This is an automated reminder from GoEventify</p>
                                <p>© ${new Date().getFullYear()} GoEventify. All rights reserved.</p>
                                <p>Need help? Contact us at ${process.env.EMAIL_USER}</p>
                            </div>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        try {
            return await this.sendMailWithRetry(mailOptions);
        } catch (error) {
            console.error('Error sending subscription expiry reminder:', error);
            throw error;
        }
    }

    // Send subscription expired notification
    async sendSubscriptionExpiredNotification(emailData) {
        const {
            vendorEmail,
            vendorName,
            businessName,
            expiryDate
        } = emailData;

        const formattedExpiryDate = new Date(expiryDate).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: vendorEmail,
            subject: '❌ Your Subscription Has Expired - GoEventify',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(135deg, #dc3545, #c82333); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                        .expired-box { background: #f8d7da; border: 3px solid #dc3545; padding: 20px; text-align: center; margin: 20px 0; border-radius: 10px; }
                        .info-box { background: #fff; border: 1px solid #ddd; padding: 15px; margin: 15px 0; border-radius: 8px; }
                        .btn { display: inline-block; background: #28a745; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; margin: 15px 0; font-weight: bold; }
                        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>❌ Subscription Expired</h1>
                            <p>Your subscription has ended</p>
                        </div>
                        
                        <div class="content">
                            <h2>Hello ${vendorName},</h2>
                            
                            <p>Your GoEventify vendor subscription for <strong>${businessName}</strong> has expired as of <strong>${formattedExpiryDate}</strong>.</p>
                            
                            <div class="expired-box">
                                <h3 style="color: #dc3545; margin: 0;">⚠️ Subscription Status</h3>
                                <p style="font-size: 24px; font-weight: bold; margin: 10px 0; color: #dc3545;">EXPIRED</p>
                            </div>
                            
                            <div class="info-box">
                                <h4>🚫 Current Limitations</h4>
                                <ul style="margin: 10px 0; padding-left: 20px;">
                                    <li>You cannot accept new bookings</li>
                                    <li>Your vendor profile is hidden from customers</li>
                                    <li>Limited access to vendor dashboard</li>
                                    <li>No new customer inquiries</li>
                                </ul>
                            </div>
                            
                            <div style="text-align: center; margin: 30px 0;">
                                <a href="${process.env.FRONTEND_URL}/vendor/dashboard" class="btn">
                                    ✅ Reactivate Subscription - ₹999/year
                                </a>
                            </div>
                            
                            <div class="info-box">
                                <h4>💡 Why Renew?</h4>
                                <ul style="margin: 10px 0; padding-left: 20px;">
                                    <li><strong>Instant Reactivation:</strong> Start receiving bookings immediately</li>
                                    <li><strong>Affordable:</strong> Only ₹999 for a full year</li>
                                    <li><strong>Grow Your Business:</strong> Access to thousands of potential customers</li>
                                    <li><strong>Professional Tools:</strong> Calendar management, notifications, and more</li>
                                </ul>
                            </div>
                            
                            <p style="margin-top: 20px;">Don't miss out on potential business opportunities! Renew your subscription today and get back to what you do best - serving your customers.</p>
                            
                            <p>If you have any questions or need assistance with renewal, our support team is here to help.</p>
                            
                            <div class="footer">
                                <p>This is an automated notification from GoEventify</p>
                                <p>© ${new Date().getFullYear()} GoEventify. All rights reserved.</p>
                                <p>Need help? Contact us at ${process.env.EMAIL_USER}</p>
                            </div>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        try {
            return await this.sendMailWithRetry(mailOptions);
        } catch (error) {
            console.error('Error sending subscription expired notification:', error);
            throw error;
        }
    }

}

export default new EmailService();
