// import React, { useEffect, useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";

// const ContactPopup = () => {
//   const [showPopup, setShowPopup] = useState(false);

//   // Auto-show after 4 seconds
//   useEffect(() => {
//     const timer = setTimeout(() => {
//       setShowPopup(true);
//     }, 4000);

//     return () => clearTimeout(timer);
//   }, []);

//   return (
//     <AnimatePresence>
//       {showPopup && (
//         <>
//           {/* Overlay */}
//           <motion.div
//             className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             onClick={() => setShowPopup(false)}
//           />

//           {/* Popup */}
//           <motion.div
//             className="fixed inset-0 flex items-center justify-center z-50"
//             initial={{ opacity: 0, scale: 0.8, y: 50 }}
//             animate={{ opacity: 1, scale: 1, y: 0 }}
//             exit={{ opacity: 0, scale: 0.8, y: 50 }}
//             transition={{ duration: 0.4, ease: "easeOut" }}
//           >
//             <div className="relative bg-white/90 backdrop-blur-xl shadow-2xl rounded-2xl p-6 w-[90%] max-w-md">

//               {/* Decorative background image */}
//               <div  
//                 className="absolute inset-0 bg-cover bg-center opacity-[0.5]"
//                 style={{ backgroundImage: "url('/images/ContectFormbg.jpg')" }}
//               />

//               {/* Close Button */}
//               <button
//                 onClick={() => setShowPopup(false)}
//                 className="absolute top-4 right-4 z-20 text-gray-700 text-xl hover:text-[#284b63]"
//               >
//                 ✕
//               </button>

//               <h2 className="text-2xl font-bold text-[#284b63] text-center mb-5 relative z-20">
//                 Get in Touch
//               </h2>

//               <form className="space-y-4 relative z-20">
//                 <div>
//                   <label className="text-sm font-medium">Name</label>
//                   <input
//                     type="text"
//                     className="w-full mt-1 px-3 py-2 rounded-lg bg-white/60 border border-gray-300 focus:border-[#284b63] focus:ring-2 focus:ring-[#284b63]/40 outline-none"
//                     placeholder="Enter your name"
//                   />
//                 </div>

//                 <div>
//                   <label className="text-sm font-medium">Email</label>
//                   <input
//                     type="email"
//                     className="w-full mt-1 px-3 py-2 rounded-lg bg-white/60 border border-gray-300 focus:border-[#284b63] focus:ring-2 focus:ring-[#284b63]/40 outline-none"
//                     placeholder="Enter your email"
//                   />
//                 </div>

//                 <div>
//                   <label className="text-sm font-medium">Phone</label>
//                   <input
//                     type="tel"
//                     className="w-full mt-1 px-3 py-2 rounded-lg bg-white/60 border border-gray-300 focus:border-[#284b63] focus:ring-2 focus:ring-[#284b63]/40 outline-none"
//                     placeholder="Enter phone number"
//                   />
//                 </div>

//                 <div>
//                   <label className="text-sm font-medium">Message</label>
//                   <textarea
//                     rows="3"
//                     className="w-full mt-1 px-3 py-2 rounded-lg bg-white/60 border border-gray-300 focus:border-[#284b63] focus:ring-2 focus:ring-[#284b63]/40 outline-none resize-none"
//                     placeholder="Write your message..."
//                   ></textarea>
//                 </div>

//                 <motion.button
//                   type="submit"
//                   whileHover={{ scale: 1.03 }}
//                   whileTap={{ scale: 0.97 }}
//                   className="w-full py-3 bg-[#284b63] text-white rounded-lg font-semibold hover:bg-[#3c6e71] transition-all"
//                 >
//                   Send Message
//                 </motion.button>
//               </form>
//             </div>
//           </motion.div>
//         </>
//       )}
//     </AnimatePresence>
//   );
// };

// export default ContactPopup;

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const ContactPopup = () => {
  const [showPopup, setShowPopup] = useState(false);

  // Auto popup in 4 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowPopup(true), 4000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {showPopup && (
        <>
          {/* Background Blur */}
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowPopup(false)}
          />

          {/* Popup Box */}
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50"
            initial={{ opacity: 0, scale: 0.7, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.7, y: 50 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
          <motion.div
  className="relative w-[85%] max-w-sm rounded-2xl overflow-hidden shadow-xl bg-white/20 backdrop-blur-xl border border-white/30"
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
>
  {/* BG IMAGE */}
  <div
    className="absolute inset-0 bg-cover bg-center opacity-[0.3] blur-[1px]"
    style={{
      backgroundImage: `url('/images/ContectFormbg.jpg')`,
    }}
  ></div>

  {/* CLOSE BUTTON */}
  <button
    onClick={() => setShowPopup(false)}
    className="absolute top-3 right-3 z-50 text-white text-xl font-bold hover:scale-110 transition"
  >
    ✕
  </button>

  {/* FORM CONTENT */}
  <div className="p-5 relative z-20">
    <h2 className="text-xl font-bold text-white drop-shadow mb-4 text-center">
      Contact Us
    </h2>

    <form className="space-y-3">
      {/* Name */}
      <motion.div
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <label className="text-white text-xs font-medium">Name</label>
        <input
          type="text"
          placeholder="Enter your name"
          className="w-full px-3 py-1.5 mt-1 rounded-lg bg-white/30 backdrop-blur-md text-white placeholder-white/70 border border-white/40 focus:ring-2 focus:ring-[#3c6e71] outline-none text-sm"
        />
      </motion.div>

      {/* Email */}
      <motion.div
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.15 }}
      >
        <label className="text-white text-xs font-medium">Email</label>
        <input
          type="email"
          placeholder="Enter your email"
          className="w-full px-3 py-1.5 mt-1 rounded-lg bg-white/30 backdrop-blur-md text-white placeholder-white/70 border border-white/40 focus:ring-2 focus:ring-[#3c6e71] outline-none text-sm"
        />
      </motion.div>

      {/* Phone */}
      <motion.div
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <label className="text-white text-xs font-medium">Phone</label>
        <input
          type="tel"
          placeholder="Enter phone number"
          className="w-full px-3 py-1.5 mt-1 rounded-lg bg-white/30 backdrop-blur-md text-white placeholder-white/70 border border-white/40 focus:ring-2 focus:ring-[#3c6e71] outline-none text-sm"
        />
      </motion.div>

      {/* Message */}
      <motion.div
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.25 }}
      >
        <label className="text-white text-xs font-medium">Message</label>
        <textarea
          rows="2"
          placeholder="Write your message"
          className="w-full px-3 py-1.5 mt-1 rounded-lg bg-white/30 backdrop-blur-md text-white placeholder-white/70 border border-white/40 focus:ring-2 focus:ring-[#3c6e71] outline-none text-sm resize-none"
        ></textarea>
      </motion.div>

      {/* Button */}
     <motion.button
  type="submit"
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  className="w-full py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md 
             text-white rounded-lg font-semibold shadow-lg transition text-sm
             border border-white/30"
>
  Send Message
</motion.button>

    </form>
  </div>
</motion.div>

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ContactPopup;
