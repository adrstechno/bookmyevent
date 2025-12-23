import React from "react";
import { motion } from "framer-motion";

const images = [
  "/images/img1.jpg",
  "/images/img2.jpg",
  "/images/img3.jpg",
  "/images/img4.jpg",
  "/images/img5.jpg",
  "/images/img6.jpg",
  "/images/img7.jpg",
];

const HexCollage = () => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 30 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      transition={{
        duration: 1.2,
        ease: [0.25, 0.8, 0.25, 1],
      }}
      className="relative flex flex-col items-center justify-center gap-2 md:gap-3"
    >
      {/* Row 1 */}
      <div className="flex gap-2 md:gap-3">
        <FloatingHex delay={0} src={images[0]} />
        <FloatingHex delay={0.3} src={images[1]} />
      </div>

      {/* Row 2 */}
      <div className="flex gap-2 md:gap-3 mt-[-28px]">
        <FloatingHex delay={0.1} src={images[2]} />
        <FloatingHex delay={0.4} src={images[3]} />
        <FloatingHex delay={0.2} src={images[4]} />
      </div>

      {/* Row 3 */}
      <div className="flex gap-2 md:gap-3 mt-[-28px]">
        <FloatingHex delay={0.5} src={images[5]} />
        <FloatingHex delay={0.25} src={images[6]} />
      </div>
    </motion.div>
  );
};

// Reusable Floating Hex Component
const FloatingHex = ({ src, delay = 0 }) => (
  <motion.div
    className="w-32 h-32 md:w-44 md:h-44 relative group"
    animate={{
      y: [0, -10, 0],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut",
        delay,
      },
    }}
  >
    {/* Hex Image */}
    <motion.img
      src={src}
      alt="collage"
      className="object-cover w-full h-full shadow-xl transition-transform duration-700 group-hover:scale-110"
      style={{
        clipPath:
          "polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)",
      }}
      whileHover={{
        rotate: [0, 2, -2, 0],
        transition: { duration: 0.8, ease: "easeInOut" },
      }}
    />

    {/* Golden Glow Overlay */}
    <div
      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500"
      style={{
        clipPath:
          "polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)",
        background:
          "linear-gradient(145deg, rgba(249,168,38,0.35), rgba(255,255,255,0.15))",
        boxShadow: "0 0 15px rgba(249,168,38,0.3)",
      }}
    ></div>
  </motion.div>
);

export default HexCollage;

