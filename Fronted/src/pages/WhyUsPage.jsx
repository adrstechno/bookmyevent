import React from "react";
import { motion } from "framer-motion";

const highlights = [
  {
    title: "Wedding Events",
    desc: "From décor to management — crafted with elegance.",
    img: "/images/event/event3.jpg",
  },
  {
    title: "Corporate Events",
    desc: "Professional setups for conferences, launches & summits.",
    img: "/images/event/event7.jpg",
  },
  {
    title: "Birthday Parties",
    desc: "Fun, colorful, and customized celebrations.",
    img: "/images/event/event2.jpg",
  },
  {
    title: "Live Concerts",
    desc: "Stunning lighting, sound & artist coordination.",
    img: "/images/event/event10.jpg",
  },
];

const WhyUsPage = () => {
  return (
    <section className="py-24 px-6 max-w-7xl mx-auto relative z-20 pb-32">

      {/* Page Title */}
      <h1 className="text-4xl md:text-5xl font-bold text-center text-[#284b63] mb-12">
        Why <span className="text-[#f9a826]">Festyfi</span> Stands Out
      </h1>

      <p className="text-center text-gray-600 mb-16 max-w-2xl mx-auto">
        We don’t just plan events — we create unforgettable experiences.
        Explore what makes our services trusted by thousands.
      </p>

      {/* Highlight Cards */}
      <div className="grid md:grid-cols-2 gap-12">
        {highlights.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="rounded-2xl shadow-xl overflow-hidden bg-white border hover:shadow-2xl"
          >
            <img src={item.img} alt="" className="w-full h-64 object-cover" />

            <div className="p-6">
              <h3 className="text-2xl font-bold text-[#3c6e71] mb-2">
                {item.title}
              </h3>
              <p className="text-gray-600">{item.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>

    </section>
  );
};

export default WhyUsPage;
