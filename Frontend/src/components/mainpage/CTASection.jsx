import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const CTASection = () => {
  const navigate = useNavigate();

  // Handle CTA click
  const handleGetStarted = () => {
    const role = localStorage.getItem("role");

    if (!role) {
      // User not logged in → Login page
      navigate("/login");
    } else {
      // User logged in → Categories page
      navigate("/category/concerts-festivals");
      // 🔹 Agar aapka exact route alag ho
      // jaise "/categories" ya "/category/weddings"
      // to yahan update kar sakte ho
    }
  };

  return (
    <section className="relative text-white text-center overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('https://static.vecteezy.com/system/resources/thumbnails/051/247/718/small_2x/golden-confetti-falls-against-a-blue-curtain-backdrop-during-a-vibrant-celebration-event-free-photo.jpeg')" }}
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-[#1a1a1a]/60 to-[#3c6e71]/70" />

      {/* Glow Effects */}
      <div className="absolute -top-40 left-10 w-[400px] h-[400px] bg-[#f9a826]/30 blur-[180px] rounded-full" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[#3c6e71]/25 blur-[160px] rounded-full" />

      {/* Content */}
      <div className="relative z-10 max-w-3xl mx-auto py-24 px-6">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl md:text-5xl font-extrabold mb-6"
        >
          Make Your{" "}
          <span className="text-[#f9a826]">Dream Event</span>{" "}
          Come True ✨
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="text-gray-200 text-lg mb-10 max-w-2xl mx-auto leading-relaxed"
        >
          From weddings to corporate gatherings, explore trusted vendors
          and plan unforgettable events — all in one place.
        </motion.p>

        {/* CTA Button */}
        <motion.button
          onClick={handleGetStarted}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-10 py-4 bg-[#f9a826] text-black text-lg font-semibold rounded-full shadow-lg hover:bg-[#f7b733] transition-all duration-300"
        >
          Get Started
        </motion.button>
      </div>
    </section>
  );
};

export default CTASection;
