import { useEffect } from "react";
import { X } from "lucide-react";

const TermsAndConditionsModal = ({ isOpen, onClose }) => {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-[#284b63] to-[#3c6e71] text-white px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-2xl font-bold">Terms and Conditions</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)] px-6 py-6">
          <div className="prose prose-sm max-w-none">
            {/* Last Updated */}
            <p className="text-sm text-gray-500 mb-6">
              <strong>Last Updated:</strong> March 26, 2026
            </p>

            {/* Introduction */}
            <section className="mb-6">
              <h3 className="text-xl font-bold text-[#284b63] mb-3">
                1. Introduction
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Welcome to GoEventify! These Terms and Conditions ("Terms") govern your use of our event management and vendor marketplace platform located at goeventify.com. By accessing or using our services, you agree to be bound by these Terms. If you disagree with any part of these Terms, please do not use our platform.
              </p>
            </section>

            {/* Definitions */}
            <section className="mb-6">
              <h3 className="text-xl font-bold text-[#284b63] mb-3">
                2. Definitions
              </h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li><strong>"Platform"</strong> refers to GoEventify website and mobile applications</li>
                <li><strong>"User"</strong> refers to customers booking event services</li>
                <li><strong>"Vendor"</strong> refers to service providers offering event-related services</li>
                <li><strong>"Services"</strong> refers to event planning, vendor booking, and related services</li>
                <li><strong>"Booking"</strong> refers to a confirmed reservation of vendor services</li>
              </ul>
            </section>

            {/* User Accounts */}
            <section className="mb-6">
              <h3 className="text-xl font-bold text-[#284b63] mb-3">
                3. User Accounts
              </h3>
              <div className="space-y-3 text-gray-700">
                <p><strong>3.1 Registration:</strong> You must create an account to use certain features. You agree to provide accurate, current, and complete information during registration.</p>
                <p><strong>3.2 Account Security:</strong> You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account.</p>
                <p><strong>3.3 Age Requirement:</strong> You must be at least 18 years old to create an account and use our services.</p>
                <p><strong>3.4 Account Types:</strong> We offer two account types - User accounts for booking services and Vendor accounts for providing services.</p>
              </div>
            </section>

            {/* User Responsibilities */}
            <section className="mb-6">
              <h3 className="text-xl font-bold text-[#284b63] mb-3">
                4. User Responsibilities
              </h3>
              <p className="text-gray-700 mb-2">As a User, you agree to:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Provide accurate event details and requirements</li>
                <li>Make timely payments for confirmed bookings</li>
                <li>Communicate respectfully with vendors</li>
                <li>Verify OTP codes at the time of service delivery</li>
                <li>Provide honest reviews and feedback</li>
                <li>Comply with cancellation policies</li>
              </ul>
            </section>

            {/* Vendor Responsibilities */}
            <section className="mb-6">
              <h3 className="text-xl font-bold text-[#284b63] mb-3">
                5. Vendor Responsibilities
              </h3>
              <p className="text-gray-700 mb-2">As a Vendor, you agree to:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Provide accurate service descriptions and pricing</li>
                <li>Maintain professional standards of service</li>
                <li>Honor confirmed bookings and commitments</li>
                <li>Verify customer OTP codes before service completion</li>
                <li>Respond promptly to booking inquiries</li>
                <li>Maintain valid licenses and permits as required</li>
                <li>Upload genuine photos and portfolio items</li>
              </ul>
            </section>

            {/* Booking and Payments */}
            <section className="mb-6">
              <h3 className="text-xl font-bold text-[#284b63] mb-3">
                6. Booking and Payments
              </h3>
              <div className="space-y-3 text-gray-700">
                <p><strong>6.1 Booking Process:</strong> All bookings are subject to vendor availability and admin approval.</p>
                <p><strong>6.2 Payment Terms:</strong> Payments must be made through our secure payment gateway. We accept credit/debit cards, UPI, and other approved payment methods.</p>
                <p><strong>6.3 Service Fees:</strong> GoEventify charges a service fee for facilitating bookings, which is included in the total booking amount.</p>
                <p><strong>6.4 OTP Verification:</strong> Service completion requires OTP verification. Payment is released to vendors only after successful OTP verification.</p>
                <p><strong>6.5 Refunds:</strong> Refund eligibility depends on the cancellation policy and timing. Refunds are processed within 7-10 business days.</p>
              </div>
            </section>

            {/* Cancellation Policy */}
            <section className="mb-6">
              <h3 className="text-xl font-bold text-[#284b63] mb-3">
                7. Cancellation Policy
              </h3>
              <div className="space-y-3 text-gray-700">
                <p><strong>7.1 User Cancellations:</strong></p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>More than 30 days before event: 90% refund</li>
                  <li>15-30 days before event: 50% refund</li>
                  <li>7-14 days before event: 25% refund</li>
                  <li>Less than 7 days before event: No refund</li>
                </ul>
                <p><strong>7.2 Vendor Cancellations:</strong> Vendors who cancel confirmed bookings may face penalties and account suspension.</p>
                <p><strong>7.3 Force Majeure:</strong> Neither party is liable for cancellations due to circumstances beyond reasonable control (natural disasters, government restrictions, etc.).</p>
              </div>
            </section>

            {/* Prohibited Activities */}
            <section className="mb-6">
              <h3 className="text-xl font-bold text-[#284b63] mb-3">
                8. Prohibited Activities
              </h3>
              <p className="text-gray-700 mb-2">You agree NOT to:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Use the platform for any illegal or unauthorized purpose</li>
                <li>Circumvent the platform to make direct payments to vendors</li>
                <li>Post false, misleading, or fraudulent information</li>
                <li>Harass, abuse, or harm other users or vendors</li>
                <li>Upload viruses, malware, or harmful code</li>
                <li>Scrape, copy, or misuse platform content</li>
                <li>Create multiple accounts to manipulate reviews or ratings</li>
                <li>Share OTP codes with unauthorized persons</li>
              </ul>
            </section>

            {/* Intellectual Property */}
            <section className="mb-6">
              <h3 className="text-xl font-bold text-[#284b63] mb-3">
                9. Intellectual Property
              </h3>
              <div className="space-y-3 text-gray-700">
                <p><strong>9.1 Platform Content:</strong> All content on GoEventify, including logos, text, graphics, and software, is owned by GoEventify and protected by intellectual property laws.</p>
                <p><strong>9.2 User Content:</strong> You retain ownership of content you upload but grant GoEventify a license to use, display, and distribute it on the platform.</p>
                <p><strong>9.3 Vendor Content:</strong> Vendors are responsible for ensuring they have rights to all photos, descriptions, and materials they upload.</p>
              </div>
            </section>

            {/* Privacy and Data Protection */}
            <section className="mb-6">
              <h3 className="text-xl font-bold text-[#284b63] mb-3">
                10. Privacy and Data Protection
              </h3>
              <div className="space-y-3 text-gray-700">
                <p><strong>10.1 Data Collection:</strong> We collect and process personal data as described in our Privacy Policy.</p>
                <p><strong>10.2 Data Security:</strong> We implement industry-standard security measures to protect your data.</p>
                <p><strong>10.3 Data Sharing:</strong> We share necessary booking information with vendors to facilitate services. We do not sell your personal data to third parties.</p>
                <p><strong>10.4 Cookies:</strong> We use cookies to enhance user experience and analyze platform usage.</p>
              </div>
            </section>

            {/* Liability and Disclaimers */}
            <section className="mb-6">
              <h3 className="text-xl font-bold text-[#284b63] mb-3">
                11. Liability and Disclaimers
              </h3>
              <div className="space-y-3 text-gray-700">
                <p><strong>11.1 Platform Role:</strong> GoEventify acts as a marketplace connecting users and vendors. We are not responsible for the quality, safety, or legality of services provided by vendors.</p>
                <p><strong>11.2 Vendor Verification:</strong> While we verify vendor credentials, users should conduct their own due diligence.</p>
                <p><strong>11.3 Service Disputes:</strong> Disputes between users and vendors should be resolved directly. GoEventify may assist in mediation but is not liable for outcomes.</p>
                <p><strong>11.4 Limitation of Liability:</strong> GoEventify's liability is limited to the amount paid for the specific booking in question.</p>
              </div>
            </section>

            {/* Dispute Resolution */}
            <section className="mb-6">
              <h3 className="text-xl font-bold text-[#284b63] mb-3">
                12. Dispute Resolution
              </h3>
              <div className="space-y-3 text-gray-700">
                <p><strong>12.1 Customer Support:</strong> Contact our support team at goeventify@gmail.com or +91 9201976523 for assistance.</p>
                <p><strong>12.2 Mediation:</strong> We encourage parties to resolve disputes through good-faith negotiation and mediation.</p>
                <p><strong>12.3 Jurisdiction:</strong> These Terms are governed by the laws of India. Disputes will be subject to the exclusive jurisdiction of courts in Jabalpur, Madhya Pradesh.</p>
              </div>
            </section>

            {/* Account Termination */}
            <section className="mb-6">
              <h3 className="text-xl font-bold text-[#284b63] mb-3">
                13. Account Termination
              </h3>
              <div className="space-y-3 text-gray-700">
                <p><strong>13.1 User Termination:</strong> You may close your account at any time by contacting support.</p>
                <p><strong>13.2 Platform Termination:</strong> We reserve the right to suspend or terminate accounts that violate these Terms.</p>
                <p><strong>13.3 Effect of Termination:</strong> Upon termination, you lose access to your account and any pending bookings may be cancelled.</p>
              </div>
            </section>

            {/* Changes to Terms */}
            <section className="mb-6">
              <h3 className="text-xl font-bold text-[#284b63] mb-3">
                14. Changes to Terms
              </h3>
              <p className="text-gray-700">
                We reserve the right to modify these Terms at any time. Changes will be effective immediately upon posting. Continued use of the platform after changes constitutes acceptance of the modified Terms. We will notify users of significant changes via email or platform notifications.
              </p>
            </section>

            {/* Contact Information */}
            <section className="mb-6">
              <h3 className="text-xl font-bold text-[#284b63] mb-3">
                15. Contact Information
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 mb-2"><strong>GoEventify</strong></p>
                <p className="text-gray-700">71, Dadda Nagar Near Katangi Highway</p>
                <p className="text-gray-700">Jabalpur, Madhya Pradesh 482001</p>
                <p className="text-gray-700 mt-2">
                  <strong>Email:</strong> goeventify@gmail.com
                </p>
                <p className="text-gray-700">
                  <strong>Phone:</strong> +91 9201976523
                </p>
                <p className="text-gray-700">
                  <strong>Website:</strong> https://goeventify.com
                </p>
              </div>
            </section>

            {/* Acceptance */}
            <section className="mb-6">
              <div className="bg-[#f9a826]/10 border-l-4 border-[#f9a826] p-4 rounded">
                <p className="text-gray-800 font-semibold">
                  By creating an account and using GoEventify, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.
                </p>
              </div>
            </section>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-[#284b63] to-[#3c6e71] text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditionsModal;
