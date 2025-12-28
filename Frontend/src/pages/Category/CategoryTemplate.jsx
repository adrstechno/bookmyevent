import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Footer from "../../components/mainpage/Footer";
import HomeNavbar from "../../components/mainpage/HomeNavbar";
import { FiCheck, FiStar, FiArrowLeft } from "react-icons/fi";

const CategoryTemplate = ({
  bannerImage,
  categoryTitle,
  description1,
  description2,
  hotelList = [],
  services = [],
  categorySlug = "",
}) => {
  const navigate = useNavigate();

  return (
    <div className="w-full bg-gray-50 flex flex-col">
      {/* ================= NAVBAR ================= */}
      <HomeNavbar />

      {/* ================= FIXED BACK BUTTON ================= */}
      <motion.button
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
        onClick={() => navigate("/")}
        className="fixed top-24 left-6 z-50 bg-white hover:bg-[#3c6e71] text-[#3c6e71] hover:text-white p-4 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 group border-2 border-[#3c6e71]"
        title="Back to Home"
      >
        <FiArrowLeft className="text-2xl group-hover:scale-110 transition-transform" />
      </motion.button>

      {/* ================= HERO BANNER ================= */}
      <div className="relative w-full h-[70vh] overflow-hidden">
        <img
          src={bannerImage}
          className="w-full h-full object-cover"
          alt={categoryTitle}
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute bottom-0 left-0 right-0 p-8 md:p-16 text-white"
        >
          <div className="max-w-7xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold mb-4">{categoryTitle}</h1>
            <p className="text-xl md:text-2xl text-gray-200 max-w-3xl">
              Creating unforgettable experiences with professional event management
            </p>
          </div>
        </motion.div>
      </div>

      {/* ================= ABOUT SECTION ================= */}
      <div className="max-w-7xl mx-auto px-6 py-20 grid lg:grid-cols-2 gap-12 items-center">
        {/* LEFT TEXT CARD */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-br from-white to-gray-50 shadow-2xl p-10 rounded-3xl border border-gray-100"
        >
          <span className="text-xs tracking-widest bg-[#3c6e71] text-white rounded-full px-4 py-2 font-semibold">
            PREMIUM SERVICE
          </span>

          <h2 className="text-4xl font-bold mt-6 text-gray-900 bg-gradient-to-r from-[#3c6e71] to-[#284b63] bg-clip-text text-transparent">
            {categoryTitle}
          </h2>

          <p className="text-gray-700 mt-6 leading-relaxed text-lg">{description1}</p>
          <p className="text-gray-600 mt-4 leading-relaxed">{description2}</p>

          <div className="mt-8 flex flex-wrap gap-4">
            <div className="flex items-center gap-2 text-[#3c6e71]">
              <FiCheck className="text-2xl" />
              <span className="font-semibold">Professional Team</span>
            </div>
            <div className="flex items-center gap-2 text-[#3c6e71]">
              <FiStar className="text-2xl" />
              <span className="font-semibold">Top Quality</span>
            </div>
          </div>
        </motion.div>

        {/* RIGHT IMAGE */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative group"
        >
          <img
            src={bannerImage}
            className="rounded-3xl shadow-2xl w-full object-cover h-[500px] group-hover:scale-105 transition-transform duration-500"
            alt={`${categoryTitle} section`}
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#3c6e71]/20 to-transparent rounded-3xl"></div>
        </motion.div>
      </div>

      {/* ================= VENUE LIST SECTION ================= */}
      {hotelList.length > 0 && (
        <div className="bg-white py-20">
          <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative group"
            >
              <img
                src={bannerImage}
                className="rounded-3xl shadow-2xl w-full object-cover h-[450px] group-hover:scale-105 transition-transform duration-500"
                alt="Venues"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-[#f9a826]/20 to-transparent rounded-3xl"></div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-gradient-to-br from-gray-50 to-white shadow-2xl p-10 rounded-3xl border border-gray-100"
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Our Partner Venues
              </h2>
              <p className="text-gray-600 mb-6">
                We collaborate with the finest venues to ensure your event is perfect
              </p>

              <ul className="space-y-3">
                {hotelList.map((item, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-3 text-gray-700 font-medium"
                  >
                    <FiCheck className="text-[#3c6e71] text-xl flex-shrink-0" />
                    {item}
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      )}

      {/* ================= SERVICES GRID ================= */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Our <span className="text-[#f9a826]">Services</span>
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Comprehensive solutions for your {categoryTitle.toLowerCase()} needs
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, i) => {
            // Check if service is object with name and image, or just string
            const serviceName = typeof service === 'string' ? service : service.name;
            const serviceImage = typeof service === 'string' ? bannerImage : service.image;
            
            return (
              <motion.div
                key={serviceName}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100"
              >
                <div className="relative h-56 w-full overflow-hidden">
                  <img
                    src={serviceImage}
                    className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                    alt={serviceName}
                    onError={(e) => {
                      e.currentTarget.src = bannerImage;
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-xl font-bold text-white">{serviceName}</h3>
                  </div>
                </div>

                <div className="p-6">
                  <p className="text-gray-600 text-sm">
                    Professional {serviceName.toLowerCase()} services tailored to your needs
                  </p>
                  <div className="mt-4 flex items-center text-[#3c6e71] font-semibold">
                    <FiCheck className="mr-2" />
                    <span className="text-sm">Available</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

  
      {/* ================= FOOTER ================= */}
      <Footer />
    </div>
  );
};

export default CategoryTemplate;
