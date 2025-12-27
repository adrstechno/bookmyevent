import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const CTASection = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section className="relative text-white text-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('/CTA.jpg')", // 🔹 Add your image here
        }}
      ></div>
      <div className="absolute inset-0 bg-gradient-to-br from-[#000000]/70 via-[#1a1a1a]/60 to-[#3c6e71]/70"></div>

      {/* Glowing Orbs */}
      <div className="absolute -top-40 left-10 w-[400px] h-[400px] bg-[#f9a826]/30 blur-[180px] rounded-full"></div>
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[#3c6e71]/25 blur-[160px] rounded-full"></div>

      {/* CTA Content */}
      <div className="relative z-10 max-w-3xl mx-auto py-24 px-6">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl md:text-5xl font-extrabold mb-6"
        >
          Make Your <span className="text-[#f9a826]">Dream Event</span> Come True ✨
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="text-gray-200 text-lg mb-10 max-w-2xl mx-auto leading-relaxed"
        >
          Let’s create moments that last forever — from weddings to corporate
          gatherings, we turn your vision into a perfect celebration.
        </motion.p>

        <motion.button
          onClick={() => setIsOpen(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-10 py-4 bg-[#f9a826] text-black text-lg font-semibold rounded-full shadow-lg hover:bg-[#f7b733] transition-all duration-300"
        >
          Get Started
        </motion.button>
      </div>

      {/* Modal Form */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay Blur */}
            <motion.div
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />

            {/* Modal Form */}
            <motion.div
              className="fixed inset-0 flex items-center justify-center z-50"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <div className="bg-white text-gray-800 rounded-2xl shadow-2xl p-8 w-[90%] max-w-lg relative">
                <h3 className="text-2xl font-semibold text-center mb-6 text-[#284b63]">
                  Let’s Get Started 🎉
                </h3>

                {/* Close Button */}
                <button
                  onClick={() => setIsOpen(false)}
                  className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl"
                >
                  ✕
                </button>

                {/* Form */}
                <form className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Full Name</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-[#3c6e71] focus:outline-none"
                      placeholder="Enter your name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <input
                      type="email"
                      className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-[#3c6e71] focus:outline-none"
                      placeholder="Enter your email"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Phone</label>
                    <input
                      type="tel"
                      className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-[#3c6e71] focus:outline-none"
                      placeholder="Enter your phone number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Event Type</label>
                    <select
                      className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-[#3c6e71] focus:outline-none"
                    >
                      <option>Wedding</option>
                      <option>Corporate</option>
                      <option>Birthday</option>
                      <option>Concert</option>
                      <option>Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Event Date</label>
                    <input
                      type="date"
                      className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-[#3c6e71] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Message</label>
                    <textarea
                      rows="3"
                      className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-[#3c6e71] focus:outline-none"
                      placeholder="Tell us more about your event..."
                    ></textarea>
                  </div>

                  <motion.button
                    type="submit"
                    className="w-full bg-[#3c6e71] text-white py-3 rounded-md font-semibold hover:bg-[#284b63] transition"
                    whileTap={{ scale: 0.97 }}
                  >
                    Submit
                  </motion.button>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </section>
  );
};

export default CTASection;
