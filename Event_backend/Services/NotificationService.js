import NotificationModel from "../Models/NotificationModel_fixed.js";

class NotificationService {
    // Notification types
    static NOTIFICATION_TYPES = {
        BOOKING_CREATED: 'booking_created',
        BOOKING_ACCEPTED: 'booking_accepted',
        BOOKING_REJECTED: 'booking_rejected',
        BOOKING_APPROVED: 'booking_approved',
        BOOKING_ADMIN_REJECTED: 'booking_admin_rejected',
        BOOKING_CANCELLED: 'booking_cancelled',
        OTP_GENERATED: 'otp_generated',
        OTP_VERIFIED: 'otp_verified',
        OTP_REMINDER: 'otp_reminder',
        BOOKING_CONFIRMED: 'booking_confirmed',
        REVIEW_SUBMITTED: 'review_submitted',
        REVIEW_RECEIVED: 'review_received',
        VENDOR_ACCOUNT_CREATED: 'vendor_account_created',
        BOOKING_COMPLETION_REMINDER: 'booking_completion_reminder'
    };

    // Send notification to multiple users
    static async sendBulkNotifications(notifications) {
        const promises = notifications.map(notification => 
            NotificationModel.createNotification(notification)
        );
        
        try {
            await Promise.all(promises);
            return { success: true, count: notifications.length };
        } catch (error) {
            console.error('Bulk notification error:', error);
            throw error;
        }
    }

    // BOOKING WORKFLOW NOTIFICATIONS

    // 1. User creates booking -> Notify vendor
    static async notifyBookingCreated(bookingData) {
        const { booking_id, user_name, vendor_id, event_date, package_name } = bookingData;
        
        await NotificationModel.createNotification({
            user_id: `vendor_${vendor_id}`,
            title: 'New Booking Request',
            message: `${user_name} has requested a booking for ${package_name} on ${event_date}. Please review and respond.`,
            type: this.NOTIFICATION_TYPES.BOOKING_CREATED,
            related_booking_id: booking_id,
            metadata: {
                booking_id,
                user_name,
                event_date,
                package_name,
                action_required: true
            }
        });
    }

    // 2. Vendor accepts booking -> Notify user and admin
    static async notifyBookingAccepted(bookingData) {
        const { booking_id, user_id, vendor_name, event_date, package_name } = bookingData;
        
        const notifications = [
            // Notify user
            {
                user_id: user_id,
                title: 'Booking Accepted',
                message: `Great news! ${vendor_name} has accepted your booking for ${package_name} on ${event_date}. Awaiting admin approval.`,
                type: this.NOTIFICATION_TYPES.BOOKING_ACCEPTED,
                related_booking_id: booking_id,
                metadata: { booking_id, vendor_name, event_date, package_name }
            },
            // Notify admin
            {
                user_id: 'admin',
                title: 'Booking Pending Approval',
                message: `Vendor ${vendor_name} has accepted a booking from ${bookingData.user_name}. Please review for approval.`,
                type: this.NOTIFICATION_TYPES.BOOKING_ACCEPTED,
                related_booking_id: booking_id,
                metadata: {
                    booking_id,
                    vendor_name,
                    user_name: bookingData.user_name,
                    event_date,
                    action_required: true
                }
            }
        ];

        await this.sendBulkNotifications(notifications);
    }

    // 3. Vendor rejects booking -> Notify user
    static async notifyBookingRejected(bookingData) {
        const { booking_id, user_id, vendor_name, event_date, reason } = bookingData;
        
        await NotificationModel.createNotification({
            user_id: user_id,
            title: 'Booking Declined',
            message: `Unfortunately, ${vendor_name} has declined your booking for ${event_date}. ${reason ? `Reason: ${reason}` : 'You can try booking with other vendors.'}`,
            type: this.NOTIFICATION_TYPES.BOOKING_REJECTED,
            related_booking_id: booking_id,
            metadata: { booking_id, vendor_name, event_date, reason }
        });
    }

