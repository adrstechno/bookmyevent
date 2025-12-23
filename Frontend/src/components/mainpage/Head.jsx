import React from "react";
import { motion } from "framer-motion";

const Head = () => {
  return (
    <div className="bg-[#3c6e71] text-white text-sm py-2 overflow-hidden">
      <motion.div
        className="whitespace-nowrap font-medium tracking-wide"
        animate={{ x: ["100%", "-100%"] }}
        transition={{
          duration: 50,   // 👈 Very slow & elegant
          repeat: Infinity,
          ease: "linear",
        }}
      >
        🎉 Book your event now and get <span className="font-semibold">25% OFF</span> on all premium vendors!
      </motion.div>
    </div>
  );
};

export default Head;
