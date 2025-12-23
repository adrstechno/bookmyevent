import { motion } from "framer-motion";
import { FiAward, FiUsers, FiTrendingUp, FiHeart, FiTarget, FiZap } from "react-icons/fi";
import Footer from "../components/mainpage/Footer";
import HomeNavbar from "../components/mainpage/HomeNavbar";
import Stack from "../components/mainpage/Stack";

const AboutPage = () => {
  const stats = [
    { icon: FiUsers, value: "500+", label: "Happy Clients", color: "from-blue-500 to-cyan-500" },
    { icon: FiAward, value: "1000+", label: "Events Completed", color: "from-purple-500 to-pink-500" },
    { icon: FiTrendingUp, value: "15+", label: "Years Experience", color: "from-green-500 to-emerald-500" },
    { icon: FiHeart, value: "98%", label: "Satisfaction Rate", color: "from-red-500 to-rose-500" },
  ];

  const values = [
    {
      icon: FiTarget,
      title: "Excellence",
      description: "We strive for perfection in every event we manage, ensuring exceptional quality and attention to detail.",
      color: "bg-blue-50 text-blue-600",
    },
    {
      icon: FiZap,
      title: "Innovation",
      description: "Bringing creative and modern solutions to make your events unique and memorable.",
      color: "bg-purple-50 text-purple-600",
    },
    {
      icon: FiHeart,
      title: "Passion",
      description: "Our team is passionate about creating unforgettable experiences that exceed expectations.",
      color: "bg-pink-50 text-pink-600",
    },
    {
      icon: FiUsers,
      title: "Collaboration",
      description: "Working closely with clients and vendors to ensure seamless event execution.",
      color: "bg-green-50 text-green-600",
    },
  ];

  const team = [
    { name: "John Doe", role: "Founder & CEO", image: "/images/team/team1.jpg" },
    { name: "Jane Smith", role: "Creative Director", image: "/images/team/team2.jpg" },
    { name: "Mike Johnson", role: "Operations Head", image: "/images/team/team3.jpg" },
    { name: "Sarah Williams", role: "Client Relations", image: "/images/team/team4.jpg" },
  ];

  const eventImages = [
    { 
      id: 1, 
      img: "https://images.pexels.com/photos/1444442/pexels-photo-1444442.jpeg?auto=compress&cs=tinysrgb&w=500",
      title: "Wedding Ceremony"
    },
    { 
      id: 2, 
      img: "https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg?auto=compress&cs=tinysrgb&w=500",
      title: "Corporate Event"
    },
    { 
      id: 3, 
      img: "https://images.pexels.com/photos/1729797/pexels-photo-1729797.jpeg?auto=compress&cs=tinysrgb&w=500",
      title: "Birthday Party"
    },
    { 
      id: 4, 
      img: "https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?auto=compress&cs=tinysrgb&w=500",
      title: "Concert Festival"
    },
    { 
      id: 5, 
      img: "https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg?auto=compress&cs=tinysrgb&w=500",
      title: "Fashion Show"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <HomeNavbar />

      {/* Hero Section */}
      <div className="relative h-[60vh] overflow-hidden">
        <img
          src="https://static.vecteezy.com/system/resources/thumbnails/031/872/000/small_2x/wedding-decor-ideas-for-a-wedding-ceremony-ai-generated-free-photo.jpg"
          alt="About Us"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent"></div>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0 flex items-center"
        >
          <div className="max-w-7xl mx-auto px-6">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              About <span className="text-[#f9a826]">Us</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 max-w-2xl">
              Creating unforgettable moments through exceptional event management
            </p>
          </div>
        </motion.div>
      </div>

      {/* Our Story Section */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-[#3c6e71] font-semibold text-sm tracking-wider uppercase">Our Story</span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mt-4 mb-6">
              Crafting Memories Since 2008
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-4">
              We started with a simple vision: to transform ordinary events into extraordinary experiences. 
              Over the years, we've grown into a leading event management company, trusted by hundreds of 
              clients across the country.
            </p>
            <p className="text-gray-600 text-lg leading-relaxed mb-6">
              Our team of passionate professionals brings creativity, expertise, and dedication to every 
              project. From intimate gatherings to grand celebrations, we handle every detail with precision 
              and care.
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 text-[#3c6e71]">
                <FiAward className="text-2xl" />
                <span className="font-semibold">Award Winning</span>
              </div>
              <div className="flex items-center gap-2 text-[#3c6e71]">
                <FiUsers className="text-2xl" />
                <span className="font-semibold">Expert Team</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative flex justify-center items-center"
          >
            <div className="relative">
              <Stack
                randomRotation={true}
                sensitivity={150}
                sendToBackOnClick={true}
                cardDimensions={{ width: 280, height: 350 }}
                cardsData={eventImages}
                animationConfig={{ stiffness: 300, damping: 25 }}
              />
              <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-[#f9a826] rounded-3xl -z-10 blur-xl opacity-50"></div>
              <div className="absolute -top-8 -right-8 w-40 h-40 bg-[#3c6e71] rounded-3xl -z-10 blur-xl opacity-50"></div>
            </div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 bg-white px-6 py-3 rounded-full shadow-lg border border-gray-100"
            >
              <p className="text-sm text-gray-600 font-medium">
              click to explore our events
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-gradient-to-r from-[#3c6e71] to-[#284b63] py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${stat.color} rounded-2xl mb-4`}>
                    <Icon className="text-3xl text-white" />
                  </div>
                  <h3 className="text-4xl md:text-5xl font-bold text-white mb-2">{stat.value}</h3>
                  <p className="text-gray-200 text-lg">{stat.label}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Event Showcase with Stack Animation */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="order-2 lg:order-1 flex justify-center"
            >
              <div className="relative">
                <Stack
                  randomRotation={true}
                  sensitivity={180}
                  sendToBackOnClick={true}
                  cardDimensions={{ width: 300, height: 380 }}
                  cardsData={eventImages}
                  animationConfig={{ stiffness: 280, damping: 22 }}
                />
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                  className="absolute -bottom-10 -right-10 w-32 h-32 bg-gradient-to-br from-[#f9a826] to-[#ff6b6b] rounded-full -z-10 blur-2xl opacity-40"
                />
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, -5, 5, 0]
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    repeatType: "reverse",
                    delay: 1
                  }}
                  className="absolute -top-10 -left-10 w-32 h-32 bg-gradient-to-br from-[#3c6e71] to-[#6366f1] rounded-full -z-10 blur-2xl opacity-40"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="order-1 lg:order-2"
            >
              <span className="text-[#3c6e71] font-semibold text-sm tracking-wider uppercase">Our Portfolio</span>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mt-4 mb-6">
                Explore Our <span className="text-[#f9a826]">Event Gallery</span>
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-6">
                Dive into our collection of memorable events. Each card represents a unique celebration 
                we've brought to life. Drag, swipe, or click to explore the magic we create.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                    <FiAward className="text-white text-xl" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">Premium Quality</h3>
                    <p className="text-gray-600">Every event is crafted with attention to detail and excellence</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                    <FiHeart className="text-white text-xl" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">Passionate Team</h3>
                    <p className="text-gray-600">Dedicated professionals who love what they do</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center flex-shrink-0">
                    <FiZap className="text-white text-xl" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">Creative Innovation</h3>
                    <p className="text-gray-600">Fresh ideas and modern approaches to event planning</p>
                  </div>
                </div>
              </div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="mt-8 p-4 bg-white rounded-xl shadow-md border border-gray-100"
              >
                <p className="text-sm text-gray-500 italic">
                  💡 <span className="font-semibold text-gray-700">Pro Tip:</span> Drag the cards to see different events, 
                  or click to cycle through our portfolio!
                </p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Our Values */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-[#3c6e71] font-semibold text-sm tracking-wider uppercase">Our Values</span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mt-4 mb-6">
            What Drives <span className="text-[#f9a826]">Us</span>
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Our core values guide everything we do, ensuring exceptional service and memorable experiences
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((value, index) => {
            const Icon = value.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100"
              >
                <div className={`inline-flex items-center justify-center w-14 h-14 ${value.color} rounded-xl mb-4`}>
                  <Icon className="text-2xl" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed">{value.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Our Team */}
      {/* <div className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-[#3c6e71] font-semibold text-sm tracking-wider uppercase">Our Team</span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mt-4 mb-6">
              Meet The <span className="text-[#f9a826]">Experts</span>
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Talented professionals dedicated to making your events extraordinary
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group"
              >
                <div className="relative overflow-hidden rounded-2xl mb-4">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-80 object-cover group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.src = "/images/team/default-avatar.jpg";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
                <p className="text-[#3c6e71] font-medium">{member.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div> */}

      {/* CTA Section */}
      <div className="relative py-20 overflow-hidden">
        <img
          src="/images/cta-bg.jpg"
          alt="CTA Background"
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#3c6e71]/95 to-[#284b63]/95"></div>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative z-10 max-w-4xl mx-auto px-6 text-center"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Create Something Amazing?
          </h2>
          <p className="text-xl text-gray-200 mb-8">
            Let's work together to make your next event unforgettable
          </p>
          <button
            onClick={() => window.location.href = "/contact"}
            className="px-8 py-4 bg-[#f9a826] text-white text-lg font-bold rounded-full hover:bg-[#f9a826]/90 transition-all duration-300 hover:scale-105 shadow-2xl"
          >
            Get In Touch
          </button>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
};

export default AboutPage;
