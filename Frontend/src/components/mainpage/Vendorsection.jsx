import { motion } from "framer-motion";
import { FiStar, FiAward, FiTrendingUp } from "react-icons/fi";
import TiltedCard from "./TiltedCard";

const vendors = [
  { name: "Royal Catering", img: "https://wallpaperaccess.com/full/5600894.jpg", rating: 4.9, projects: 150 },
  { name: "Bliss Decor", img: "https://deowgxgt4vwfe.cloudfront.net/uploads/1691055016_large.jpg", rating: 4.8, projects: 200 },
  { name: "Elite DJ", img: "https://picjumbo.com/wp-content/uploads/party-dj-in-dance-music-club-free-photo.jpg", rating: 5.0, projects: 180 },
  { name: "Pixel Moments", img: "https://j5u8f2v8.rocketcdn.me/wp-content/uploads/images/overcoming-photography-challenges-LCu.jpeg", rating: 4.9, projects: 220 },
];

const VendorsSection = () => (
  <section className="py-24 bg-gradient-to-b from-white to-gray-50 text-center relative overflow-hidden">
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

    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative z-10 mb-20"
      >
        <motion.h2
          className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#3c6e71] mb-6"
          initial={{ scale: 0.9 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          Featured <span className="text-[#f9a826]">Vendors</span>
        </motion.h2>
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: "120px" }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="h-1.5 bg-gradient-to-r from-[#f9a826] to-[#f7b733] mx-auto mb-6 rounded-full"
        />
        <motion.p
          className="text-gray-600 text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          Top-rated professionals ready to make your event extraordinary
        </motion.p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
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
            className="cursor-pointer group"
          >
            <TiltedCard
              imageSrc={v.img}
              altText={v.name}
              captionText={v.name}
              containerHeight="400px"
              containerWidth="100%"
              imageHeight="400px"
              imageWidth="100%"
              scaleOnHover={1.05}
              rotateAmplitude={10}
              showMobileWarning={false}
              showTooltip={true}
              displayOverlayContent={true}
              overlayContent={
                <div className="w-full h-[400px] flex flex-col justify-between p-4">
                  {/* Verified Badge */}
                  <div className="flex justify-end flex-shrink-0">
                    <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow-lg">
                      <FiAward className="w-3 h-3" />
                      Verified
                    </div>
                  </div>

                  {/* Stats and Content at bottom */}
                  <div className="space-y-3 flex-shrink-0">
                    <div className="flex justify-between items-center gap-2">
                      <div className="flex items-center gap-1 bg-white/95 backdrop-blur-xl px-3 py-2 rounded-full shadow-lg border border-gray-200">
                        <FiStar className="text-[#f9a826] fill-[#f9a826] w-4 h-4" />
                        <span className="text-sm font-bold text-gray-800">{v.rating}</span>
                      </div>
                      <div className="flex items-center gap-1 bg-white/95 backdrop-blur-xl px-3 py-2 rounded-full shadow-lg border border-gray-200">
                        <FiTrendingUp className="text-[#3c6e71] w-4 h-4" />
                        <span className="text-sm font-bold text-gray-800">{v.projects}+</span>
                      </div>
                    </div>

                    {/* Content Card */}
                    <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-4 shadow-2xl border border-gray-200 transform group-hover:scale-105 transition-transform duration-300">
                      <h3 className="font-bold text-lg text-gray-800 mb-2 line-clamp-1">
                        {v.name}
                      </h3>
                      <div className="h-1 bg-gradient-to-r from-[#f9a826] to-[#f7b733] w-16 mx-auto mb-3 rounded-full" />
                      <p className="text-sm text-gray-700 mb-4 font-medium">
                        Premium event services
                      </p>
                      <button className="w-full py-2.5 bg-gradient-to-r from-[#284b63] to-[#3c6e71] text-white rounded-xl text-sm font-semibold hover:from-[#3c6e71] hover:to-[#284b63] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
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
    </div>
  </section>
);

export default VendorsSection;
