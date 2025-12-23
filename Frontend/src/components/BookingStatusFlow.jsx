import { motion } from "framer-motion";
import { FiCheck, FiClock, FiX, FiShield, FiStar } from "react-icons/fi";

const FLOW_STEPS = [
  { key: "pending_vendor_response", label: "Vendor Review", icon: FiClock },
  { key: "accepted_by_vendor_pending_admin", label: "Admin Approval", icon: FiClock },
  { key: "approved_by_admin_pending_otp", label: "OTP Verification", icon: FiShield },
  { key: "booking_confirmed", label: "Confirmed", icon: FiCheck },
  { key: "awaiting_review", label: "Review", icon: FiStar },
  { key: "completed", label: "Completed", icon: FiCheck },
];

const STATUS_ORDER = {
  pending_vendor_response: 0,
  accepted_by_vendor_pending_admin: 1,
  approved_by_admin_pending_otp: 2,
  otp_verification_in_progress: 2,
  booking_confirmed: 3,
  awaiting_review: 4,
  completed: 5,
};

const BookingStatusFlow = ({ currentStatus }) => {
  const currentIndex = STATUS_ORDER[currentStatus] ?? -1;
  const isCancelled = currentStatus?.includes("cancelled") || currentStatus?.includes("rejected");

  if (isCancelled) {
    return (
      <div className="flex items-center gap-2 p-4 bg-red-50 rounded-xl border border-red-200">
        <FiX className="text-red-500 text-xl" />
        <span className="text-red-700 font-semibold">Booking Cancelled/Rejected</span>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between relative">
        {/* Progress Line */}
        <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 z-0">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(currentIndex / (FLOW_STEPS.length - 1)) * 100}%` }}
            transition={{ duration: 0.5 }}
            className="h-full bg-gradient-to-r from-[#284b63] to-[#3c6e71]"
          />
        </div>

        {/* Steps */}
        {FLOW_STEPS.map((step, index) => {
          const Icon = step.icon;
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isPending = index > currentIndex;

          return (
            <div key={step.key} className="flex flex-col items-center z-10">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                  isCompleted
                    ? "bg-green-500 border-green-500 text-white"
                    : isCurrent
                    ? "bg-[#3c6e71] border-[#3c6e71] text-white animate-pulse"
                    : "bg-white border-gray-300 text-gray-400"
                }`}
              >
                {isCompleted ? <FiCheck /> : <Icon />}
              </motion.div>
              <span
                className={`text-xs mt-2 font-medium text-center max-w-[80px] ${
                  isCompleted || isCurrent ? "text-gray-800" : "text-gray-400"
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BookingStatusFlow;
