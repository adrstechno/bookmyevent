

import React from "react";
import { motion } from "framer-motion";

const images = [
  "/images/event/event1.jpg",
  "/images/event/event2.jpg",
  "/images/event/event3.jpg",
  "/images/event/event4.jpg",
  "/images/event/event5.jpg",
  "/images/event/event6.jpg",
  "/images/event/event7.jpg",
  "/images/event/event8.jpg",
  "/images/event/event9.jpg",
  "/images/event/event10.jpg",
];

const ShowcaseSection = () => {
  return (
    <section className="relative py-28 bg-gradient-to-b from-[#f9fafb] to-[#edf3f3] overflow-hidden">
      {/* Ambient background animation */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-[-100px] left-[-100px] w-[400px] h-[400px] bg-[#f9a826]/30 blur-[150px] rounded-full"
          animate={{ scale: [1, 1.5, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-[-100px] right-[-100px] w-[350px] h-[350px] bg-[#3c6e71]/30 blur-[150px] rounded-full"
          animate={{ scale: [1.3, 0.8, 1.3] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Title Section */}
      <div className="text-center relative z-10 mb-16">
        <h2 className="text-4xl md:text-5xl font-bold text-[#284b63] mb-4">
          Timeless <span className="text-[#f9a826]">Celebrations</span>
        </h2>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Every image tells a story — experience the creativity and spirit
          behind each event we craft.
        </p>
      </div>

      {/* Showcase Area */}
      <div className="relative max-w-7xl mx-auto h-[520px] flex items-center justify-center">
        {/* Background motion layer (5 slow crossfading images) */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          {images.slice(5).map((src, index) => (
            <motion.img
              key={index}
              src={src}
              alt={`bg-${index}`}
              className="absolute w-full h-full object-cover opacity-30"
              animate={{
                opacity: [0.1, 0.4, 0.1],
                x: [index % 2 === 0 ? 30 : -30, 0, index % 2 === 0 ? 30 : -30],
                y: [index * 5, -index * 5, index * 5],
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 12 + index,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-b from-[#f9fafb]/60 to-[#edf3f3]/90"></div>
        </div>

        {/* Foreground cards (5 floating + zoom) */}
        <div className="relative z-10 flex items-center justify-center space-x-6">
          {images.slice(0, 5).map((src, index) => (
            <motion.div
              key={index}
              className="relative w-44 h-64 md:w-56 md:h-80 rounded-3xl overflow-hidden shadow-2xl border-[5px] border-white"
              style={{
                transform: `translateY(${index % 2 === 0 ? "10px" : "-10px"}) rotateY(${(index - 2) * 10}deg)`,
                zIndex: 10 - index,
              }}
              animate={{
                y: [0, -12, 0],
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 4 + index * 0.3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <motion.img
                src={src}
                alt={`event-${index}`}
                className="w-full h-full object-cover"
                whileHover={{
                  scale: 1.08,
                  rotate: (index - 2) * 3,
                }}
                transition={{ duration: 0.4 }}
              />
              {/* Subtle gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ShowcaseSection;
