import React from "react";
import { motion } from "framer-motion";
import { CheckCircle, Users, Star, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";

const points = [
  { icon: <CheckCircle size={30} />, title: "Verified Vendors" },
  { icon: <Users size={30} />, title: "10,000+ Happy Clients" },
  { icon: <Star size={30} />, title: "4.9/5 Rated Platform" },
  { icon: <Calendar size={30} />, title: "24/7 Booking Support" },
];

const WhyChooseUs = () => {
  const navigate = useNavigate();

  return (
    <section className="relative py-24 bg-gradient-to-b from-[#f5f9f9] to-[#e6f0f0] text-center overflow-hidden">

      {/* Title */}
      <h2 className="relative text-4xl md:text-5xl font-bold text-[#284b63] mb-14 z-10">
        Why <span className="text-[#f9a826]">Eventify</span>
      </h2>

      {/* Cards */}
      <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-10 max-w-6xl mx-auto px-6">
        {points.map((p, i) => (
          <motion.div
            key={p.title}
            className="bg-white/90 shadow-xl rounded-2xl p-6 flex flex-col items-center hover:shadow-2xl border border-gray-100"
          >
            <div className="p-4 bg-[#3c6e71]/10 rounded-full text-[#3c6e71]">
              {p.icon}
            </div>
            <h3 className="text-lg font-semibold mt-3">{p.title}</h3>
          </motion.div>
        ))}
      </div>

      {/* Explore Button */}
      <motion.button
        onClick={() => navigate("/why-us")}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        className="
          mt-12 px-10 py-3 bg-[#3c6e71] text-white rounded-full 
          font-semibold shadow-lg hover:bg-[#355b5b] transition
          relative z-[60]
        "
      >
        Explore More
      </motion.button>
    </section>
  );
};

export default WhyChooseUs;