    // 4. Admin approves booking -> Notify user and vendor
    static async notifyBookingApproved(bookingData) {
        const { booking_id, user_id, vendor_id, vendor_name, event_date, package_name } = bookingData;
        
        const notifications = [
            // Notify user
            {
                user_id: user_id,
                title: 'Booking Approved',
                message: `Your booking with ${vendor_name} for ${package_name} on ${event_date} has been approved! You will receive an OTP for verification.`,
                type: this.NOTIFICATION_TYPES.BOOKING_APPROVED,
                related_booking_id: booking_id,
                metadata: { booking_id, vendor_name, event_date, package_name }
            },
            // Notify vendor
            {
                user_id: `vendor_${vendor_id}`,
                title: 'Booking Approved by Admin',
                message: `The booking for ${package_name} on ${event_date} has been approved by admin. OTP verification will begin soon.`,
                type: this.NOTIFICATION_TYPES.BOOKING_APPROVED,
                related_booking_id: booking_id,
                metadata: { booking_id, event_date, package_name }
            }
        ];

        await this.sendBulkNotifications(notifications);
    }

    // 5. Admin rejects booking -> Notify user and vendor
    static async notifyBookingAdminRejected(bookingData) {
        const { booking_id, user_id, vendor_id, vendor_name, event_date, reason } = bookingData;
        
        const notifications = [
            // Notify user
            {
                user_id: user_id,
                title: 'Booking Not Approved',
                message: `Your booking with ${vendor_name} for ${event_date} was not approved by admin. ${reason ? `Reason: ${reason}` : ''}`,
                type: this.NOTIFICATION_TYPES.BOOKING_ADMIN_REJECTED,
                related_booking_id: booking_id,
                metadata: { booking_id, vendor_name, event_date, reason }
            },
            // Notify vendor
            {
                user_id: `vendor_${vendor_id}`,
                title: 'Booking Not Approved',
                message: `The booking for ${event_date} was not approved by admin. ${reason ? `Reason: ${reason}` : ''}`,
                type: this.NOTIFICATION_TYPES.BOOKING_ADMIN_REJECTED,
                related_booking_id: booking_id,
                metadata: { booking_id, event_date, reason }
            }
        ];

        await this.sendBulkNotifications(notifications);
    }

    // 6. Booking cancelled -> Notify relevant parties
    static async notifyBookingCancelled(bookingData) {
        const { booking_id, cancelled_by, user_id, vendor_id, vendor_name, user_name, event_date, reason } = bookingData;
        
        const notifications = [];

        if (cancelled_by === 'user') {
            // User cancelled -> Notify vendor and admin
            notifications.push(
                {
                    user_id: `vendor_${vendor_id}`,
                    title: 'Booking Cancelled',
                    message: `${user_name} has cancelled the booking for ${event_date}. ${reason ? `Reason: ${reason}` : ''}`,
                    type: this.NOTIFICATION_TYPES.BOOKING_CANCELLED,
                    related_booking_id: booking_id,
                    metadata: { booking_id, cancelled_by, user_name, event_date, reason }
                },
                {
                    user_id: 'admin',
                    title: 'Booking Cancelled by User',
                    message: `${user_name} cancelled their booking with ${vendor_name} for ${event_date}.`,
                    type: this.NOTIFICATION_TYPES.BOOKING_CANCELLED,
                    related_booking_id: booking_id,
                    metadata: { booking_id, cancelled_by, user_name, vendor_name, event_date }
                }
            );
        } else if (cancelled_by === 'vendor') {
            // Vendor cancelled -> Notify user and admin
            notifications.push(
                {
                    user_id: user_id,
                    title: 'Booking Cancelled',
                    message: `${vendor_name} has cancelled your booking for ${event_date}. ${reason ? `Reason: ${reason}` : 'You can try booking with other vendors.'}`,
                    type: this.NOTIFICATION_TYPES.BOOKING_CANCELLED,
                    related_booking_id: booking_id,
                    metadata: { booking_id, cancelled_by, vendor_name, event_date, reason }
                },
                {
                    user_id: 'admin',
                    title: 'Booking Cancelled by Vendor',
                    message: `${vendor_name} cancelled a booking with ${user_name} for ${event_date}.`,
                    type: this.NOTIFICATION_TYPES.BOOKING_CANCELLED,
                    related_booking_id: booking_id,
                    metadata: { booking_id, cancelled_by, vendor_name, user_name, event_date }
                }
            );
        }

        await this.sendBulkNotifications(notifications);
    }

