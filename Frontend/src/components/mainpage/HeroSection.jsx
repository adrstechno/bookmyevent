import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import HexCollage from "./HexCollage";

const bgImages = [
  "/images/herobg.jpg",
  "/images/herobg1.jpg",
  "/images/herobg2.jpg",
  "/images/herobg3.jpg",
];

const HeroSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-slide background every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % bgImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative text-white overflow-hidden">
      {/* Background Carousel */}
      <div className="absolute inset-0">
        {bgImages.map((img, index) => (
          <motion.div
            key={index}
            className={`absolute inset-0 bg-cover bg-center transition-all duration-1000 ${
              index === currentIndex ? "opacity-100" : "opacity-0"
            }`}
            style={{ backgroundImage: `url(${img})` }}
            animate={{ scale: index === currentIndex ? 1.1 : 1 }}
            transition={{ duration: 5, ease: "easeInOut" }}
          />
        ))}
      </div>

      {/* Gradient overlay for better text contrast */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/30 to-[#284b63]/30"></div>

      {/* Foreground Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-8 md:px-12 py-24 flex flex-col md:flex-row items-center justify-between gap-10">
        {/* Left Text Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="md:w-[45%] space-y-6 backdrop-blur-[2px] bg-black/30 p-8 rounded-2xl shadow-lg md:ml-[-30px]"
        >
          <h1 className="text-5xl font-bold leading-tight drop-shadow-[0_2px_5px_rgba(0,0,0,0.5)]">
            Plan Your <span className="text-[#f9a826]">Perfect Event</span> with Celebria
          </h1>

          <p className="text-lg text-gray-100 drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)]">
            Discover the best venues, vendors, and services — all in one place.
            Let’s make your celebration unforgettable.
          </p>

          <div className="flex gap-4 pt-2">
           <motion.button 
               whileHover={{ 
                 scale: 1.05,
                 boxShadow: "0 10px 30px rgba(249, 168, 38, 0.4)"
               }}
               whileTap={{ scale: 0.95 }}
               className="px-8 py-3 bg-[#f9a826] text-black rounded-full font-semibold hover:bg-[#f7b733] transition-all duration-300 shadow-lg relative overflow-hidden group"
             >
               <Link
                 to="category/weddings"
                 className="relative z-10 block w-full h-full"
               >
                 Explore Our Works
               </Link>
             
               <motion.div
                 className="absolute inset-0 bg-gradient-to-r from-[#f7b733] to-[#f9a826]"
                 initial={{ x: "-100%" }}
                 whileHover={{ x: "0%" }}
                 transition={{ duration: 0.3 }}
               />
             </motion.button>

            <motion.button 
              whileHover={{ 
                scale: 1.05,
                backgroundColor: "rgba(255, 255, 255, 1)",
                color: "#3c6e71",
                boxShadow: "0 10px 30px rgba(255, 255, 255, 0.3)"
              }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3 border-2 border-white rounded-full font-semibold transition-all duration-300 relative overflow-hidden group"
            >
               <Link
                 to="/register"
                 className="relative z-10 block w-full h-full"
               >
                 Explore Vendors
               </Link>
              <motion.div
                className="absolute inset-0 bg-white opacity-0 group-hover:opacity-100"
                transition={{ duration: 0.9 }}
              />
            </motion.button>
          </div>
        </motion.div>

        {/* Right Side Collage */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="md:w-[48%] flex justify-center md:justify-end"
        >
          <HexCollage />
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
