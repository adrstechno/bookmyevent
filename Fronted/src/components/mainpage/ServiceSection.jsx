import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  SparklesIcon,
  BuildingOfficeIcon,
  MusicalNoteIcon,
  CakeIcon,
  CameraIcon,
  GlobeAltIcon,
} from "@heroicons/react/24/outline";

const services = [
  {
    title: "Weddings",
    slug: "weddings",
    description: "Plan your dream wedding with top venues, decor & catering.",
    icon: SparklesIcon,
    color: "from-pink-500 to-rose-500",
    image: "/images/Wedding.jpg",
  },
  {
    title: "Corporate Events",
    slug: "corporate-events",
    description: "Professional event setups, conferences & brand launches.",
    icon: BuildingOfficeIcon,
    color: "from-blue-500 to-cyan-500",
    image: "/images/Corporate-event.jpg",
  },
  {
    title: "Concerts & Festivals",
    slug: "concerts-festivals",
    description: "Lights, sound, and vibes — manage large-scale live events.",
    icon: MusicalNoteIcon,
    color: "from-purple-500 to-indigo-500",
    image: "/images/Concert.jpg",
  },
  {
    title: "Birthday Parties",
    slug: "birthday-parties",
    description: "Make every birthday special with themed decor & catering.",
    icon: CakeIcon,
    color: "from-yellow-500 to-orange-500",
    image: "/images/Birthday.jpg",
  },
  {
    title: "Fashion & Shows",
    slug: "fashion-shows",
    description: "Glamorous runway and stage event management.",
    icon: CameraIcon,
    color: "from-fuchsia-500 to-pink-500",
    image: "/images/FashionShow.jpg",
  },
  {
    title: "Exhibitions",
    slug: "exhibitions",
    description: "Plan & execute perfect exhibitions and trade fairs.",
    icon: GlobeAltIcon,
    color: "from-green-500 to-emerald-500",
    image: "/images/Exivision.jpg",
  },
];

const ServicesSection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 bg-gray-50 relative">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-[#284b63] mb-4">
          Explore Event Categories
        </h2>
        <p className="text-gray-600 text-lg">
          Choose your event type and find the best vendors to make it happen.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {services.map((service, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            whileHover={{ scale: 1.05 }}
            onClick={() => navigate(`/category/${service.slug}`)}
            className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer group"
          >
            <div className="relative h-48 overflow-hidden">
              <img
                src={service.image}
                alt={service.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>

              <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 1 }}
                >
                  <service.icon className="w-12 h-12 mb-3 text-[#f9a826]" />
                </motion.div>
                <h3 className="text-2xl font-semibold">{service.title}</h3>
              </div>
            </div>

            <div className="p-6 text-center">
              <p className="text-gray-700">{service.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default ServicesSection;