    // OTP NOTIFICATIONS

    // 7. OTP generated -> Notify user
    static async notifyOTPGenerated(otpData) {
        const { booking_id, user_id, otp_code, vendor_name, event_date, expires_at } = otpData;
        
        await NotificationModel.createNotification({
            user_id: user_id,
            title: 'OTP Code for Booking Verification',
            message: `Your OTP code is: ${otp_code}. Please share this with ${vendor_name} to verify your booking for ${event_date}. Code expires at ${new Date(expires_at).toLocaleTimeString()}.`,
            type: this.NOTIFICATION_TYPES.OTP_GENERATED,
            related_booking_id: booking_id,
            metadata: {
                booking_id,
                otp_code,
                vendor_name,
                event_date,
                expires_at,
                sensitive: true
            }
        });
    }

    // 8. OTP verified -> Notify user, vendor, admin
    static async notifyOTPVerified(otpData) {
        const { booking_id, user_id, vendor_id, vendor_name, event_date, package_name } = otpData;
        
        const notifications = [
            // Notify user
            {
                user_id: user_id,
                title: 'Booking Confirmed!',
                message: `Your booking with ${vendor_name} for ${package_name} on ${event_date} has been confirmed via OTP verification.`,
                type: this.NOTIFICATION_TYPES.OTP_VERIFIED,
                related_booking_id: booking_id,
                metadata: { booking_id, vendor_name, event_date, package_name }
            },
            // Notify vendor
            {
                user_id: `vendor_${vendor_id}`,
                title: 'Booking Confirmed',
                message: `OTP verification completed! The booking for ${package_name} on ${event_date} is now confirmed.`,
                type: this.NOTIFICATION_TYPES.OTP_VERIFIED,
                related_booking_id: booking_id,
                metadata: { booking_id, event_date, package_name }
            },
            // Notify admin
            {
                user_id: 'admin',
                title: 'Booking Confirmed via OTP',
                message: `Booking between ${otpData.user_name} and ${vendor_name} for ${event_date} has been confirmed via OTP verification.`,
                type: this.NOTIFICATION_TYPES.OTP_VERIFIED,
                related_booking_id: booking_id,
                metadata: {
                    booking_id,
                    user_name: otpData.user_name,
                    vendor_name,
                    event_date
                }
            }
        ];

        await this.sendBulkNotifications(notifications);
    }

    // 9. OTP reminder -> Notify vendor
    static async notifyOTPReminder(otpData) {
        const { booking_id, vendor_id, user_name, event_date, expires_at } = otpData;
        
        await NotificationModel.createNotification({
            user_id: `vendor_${vendor_id}`,
            title: 'OTP Verification Reminder',
            message: `Reminder: Please verify the OTP from ${user_name} for the booking on ${event_date}. OTP expires at ${new Date(expires_at).toLocaleTimeString()}.`,
            type: this.NOTIFICATION_TYPES.OTP_REMINDER,
            related_booking_id: booking_id,
            metadata: {
                booking_id,
                user_name,
                event_date,
                expires_at,
                action_required: true
            }
        });
    }

    // REVIEW NOTIFICATIONS

