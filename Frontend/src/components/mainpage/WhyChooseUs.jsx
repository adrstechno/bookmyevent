import React from "react";
import { motion } from "framer-motion";
import { CheckCircle, Users, Star, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";

const points = [
  { icon: <CheckCircle size={30} />, title: "Verified Vendors" },
  { icon: <Users size={30} />, title: "Happy Clients" },
  { icon: <Star size={30} />, title: "4.5 Rated Platform" },
  { icon: <Calendar size={30} />, title: "24/7 Booking Support" },
];

const WhyChooseUs = () => {
  const navigate = useNavigate();

  return (
    <section className="relative py-16 text-center overflow-hidden">
      {/* Clean Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-blue-50/30" />

      {/* Subtle Decorative Elements */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-br from-[#3c6e71]/20 to-transparent rounded-full blur-3xl"
        />
        <motion.div
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{ duration: 10, repeat: Infinity, delay: 1 }}
          className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-to-br from-[#f9a826]/15 to-transparent rounded-full blur-3xl"
        />
      </div>

      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-20"
        >
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#284b63] mb-6">
            Why <span className="text-[#f9a826]">GoEventify</span>
          </h2>
          <div className="h-1.5 bg-gradient-to-r from-[#f9a826] to-[#f7b733] w-32 mx-auto rounded-full mb-6" />
          <p className="text-gray-600 text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed">
            Discover what makes us the preferred choice for event planning
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {points.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group"
            >
              <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-3xl p-8 flex flex-col items-center hover:shadow-2xl border border-gray-100/50 transition-all duration-300 transform hover:-translate-y-2 hover:scale-105">
                <div className="w-20 h-20 bg-gradient-to-br from-[#3c6e71] to-[#284b63] rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                  {p.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-[#3c6e71] transition-colors duration-300">
                  {p.title}
                </h3>
                <div className="w-12 h-1 bg-gradient-to-r from-[#f9a826] to-[#f7b733] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Explore Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <button
            onClick={() => navigate("/why-us")}
            className="group px-10 py-4 bg-gradient-to-r from-[#3c6e71] to-[#284b63] text-white text-lg font-semibold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105"
          >
            <span className="flex items-center gap-3">
              Explore More
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </span>
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
