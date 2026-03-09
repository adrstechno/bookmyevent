import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';

dotenv.config();

class SendGridService {
    constructor() {
        if (process.env.SENDGRID_API_KEY) {
            sgMail.setApiKey(process.env.SENDGRID_API_KEY);
            console.log('✅ SendGrid initialized');
        }
        // Removed warning - only log if actually configured
    }

    async sendEmail(mailOptions) {
        if (!process.env.SENDGRID_API_KEY) {
            throw new Error('SendGrid API key not configured');
        }

        const msg = {
            to: mailOptions.to,
            from: process.env.EMAIL_USER || 'goeventify@gmail.com',
            subject: mailOptions.subject,
            html: mailOptions.html,
        };

        try {
            const response = await sgMail.send(msg);
            console.log('✅ Email sent via SendGrid to:', mailOptions.to);
            return { 
                success: true, 
                messageId: response[0].headers['x-message-id'],
                provider: 'sendgrid'
            };
        } catch (error) {
            console.error('❌ SendGrid error:', error.response?.body || error.message);
            throw error;
        }
    }

    async testConnection() {
        try {
            if (!process.env.SENDGRID_API_KEY) {
                return { 
                    success: false, 
                    error: 'SENDGRID_API_KEY not configured' 
                };
            }
            
            // SendGrid doesn't have a verify endpoint, so we just check if API key exists
            return { 
                success: true, 
                message: 'SendGrid API key is configured' 
            };
        } catch (error) {
            return { 
                success: false, 
                error: error.message 
            };
        }
    }
}

export default new SendGridService();