    // 10. Review submitted -> Notify vendor and admin
    static async notifyReviewSubmitted(reviewData) {
        const { booking_id, user_name, vendor_id, vendor_name, rating, review_text, event_date } = reviewData;
        
        const notifications = [
            // Notify vendor
            {
                user_id: `vendor_${vendor_id}`,
                title: 'New Review Received',
                message: `${user_name} left a ${rating}-star review for your service on ${event_date}. ${review_text ? '"' + review_text.substring(0, 100) + (review_text.length > 100 ? '..."' : '"') : ''}`,
                type: this.NOTIFICATION_TYPES.REVIEW_RECEIVED,
                related_booking_id: booking_id,
                metadata: {
                    booking_id,
                    user_name,
                    rating,
                    event_date,
                    review_text: review_text?.substring(0, 200)
                }
            },
            // Notify admin
            {
                user_id: 'admin',
                title: 'New Review Submitted',
                message: `${user_name} submitted a ${rating}-star review for ${vendor_name}'s service.`,
                type: this.NOTIFICATION_TYPES.REVIEW_SUBMITTED,
                related_booking_id: booking_id,
                metadata: {
                    booking_id,
                    user_name,
                    vendor_name,
                    rating,
                    event_date
                }
            }
        ];

        await this.sendBulkNotifications(notifications);
    }

    // 11. Review submission reminder -> Notify user
    static async notifyReviewReminder(bookingData) {
        const { booking_id, user_id, vendor_name, event_date, package_name } = bookingData;
        
        await NotificationModel.createNotification({
            user_id: user_id,
            title: 'Share Your Experience',
            message: `How was your experience with ${vendor_name} for ${package_name} on ${event_date}? Please leave a review to help other customers.`,
            type: this.NOTIFICATION_TYPES.BOOKING_COMPLETION_REMINDER,
            related_booking_id: booking_id,
            metadata: {
                booking_id,
                vendor_name,
                event_date,
                package_name,
                action_required: true
            }
        });
    }

    // ADMIN NOTIFICATIONS

    // 12. Vendor account created -> Notify admin
    static async notifyVendorAccountCreated(vendorData) {
        const { vendor_id, business_name, user_name, email, service_category } = vendorData;
        
        await NotificationModel.createNotification({
            user_id: 'admin',
            title: 'New Vendor Registration',
            message: `${user_name} (${email}) has registered as a vendor for ${business_name} in ${service_category} category. Please review for approval.`,
            type: this.NOTIFICATION_TYPES.VENDOR_ACCOUNT_CREATED,
            metadata: {
                vendor_id,
                business_name,
                user_name,
                email,
                service_category,
                action_required: true
            }
        });
    }

    // UTILITY METHODS

    // Get notification template
    static getNotificationTemplate(type, data) {
        const templates = {
            [this.NOTIFICATION_TYPES.BOOKING_CREATED]: {
                title: 'New Booking Request',
                message: `${data.user_name} has requested a booking for ${data.package_name} on ${data.event_date}.`
            },
            [this.NOTIFICATION_TYPES.BOOKING_CONFIRMED]: {
                title: 'Booking Confirmed',
                message: `Your booking for ${data.event_date} has been confirmed.`
            }
            // Add more templates as needed
        };

        return templates[type] || { title: 'Notification', message: 'You have a new notification.' };
    }

    // Schedule notification (for future implementation with job queue)
    static async scheduleNotification(notificationData, scheduleTime) {
        // This would integrate with a job queue system like Bull or Agenda
        // For now, we'll just create the notification immediately
        console.log(`Notification scheduled for ${scheduleTime}:`, notificationData);
        return await NotificationModel.createNotification(notificationData);
    }

    // Send notification with retry logic
    static async sendNotificationWithRetry(notificationData, maxRetries = 3) {
        let lastError;
        
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                return await NotificationModel.createNotification(notificationData);
            } catch (error) {
                lastError = error;
                console.error(`Notification attempt ${attempt} failed:`, error);
                
                if (attempt < maxRetries) {
                    // Wait before retry (exponential backoff)
                    await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
                }
            }
        }
        
        throw lastError;
    }
}

export default NotificationService;