import nodemailer from 'nodemailer';
import ReviewTokenService from '../Utils/reviewToken.js';

// Note: dotenv is configured in Server.js before this module is loaded

class EmailService {
    constructor() {
        this.isConnectionVerified = false;
        this.connectionError = null;
        
        // Using SMTP (Gmail) only
        this.createTransporter();
        this.verifyConnection();
    }

    createTransporter(useAlternativePort = false) {
        const port = useAlternativePort ? 465 : 587;
        const secure = useAlternativePort ? true : false;
        
        // console.log(`Creating email transporter with port ${port} (secure: ${secure})`);
        
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
            // console.log('✅ Email service is ready to send emails');
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
        // Using SMTP only
        let lastError;
        
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                // console.log(`Sending email to ${mailOptions.to} (attempt ${attempt}/${maxRetries})...`);
                
                // If first attempt fails and we haven't verified connection, try alternative port
                if (attempt === 2 && !this.isConnectionVerified) {
                    // console.log('Trying alternative SMTP port configuration...');
                    this.createTransporter(true); // Try port 465
                }
                
                const info = await this.transporter.sendMail(mailOptions);
                // console.log(`✅ Email sent successfully on attempt ${attempt}:`, info.messageId);
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
                    // console.log(`⏳ Waiting ${waitTime}ms before retry...`);
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
        const reviewLink = `${process.env.FRONTEND_URL || 'https://goeventify.com'}/review/${bookingId}?token=${reviewToken}`;
        
        // console.log('Generated review token for booking:', bookingId, 'user:', userEmail);
        // console.log('Review link:', reviewLink);

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
        const reviewLink = `${process.env.FRONTEND_URL || 'https://goeventify.com'}/review/${bookingId}?token=${reviewToken}`;

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
                                <a href="${process.env.FRONTEND_URL || 'https://goeventify.com'}/vendor/bookings" class="btn">
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

        const verificationLink = `${process.env.FRONTEND_URL || 'https://goeventify.com'}/verify-email?token=${verificationToken}`;

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
            // console.log('Email service is ready');
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
                                <a href="${process.env.FRONTEND_URL || 'https://goeventify.com'}/vendor/bookings" class="btn">
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
                                <a href="${process.env.FRONTEND_URL || 'https://goeventify.com'}/vendor/dashboard" class="btn">
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

    // Send booking confirmation email to user when booking is created
    async sendUserBookingConfirmation(emailData) {
        try {
            const { 
                userEmail, 
                userName, 
                vendorName, 
                packageName, 
                eventDate, 
                eventTime, 
                amount, 
                bookingId, 
                bookingUuid 
            } = emailData;

            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: userEmail,
                subject: '🎉 Booking Confirmation - GoEventify',
                html: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="utf-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>Booking Confirmation</title>
                        <style>
                            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f8f9fa; }
                            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
                            .header { background: linear-gradient(135deg, #3c6e71 0%, #284b63 100%); color: white; padding: 30px; text-align: center; }
                            .content { padding: 30px; }
                            .booking-card { background-color: #f8f9fa; border-radius: 12px; padding: 25px; margin: 20px 0; border-left: 4px solid #f9a826; }
                            .status-badge { background-color: #ffc107; color: #000; padding: 8px 16px; border-radius: 20px; font-weight: bold; display: inline-block; margin: 10px 0; }
                            .info-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #e9ecef; }
                            .info-label { font-weight: bold; color: #495057; }
                            .info-value { color: #6c757d; }
                            .next-steps { background-color: #e3f2fd; border-radius: 8px; padding: 20px; margin: 20px 0; }
                            .footer { background-color: #343a40; color: white; padding: 20px; text-align: center; }
                            .btn { background-color: #f9a826; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 10px 0; }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <div class="header">
                                <h1>🎉 Booking Confirmation</h1>
                                <p>Your booking request has been submitted successfully!</p>
                            </div>
                            
                            <div class="content">
                                <p>Dear <strong>${userName}</strong>,</p>
                                
                                <p>Thank you for choosing GoEventify! Your booking request has been submitted and is now being processed.</p>
                                
                                <div class="booking-card">
                                    <h3>📋 Booking Details</h3>
                                    <div class="status-badge">⏳ Pending Vendor Response</div>
                                    
                                    <div class="info-row">
                                        <span class="info-label">Booking ID:</span>
                                        <span class="info-value">#${bookingId}</span>
                                    </div>
                                    <div class="info-row">
                                        <span class="info-label">Vendor:</span>
                                        <span class="info-value">${vendorName}</span>
                                    </div>
                                    <div class="info-row">
                                        <span class="info-label">Package:</span>
                                        <span class="info-value">${packageName}</span>
                                    </div>
                                    <div class="info-row">
                                        <span class="info-label">Event Date:</span>
                                        <span class="info-value">${new Date(eventDate).toLocaleDateString('en-IN', { 
                                            weekday: 'long', 
                                            year: 'numeric', 
                                            month: 'long', 
                                            day: 'numeric' 
                                        })}</span>
                                    </div>
                                    <div class="info-row">
                                        <span class="info-label">Event Time:</span>
                                        <span class="info-value">${eventTime}</span>
                                    </div>
                                    <div class="info-row">
                                        <span class="info-label">Amount:</span>
                                        <span class="info-value">₹${amount}</span>
                                    </div>
                                </div>
                                
                                <div class="next-steps">
                                    <h4>📋 What happens next?</h4>
                                    <ol>
                                        <li><strong>Vendor Review:</strong> ${vendorName} will review your booking request</li>
                                        <li><strong>Vendor Response:</strong> You'll be notified when they accept or decline</li>
                                        <li><strong>Admin Approval:</strong> If accepted, our admin team will review and approve</li>
                                        <li><strong>Confirmation:</strong> Once approved, you'll receive final confirmation with OTP details</li>
                                    </ol>
                                </div>
                                
                                <p>We'll keep you updated via email and in-app notifications throughout the process.</p>
                                
                                <div style="text-align: center; margin: 30px 0;">
                                    <a href="${process.env.FRONTEND_URL}/user/bookings" class="btn">View My Bookings</a>
                                </div>
                                
                                <p>If you have any questions, feel free to contact our support team.</p>
                                
                                <p>Best regards,<br>
                                <strong>GoEventify Team</strong></p>
                            </div>
                            
                            <div class="footer">
                                <p>&copy; 2024 GoEventify. All rights reserved.</p>
                                <p>Making your events unforgettable, one booking at a time.</p>
                            </div>
                        </div>
                    </body>
                    </html>
                `
            };

            return await this.sendMailWithRetry(mailOptions);
        } catch (error) {
            console.error('Error sending user booking confirmation email:', error);
            throw error;
        }
    }

    // Send booking notification email to admin
    async sendAdminBookingNotification(emailData) {
        try {
            const { 
                userName, 
                userEmail, 
                vendorName, 
                vendorEmail, 
                packageName, 
                eventDate, 
                eventTime, 
                amount, 
                bookingId, 
                bookingUuid 
            } = emailData;

            const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;

            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: adminEmail,
                subject: '🔔 New Booking Alert - Admin Notification',
                html: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="utf-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>New Booking Alert</title>
                        <style>
                            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f8f9fa; }
                            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
                            .header { background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); color: white; padding: 30px; text-align: center; }
                            .content { padding: 30px; }
                            .booking-card { background-color: #f8f9fa; border-radius: 12px; padding: 25px; margin: 20px 0; border-left: 4px solid #dc3545; }
                            .alert-badge { background-color: #dc3545; color: white; padding: 8px 16px; border-radius: 20px; font-weight: bold; display: inline-block; margin: 10px 0; }
                            .info-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #e9ecef; }
                            .info-label { font-weight: bold; color: #495057; }
                            .info-value { color: #6c757d; }
                            .parties-section { background-color: #e8f4f8; border-radius: 8px; padding: 20px; margin: 20px 0; }
                            .footer { background-color: #343a40; color: white; padding: 20px; text-align: center; }
                            .btn { background-color: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 10px 5px; }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <div class="header">
                                <h1>🔔 New Booking Alert</h1>
                                <p>A new booking has been created in the system</p>
                            </div>
                            
                            <div class="content">
                                <p>Dear Admin,</p>
                                
                                <p>A new booking has been created on GoEventify platform. Please monitor the booking progress.</p>
                                
                                <div class="booking-card">
                                    <h3>📋 Booking Details</h3>
                                    <div class="alert-badge">🆕 New Booking</div>
                                    
                                    <div class="info-row">
                                        <span class="info-label">Booking ID:</span>
                                        <span class="info-value">#${bookingId}</span>
                                    </div>
                                    <div class="info-row">
                                        <span class="info-label">Package:</span>
                                        <span class="info-value">${packageName}</span>
                                    </div>
                                    <div class="info-row">
                                        <span class="info-label">Event Date:</span>
                                        <span class="info-value">${new Date(eventDate).toLocaleDateString('en-IN', { 
                                            weekday: 'long', 
                                            year: 'numeric', 
                                            month: 'long', 
                                            day: 'numeric' 
                                        })}</span>
                                    </div>
                                    <div class="info-row">
                                        <span class="info-label">Event Time:</span>
                                        <span class="info-value">${eventTime}</span>
                                    </div>
                                    <div class="info-row">
                                        <span class="info-label">Amount:</span>
                                        <span class="info-value">₹${amount}</span>
                                    </div>
                                </div>
                                
                                <div class="parties-section">
                                    <h4>👥 Parties Involved</h4>
                                    <div style="display: flex; justify-content: space-between; margin: 15px 0;">
                                        <div style="flex: 1; margin-right: 20px;">
                                            <h5>👤 Customer</h5>
                                            <p><strong>Name:</strong> ${userName}</p>
                                            <p><strong>Email:</strong> ${userEmail}</p>
                                        </div>
                                        <div style="flex: 1;">
                                            <h5>🏪 Vendor</h5>
                                            <p><strong>Name:</strong> ${vendorName}</p>
                                            <p><strong>Email:</strong> ${vendorEmail}</p>
                                        </div>
                                    </div>
                                </div>
                                
                                <div style="text-align: center; margin: 30px 0;">
                                    <a href="${process.env.FRONTEND_URL}/admin/bookings" class="btn">View All Bookings</a>
                                    <a href="${process.env.FRONTEND_URL}/admin/dashboard" class="btn" style="background-color: #28a745;">Admin Dashboard</a>
                                </div>
                                
                                <p>Best regards,<br>
                                <strong>GoEventify System</strong></p>
                            </div>
                            
                            <div class="footer">
                                <p>&copy; 2024 GoEventify. All rights reserved.</p>
                                <p>Admin Notification System</p>
                            </div>
                        </div>
                    </body>
                    </html>
                `
            };

            return await this.sendMailWithRetry(mailOptions);
        } catch (error) {
            console.error('Error sending admin booking notification email:', error);
            throw error;
        }
    }

    // Send booking accepted notification to user
    async sendUserBookingAcceptedNotification(emailData) {
        try {
            const { 
                userEmail, 
                userName, 
                vendorName, 
                packageName, 
                eventDate, 
                bookingId 
            } = emailData;

            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: userEmail,
                subject: '✅ Great News! Your Booking Has Been Accepted',
                html: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="utf-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>Booking Accepted</title>
                        <style>
                            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f8f9fa; }
                            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
                            .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; text-align: center; }
                            .content { padding: 30px; }
                            .success-badge { background-color: #28a745; color: white; padding: 8px 16px; border-radius: 20px; font-weight: bold; display: inline-block; margin: 10px 0; }
                            .next-steps { background-color: #d4edda; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #28a745; }
                            .footer { background-color: #343a40; color: white; padding: 20px; text-align: center; }
                            .btn { background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 10px 0; }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <div class="header">
                                <h1>🎉 Booking Accepted!</h1>
                                <p>Your vendor has accepted your booking request</p>
                            </div>
                            
                            <div class="content">
                                <p>Dear <strong>${userName}</strong>,</p>
                                
                                <p>Great news! <strong>${vendorName}</strong> has accepted your booking request for <strong>${packageName}</strong> on <strong>${new Date(eventDate).toLocaleDateString('en-IN')}</strong>.</p>
                                
                                <div class="success-badge">✅ Accepted by Vendor</div>
                                
                                <div class="next-steps">
                                    <h4>📋 What's Next?</h4>
                                    <p><strong>Admin Review:</strong> Your booking is now pending admin approval. Our team will review and approve it shortly.</p>
                                    <p><strong>Final Confirmation:</strong> Once approved, you'll receive final confirmation with OTP details for the event day.</p>
                                </div>
                                
                                <div style="text-align: center; margin: 30px 0;">
                                    <a href="${process.env.FRONTEND_URL}/user/bookings" class="btn">Track Booking Status</a>
                                </div>
                                
                                <p>We'll notify you as soon as the admin approves your booking.</p>
                                
                                <p>Best regards,<br>
                                <strong>GoEventify Team</strong></p>
                            </div>
                            
                            <div class="footer">
                                <p>&copy; 2024 GoEventify. All rights reserved.</p>
                            </div>
                        </div>
                    </body>
                    </html>
                `
            };

            return await this.sendMailWithRetry(mailOptions);
        } catch (error) {
            console.error('Error sending user booking accepted notification email:', error);
            throw error;
        }
    }

    // Send booking accepted notification to admin
    async sendAdminBookingAcceptedNotification(emailData) {
        try {
            const { 
                userName, 
                vendorName, 
                packageName, 
                eventDate, 
                amount, 
                bookingId 
            } = emailData;

            const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;

            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: adminEmail,
                subject: '⚡ Action Required: Booking Accepted - Needs Admin Approval',
                html: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="utf-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>Booking Needs Approval</title>
                        <style>
                            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f8f9fa; }
                            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
                            .header { background: linear-gradient(135deg, #ffc107 0%, #fd7e14 100%); color: #000; padding: 30px; text-align: center; }
                            .content { padding: 30px; }
                            .action-badge { background-color: #ffc107; color: #000; padding: 8px 16px; border-radius: 20px; font-weight: bold; display: inline-block; margin: 10px 0; }
                            .urgent-section { background-color: #fff3cd; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #ffc107; }
                            .footer { background-color: #343a40; color: white; padding: 20px; text-align: center; }
                            .btn { background-color: #ffc107; color: #000; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 10px 5px; font-weight: bold; }
                            .approve-btn { background-color: #28a745; color: white; }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <div class="header">
                                <h1>⚡ Action Required</h1>
                                <p>Booking accepted by vendor - needs your approval</p>
                            </div>
                            
                            <div class="content">
                                <p>Dear Admin,</p>
                                
                                <p>A booking has been <strong>accepted by the vendor</strong> and is now awaiting your approval.</p>
                                
                                <div class="action-badge">⏰ Pending Admin Approval</div>
                                
                                <div class="urgent-section">
                                    <h4>📋 Booking Summary</h4>
                                    <p><strong>Booking ID:</strong> #${bookingId}</p>
                                    <p><strong>Customer:</strong> ${userName}</p>
                                    <p><strong>Vendor:</strong> ${vendorName}</p>
                                    <p><strong>Package:</strong> ${packageName}</p>
                                    <p><strong>Event Date:</strong> ${new Date(eventDate).toLocaleDateString('en-IN')}</p>
                                    <p><strong>Amount:</strong> ₹${amount}</p>
                                </div>
                                
                                <div style="text-align: center; margin: 30px 0;">
                                    <a href="${process.env.FRONTEND_URL}/admin/bookings" class="btn approve-btn">Review & Approve</a>
                                    <a href="${process.env.FRONTEND_URL}/admin/dashboard" class="btn">Admin Dashboard</a>
                                </div>
                                
                                <p><strong>Note:</strong> The customer and vendor are waiting for your decision. Please review promptly.</p>
                                
                                <p>Best regards,<br>
                                <strong>GoEventify System</strong></p>
                            </div>
                            
                            <div class="footer">
                                <p>&copy; 2024 GoEventify. All rights reserved.</p>
                            </div>
                        </div>
                    </body>
                    </html>
                `
            };

            return await this.sendMailWithRetry(mailOptions);
        } catch (error) {
            console.error('Error sending admin booking accepted notification email:', error);
            throw error;
        }
    }

    // Send booking approved notification to user
    async sendUserBookingApprovedNotification(emailData) {
        try {
            const { 
                userEmail, 
                userName, 
                vendorName, 
                packageName, 
                eventDate, 
                eventTime, 
                amount, 
                bookingId 
            } = emailData;

            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: userEmail,
                subject: '🎉 Booking Confirmed! Your Event is All Set',
                html: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="utf-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>Booking Confirmed</title>
                        <style>
                            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f8f9fa; }
                            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
                            .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; text-align: center; }
                            .content { padding: 30px; }
                            .confirmed-badge { background-color: #28a745; color: white; padding: 10px 20px; border-radius: 25px; font-weight: bold; display: inline-block; margin: 15px 0; }
                            .event-details { background-color: #d4edda; border-radius: 12px; padding: 25px; margin: 20px 0; border-left: 4px solid #28a745; }
                            .otp-section { background-color: #fff3cd; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #ffc107; }
                            .footer { background-color: #343a40; color: white; padding: 20px; text-align: center; }
                            .btn { background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 10px 0; }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <div class="header">
                                <h1>🎉 Booking Confirmed!</h1>
                                <p>Your event is officially booked and approved</p>
                            </div>
                            
                            <div class="content">
                                <p>Dear <strong>${userName}</strong>,</p>
                                
                                <p>Congratulations! Your booking has been <strong>approved by our admin team</strong>. Your event is now officially confirmed!</p>
                                
                                <div class="confirmed-badge">✅ BOOKING CONFIRMED</div>
                                
                                <div class="event-details">
                                    <h3>🎊 Your Event Details</h3>
                                    <p><strong>Booking ID:</strong> #${bookingId}</p>
                                    <p><strong>Vendor:</strong> ${vendorName}</p>
                                    <p><strong>Package:</strong> ${packageName}</p>
                                    <p><strong>Date:</strong> ${new Date(eventDate).toLocaleDateString('en-IN', { 
                                        weekday: 'long', 
                                        year: 'numeric', 
                                        month: 'long', 
                                        day: 'numeric' 
                                    })}</p>
                                    <p><strong>Time:</strong> ${eventTime}</p>
                                    <p><strong>Amount:</strong> ₹${amount}</p>
                                </div>
                                
                                <div class="otp-section">
                                    <h4>🔐 Important: OTP Verification</h4>
                                    <p><strong>On your event day:</strong></p>
                                    <ul>
                                        <li>You'll receive an OTP code via email and SMS</li>
                                        <li>Share this OTP with ${vendorName} to verify the service</li>
                                        <li>The OTP confirms service completion and releases payment</li>
                                    </ul>
                                </div>
                                
                                <div style="text-align: center; margin: 30px 0;">
                                    <a href="${process.env.FRONTEND_URL}/user/bookings" class="btn">View Booking Details</a>
                                </div>
                                
                                <p>We're excited to help make your event unforgettable! If you have any questions, our support team is here to help.</p>
                                
                                <p>Best regards,<br>
                                <strong>GoEventify Team</strong></p>
                            </div>
                            
                            <div class="footer">
                                <p>&copy; 2024 GoEventify. All rights reserved.</p>
                                <p>Making your events unforgettable!</p>
                            </div>
                        </div>
                    </body>
                    </html>
                `
            };

            return await this.sendMailWithRetry(mailOptions);
        } catch (error) {
            console.error('Error sending user booking approved notification email:', error);
            throw error;
        }
    }

    // Send password reset email
    async sendPasswordResetEmail(emailData) {
        const { 
            userEmail, 
            userName, 
            resetToken,
            userType 
        } = emailData;

        const resetLink = `${process.env.FRONTEND_URL || 'https://goeventify.com'}/reset-password?token=${resetToken}`;

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: userEmail,
            subject: `🔐 Password Reset Request - GoEventify`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(135deg, #284b63, #3c6e71); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                        .reset-box { background: #fff; border: 3px solid #f9a826; padding: 20px; text-align: center; margin: 20px 0; border-radius: 10px; }
                        .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
                        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
                        .btn { display: inline-block; background: #f9a826; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; margin: 15px 0; font-weight: bold; font-size: 16px; }
                        .btn:hover { background: #e67e22; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🔐 Password Reset Request</h1>
                            <p>Reset your GoEventify account password</p>
                        </div>
                        
                        <div class="content">
                            <h2>Hello ${userName}!</h2>
                            
                            <p>We received a request to reset the password for your GoEventify account. If you made this request, click the button below to reset your password.</p>
                            
                            <div class="reset-box">
                                <h3 style="color: #f9a826; margin: 0;">🔑 Reset Your Password</h3>
                                <p style="margin: 10px 0 0 0;">Click the button below to create a new password</p>
                            </div>
                            
                            <div style="text-align: center; margin: 30px 0;">
                                <a href="${resetLink}" class="btn">
                                    Reset Password
                                </a>
                            </div>
                            
                            <div class="warning">
                                <strong>⚠️ Important Security Information:</strong>
                                <ul style="margin: 10px 0;">
                                    <li>This password reset link will expire in <strong>1 hour</strong></li>
                                    <li>If you didn't request this reset, please ignore this email</li>
                                    <li>Your password will remain unchanged until you create a new one</li>
                                    <li>Never share this link with anyone</li>
                                </ul>
                            </div>
                            
                            <p><strong>Can't click the button?</strong> Copy and paste this link into your browser:</p>
                            <p style="word-break: break-all; color: #666; font-size: 12px;">${resetLink}</p>
                            
                            <p>If you didn't request a password reset, you can safely ignore this email. Your account is secure.</p>
                            
                            <p>Best regards,<br>
                            <strong>GoEventify Security Team</strong></p>
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
            console.error('Error sending password reset email:', error);
            throw error;
        }
    }

    // Send password change confirmation email
    async sendPasswordChangeConfirmationEmail(emailData) {
        const { 
            userEmail, 
            userName 
        } = emailData;

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: userEmail,
            subject: `✅ Password Changed Successfully - GoEventify`,
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
                        .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
                        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
                        .btn { display: inline-block; background: #28a745; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; margin: 15px 0; font-weight: bold; font-size: 16px; }
                        .btn:hover { background: #218838; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>✅ Password Changed Successfully</h1>
                            <p>Your password has been updated</p>
                        </div>
                        
                        <div class="content">
                            <h2>Hello ${userName}!</h2>
                            
                            <div class="success-box">
                                <h3 style="color: #28a745; margin: 0;">🔒 Password Updated</h3>
                                <p style="margin: 10px 0 0 0;">Your GoEventify account password has been changed successfully!</p>
                            </div>
                            
                            <p>This email confirms that your password was recently changed. You can now use your new password to log in to your account.</p>
                            
                            <div style="text-align: center; margin: 30px 0;">
                                <a href="${process.env.FRONTEND_URL || 'https://goeventify.com'}/login" class="btn">
                                    Login to Your Account
                                </a>
                            </div>
                            
                            <div class="warning">
                                <strong>⚠️ Didn't make this change?</strong>
                                <p style="margin: 10px 0 0 0;">If you didn't change your password, please contact our support team immediately at <strong>goeventify@gmail.com</strong> or call <strong>+91 9201976523</strong>. Your account security is our top priority.</p>
                            </div>
                            
                            <p><strong>Security Tips:</strong></p>
                            <ul>
                                <li>Never share your password with anyone</li>
                                <li>Use a strong, unique password for your account</li>
                                <li>Enable two-factor authentication if available</li>
                                <li>Log out from shared devices</li>
                            </ul>
                            
                            <p>Thank you for keeping your account secure!</p>
                            
                            <p>Best regards,<br>
                            <strong>GoEventify Security Team</strong></p>
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
            console.error('Error sending password change confirmation email:', error);
            throw error;
        }
    }

    async sendContactEmail({ name, email, phone, subject, message }) {
        const now = new Date();
        const timestamp = now.toLocaleString('en-IN', {
            timeZone: 'Asia/Kolkata',
            dateStyle: 'full',
            timeStyle: 'short'
        });

        const mailOptions = {
            from: `"GoEventify Contact Form" <${process.env.EMAIL_USER}>`,
            to: process.env.CONTACT_EMAIL,
            replyTo: email,
            subject: subject ? `[GoEventify] ${subject}` : `[GoEventify] New Enquiry from ${name}`,
            html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>New Contact Enquiry – GoEventify</title>
</head>
<body style="margin:0;padding:0;background-color:#f0f4f8;font-family:'Segoe UI',Arial,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0f4f8;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="620" cellpadding="0" cellspacing="0" style="max-width:620px;width:100%;">

          <!-- HEADER -->
          <tr>
            <td style="background:linear-gradient(135deg,#1a2e30 0%,#3c6e71 100%);border-radius:16px 16px 0 0;padding:36px 40px;text-align:center;">
              <img src="https://www.goeventify.com/logo2.png" alt="GoEventify" width="64" height="64" style="display:inline-block;border-radius:50%;background:#ffffff;padding:6px;margin-bottom:14px;object-fit:contain;" />
              <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:700;letter-spacing:0.5px;">GoEventify</h1>
              <p style="margin:6px 0 0;color:#f9a826;font-size:13px;letter-spacing:2px;text-transform:uppercase;font-weight:600;">New Contact Enquiry</p>
            </td>
          </tr>

          <!-- ALERT BANNER -->
          <tr>
            <td style="background:#f9a826;padding:12px 40px;text-align:center;">
              <p style="margin:0;color:#1a2e30;font-size:13px;font-weight:700;letter-spacing:0.5px;">
                You have received a new message from your website contact form
              </p>
            </td>
          </tr>

          <!-- BODY -->
          <tr>
            <td style="background:#ffffff;padding:40px;">

              <!-- SENDER DETAILS -->
              <h2 style="margin:0 0 20px;color:#1a2e30;font-size:16px;font-weight:700;text-transform:uppercase;letter-spacing:1px;border-left:4px solid #f9a826;padding-left:12px;">
                Sender Details
              </h2>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">

                <!-- Full Name — person icon -->
                <tr>
                  <td style="padding:12px 16px;background:#f8fafc;border-radius:10px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="46" valign="middle">
                          <table cellpadding="0" cellspacing="0"><tr>
                            <td width="42" height="42" align="center" valign="middle" style="background:#3c6e71;border-radius:10px;">
                              <img src="https://img.icons8.com/ios-filled/50/ffffff/user.png" width="22" height="22" alt="person" style="display:block;margin:0 auto;" />
                            </td>
                          </tr></table>
                        </td>
                        <td valign="middle" style="padding-left:14px;">
                          <span style="font-size:11px;color:#999;text-transform:uppercase;letter-spacing:1px;display:block;margin-bottom:3px;">Full Name</span>
                          <span style="font-size:15px;color:#1a2e30;font-weight:700;">${name}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <tr><td height="8"></td></tr>

                <!-- Email Address — envelope icon -->
                <tr>
                  <td style="padding:12px 16px;background:#f8fafc;border-radius:10px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="46" valign="middle">
                          <table cellpadding="0" cellspacing="0"><tr>
                            <td width="42" height="42" align="center" valign="middle" style="background:#3c6e71;border-radius:10px;">
                              <img src="https://img.icons8.com/ios-filled/50/ffffff/email.png" width="22" height="22" alt="email" style="display:block;margin:0 auto;" />
                            </td>
                          </tr></table>
                        </td>
                        <td valign="middle" style="padding-left:14px;">
                          <span style="font-size:11px;color:#999;text-transform:uppercase;letter-spacing:1px;display:block;margin-bottom:3px;">Email Address</span>
                          <a href="mailto:${email}" style="font-size:15px;color:#3c6e71;font-weight:700;text-decoration:none;">${email}</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                ${phone ? `
                <tr><td height="8"></td></tr>

                <!-- Phone Number — phone icon -->
                <tr>
                  <td style="padding:12px 16px;background:#f8fafc;border-radius:10px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="46" valign="middle">
                          <table cellpadding="0" cellspacing="0"><tr>
                            <td width="42" height="42" align="center" valign="middle" style="background:#3c6e71;border-radius:10px;">
                              <img src="https://img.icons8.com/ios-filled/50/ffffff/phone.png" width="22" height="22" alt="phone" style="display:block;margin:0 auto;" />
                            </td>
                          </tr></table>
                        </td>
                        <td valign="middle" style="padding-left:14px;">
                          <span style="font-size:11px;color:#999;text-transform:uppercase;letter-spacing:1px;display:block;margin-bottom:3px;">Phone Number</span>
                          <a href="tel:${phone}" style="font-size:15px;color:#1a2e30;font-weight:700;text-decoration:none;">+91 ${phone}</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>` : ''}

                ${subject ? `
                <tr><td height="8"></td></tr>

                <!-- Subject — tag icon -->
                <tr>
                  <td style="padding:12px 16px;background:#f8fafc;border-radius:10px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="46" valign="middle">
                          <table cellpadding="0" cellspacing="0"><tr>
                            <td width="42" height="42" align="center" valign="middle" style="background:#3c6e71;border-radius:10px;">
                              <img src="https://img.icons8.com/ios-filled/50/ffffff/price-tag.png" width="22" height="22" alt="subject" style="display:block;margin:0 auto;" />
                            </td>
                          </tr></table>
                        </td>
                        <td valign="middle" style="padding-left:14px;">
                          <span style="font-size:11px;color:#999;text-transform:uppercase;letter-spacing:1px;display:block;margin-bottom:3px;">Subject</span>
                          <span style="font-size:15px;color:#1a2e30;font-weight:700;">${subject}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>` : ''}

              </table>

              <!-- MESSAGE -->
              <h2 style="margin:0 0 14px;color:#1a2e30;font-size:16px;font-weight:700;text-transform:uppercase;letter-spacing:1px;border-left:4px solid #f9a826;padding-left:12px;">
                Message
              </h2>
              <div style="background:#f8fafc;border-radius:10px;border-left:4px solid #3c6e71;padding:20px 24px;">
                <p style="margin:0;font-size:15px;color:#333;line-height:1.8;white-space:pre-wrap;">${message}</p>
              </div>

              <!-- REPLY CTA -->
              <div style="margin-top:32px;text-align:center;">
                <a href="mailto:${email}?subject=Re: ${subject || 'Your GoEventify Enquiry'}"
                   style="display:inline-block;background:linear-gradient(135deg,#3c6e71,#1a2e30);color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;padding:14px 36px;border-radius:50px;letter-spacing:0.5px;">
                  Reply to ${name}
                </a>
              </div>

            </td>
          </tr>

          <!-- TIMESTAMP -->
          <tr>
            <td style="background:#f8fafc;padding:16px 40px;text-align:center;border-top:1px solid #e8ecf0;">
              <p style="margin:0;font-size:12px;color:#aaa;">
                Received on ${timestamp} (IST)
              </p>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background:linear-gradient(135deg,#1a2e30 0%,#3c6e71 100%);border-radius:0 0 16px 16px;padding:28px 40px;text-align:center;">
              <p style="margin:0 0 8px;color:#f9a826;font-size:16px;font-weight:700;">GoEventify</p>
              <p style="margin:0 0 6px;color:#ccc;font-size:12px;">71, Dadda Nagar Near Katangi Highway, Jabalpur, MP 482001</p>
              <p style="margin:0 0 6px;color:#ccc;font-size:12px;">
                <a href="tel:+919201976523" style="color:#ccc;text-decoration:none;">+91 9201976523</a>
                &nbsp;|&nbsp;
                <a href="https://www.goeventify.com" style="color:#f9a826;text-decoration:none;">www.goeventify.com</a>
              </p>
              <p style="margin:16px 0 0;color:#666;font-size:11px;">
                This email was auto-generated from the GoEventify contact form. Do not reply to this email — use the button above to respond directly to the enquiry.
              </p>
              <p style="margin:6px 0 0;color:#555;font-size:11px;">&copy; ${new Date().getFullYear()} GoEventify. All rights reserved.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>
            `
        };

        try {
            return await this.sendMailWithRetry(mailOptions);
        } catch (error) {
            console.error('Error sending contact form email:', error);
            throw error;
        }
    }

}

export default new EmailService();
