import { motion } from "framer-motion";
import { FiStar, FiAward, FiTrendingUp } from "react-icons/fi";
import TiltedCard from "./TiltedCard";

const vendors = [
  { name: "Royal Catering", img: "https://content3.jdmagicbox.com/v2/comp/thrissur/w7/0484px484.x484.151211182026.r3w7/catalogue/royal-treat-kuttikkad-thrissur-caterers-YZjlYJT0yT.jpg", rating: 4.9, projects: 150 },
  { name: "Bliss Decor", img: "https://scontent.fdel5-3.fna.fbcdn.net/v/t51.82787-15/572151405_17934789912101861_7688204166942092089_n.jpg?stp=dst-jpegr_tt6&_nc_cat=108&ccb=1-7&_nc_sid=127cfc&_nc_ohc=dXPf2jNxxjYQ7kNvwExwMTD&_nc_oc=Adn5qWTM4wW4_maNZwFQZYXRaZt4i-Fms7bjjY79VyIYcM-AF7qayw4uA8RurjN7b0U&_nc_zt=23&se=-1&_nc_ht=scontent.fdel5-3.fna&_nc_gid=tUEDvozNjXTCNrvtSF1gTQ&oh=00_AflxseOlOEvcjHmAcIte2iPKj5kBgXb7v6hT0cTWjYbk4A&oe=695944BD", rating: 4.8, projects: 200 },
  { name: "Elite DJ", img: "https://i.scdn.co/image/ab67616d0000b27396f587b971b1a59c5e76ecae", rating: 5.0, projects: 180 },
  { name: "Pixel Moments", img: "https://cdn.sanity.io/images/soj3d0g3/production/76be518e03b0dbc79ebd68216909390841f09e86-5184x3456.jpg", rating: 4.9, projects: 220 },
];

const VendorsSection = () => (
  <section className="py-20 bg-gradient-to-b from-white to-gray-50 text-center relative overflow-hidden">
    {/* Animated Background Pattern */}
    <div className="absolute inset-0 opacity-5 pointer-events-none">
      <motion.div
        animate={{
          backgroundPosition: ["0% 0%", "100% 100%"],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          repeatType: "reverse",
        }}
        className="absolute inset-0"
        style={{
          backgroundImage: 'radial-gradient(circle, #3c6e71 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}
      />
    </div>

    <motion.div
      initial={{ opacity: 0, y: -30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="relative z-10"
    >
      <motion.h2 
        className="text-5xl font-bold text-[#3c6e71] mb-4"
        initial={{ scale: 0.9 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        Featured <span className="text-[#f9a826]">Vendors</span>
      </motion.h2>
      <motion.div
        initial={{ width: 0 }}
        whileInView={{ width: "100px" }}
        viewport={{ once: true }}
        transition={{ delay: 0.3, duration: 0.8 }}
        className="h-1 bg-[#f9a826] mx-auto mb-4 rounded-full"
      />
      <motion.p 
        className="text-gray-600 text-lg max-w-2xl mx-auto mb-12"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4 }}
      >
        Top-rated professionals ready to make your event extraordinary
      </motion.p>
    </motion.div>

    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 max-w-7xl mx-auto px-6 relative z-10">
      {vendors.map((v, index) => (
        <motion.div
          key={v.name}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ 
            duration: 0.5, 
            delay: index * 0.1
          }}
          className="cursor-pointer"
        >
          <TiltedCard
            imageSrc={v.img}
            altText={v.name}
            captionText={v.name}
            containerHeight="360px"
            containerWidth="100%"
            imageHeight="360px"
            imageWidth="100%"
            scaleOnHover={1.05}
            rotateAmplitude={10}
            showMobileWarning={false}
            showTooltip={true}
            displayOverlayContent={true}
            overlayContent={
              <div className="w-full h-[360px] flex flex-col justify-between p-3">
                {/* Verified Badge */}
                <div className="flex justify-end flex-shrink-0">
                  <div className="bg-green-500 text-white p-1.5 rounded-full shadow-2xl border-2 border-white/50">
                    <FiAward className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* Stats and Content at bottom */}
                <div className="space-y-2 flex-shrink-0">
                  <div className="flex justify-between items-center gap-2">
                    <div className="flex items-center gap-1 bg-white/95 backdrop-blur-md px-2 py-1 rounded-full shadow-lg border border-gray-200">
                      <FiStar className="text-[#f9a826] fill-[#f9a826] w-3 h-3" />
                      <span className="text-xs font-bold text-gray-800">{v.rating}</span>
                    </div>
                    <div className="flex items-center gap-1 bg-white/95 backdrop-blur-md px-2 py-1 rounded-full shadow-lg border border-gray-200">
                      <FiTrendingUp className="text-[#3c6e71] w-3 h-3" />
                      <span className="text-xs font-bold text-gray-800">{v.projects}+</span>
                    </div>
                  </div>

                  {/* Content Card */}
                  <div className="bg-white/95 backdrop-blur-md rounded-xl p-3 shadow-2xl border border-gray-200">
                    <h3 className="font-bold text-base text-gray-800 mb-1 line-clamp-1">
                      {v.name}
                    </h3>
                    <div className="h-0.5 bg-[#f9a826] w-12 mx-auto mb-2 rounded-full" />
                    <p className="text-[10px] text-gray-700 mb-2 font-medium">
                      Premium event services
                    </p>
                    <button className="w-full py-1.5 bg-gradient-to-r from-[#284b63] to-[#3c6e71] text-white rounded-lg text-xs font-semibold hover:from-[#3c6e71] hover:to-[#284b63] transition-all duration-300 shadow-md">
                      View Profile
                    </button>
                  </div>
                </div>
              </div>
            }
          />
        </motion.div>
      ))}
    </div>
  </section>
);

export default VendorsSection;
