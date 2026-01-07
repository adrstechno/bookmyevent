import { useState } from "react";
import { motion } from "framer-motion";
import { FiMail, FiPhone, FiMapPin, FiSend, FiClock } from "react-icons/fi";
import { FaFacebook, FaInstagram, FaLinkedin, FaWhatsapp } from "react-icons/fa";
import Footer from "../components/mainpage/Footer";
import HomeNavbar from "../components/mainpage/HomeNavbar";
import toast from "react-hot-toast";

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);

  const contactInfo = [
    // {
    //   icon: FiPhone,
    //   title: "Phone",
    //   details: ["+91 9201976523"],
    //   color: "from-blue-500 to-cyan-500",
    // },
    // {
    //   icon: FiMail,
    //   title: "Email",
    //   details: ["goeventify@gmail.com"],
    //   color: "from-purple-500 to-pink-500",
    // },
    // {
    //   icon: FiMapPin,
    //   title: "Address",
    //   details: ["71,Dadda Nagar Near Katangi Highway jabalpur"],
    //   color: "from-green-500 to-emerald-500",
    // },
    // {
    //   icon: FiClock,
    //   title: "Working Hours",
    //   details: ["Mon - Sat: 9:00 AM - 8:00 PM", "Sunday: 10:00 AM - 6:00 PM"],
    //   color: "from-orange-500 to-red-500",
    // },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      toast.success("Message sent successfully! We'll get back to you soon.");
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
      setLoading(false);
    }, 1500);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <HomeNavbar />

      {/* Hero Section */}
      <div className="relative h-[50vh] overflow-hidden">
        <img
          src="https://utsav.gov.in/public/event_category_banner/1656592752.png"
          alt="Contact Us"
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
              Contact <span className="text-[#f9a826]">Us</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 max-w-2xl">
              Get in touch with us for any inquiries or event planning needs
            </p>
          </div>
        </motion.div>
      </div>

      {/* Contact Info Cards */}
      <div className="max-w-7xl mx-auto px-6 -mt-16 relative z-10 mb-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {contactInfo.map((info, index) => {
            const Icon = info.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100"
              >
                <div className={`inline-flex items-center justify-center w-14 h-14 bg-gradient-to-r ${info.color} rounded-xl mb-4`}>
                  <Icon className="text-2xl text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{info.title}</h3>
                {info.details.map((detail, idx) => (
                  <p key={idx} className="text-gray-600 mb-1">{detail}</p>
                ))}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Contact Form & Map Section */}
      <div className="max-w-7xl mx-auto px-6 pb-20">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-3xl p-8 shadow-xl"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Send us a Message</h2>
            <p className="text-gray-600 mb-8">Fill out the form below and we'll get back to you as soon as possible</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your full name"
                  className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:border-[#3c6e71] focus:ring-2 focus:ring-[#3c6e71]/20 outline-none transition-all"
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your@email.com"
                    className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:border-[#3c6e71] focus:ring-2 focus:ring-[#3c6e71]/20 outline-none transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91 9201976523"
                    className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:border-[#3c6e71] focus:ring-2 focus:ring-[#3c6e71]/20 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="What is this regarding?"
                  className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:border-[#3c6e71] focus:ring-2 focus:ring-[#3c6e71]/20 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Message *
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us more about your event or inquiry..."
                  rows="5"
                  className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:border-[#3c6e71] focus:ring-2 focus:ring-[#3c6e71]/20 outline-none resize-none transition-all"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#3c6e71] to-[#2f5b60] hover:from-[#2f5b60] hover:to-[#3c6e71] text-white font-bold py-4 rounded-xl shadow-lg transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <FiSend />
                    Send Message
                  </>
                )}
              </button>
            </form>
          </motion.div>

          {/* Map & Social */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            {/* Map */}
            <div className="bg-white rounded-3xl overflow-hidden shadow-xl h-[400px]">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3666.7201615187373!2d79.896521775098!3d23.216866779038035!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3981b1005402aeab%3A0xf0db32b922893755!2sADRS%20TECHNOSOFT%20PVT.%20LTD.!5e0!3m2!1sen!2sin!4v1767071756869!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Location Map"
              ></iframe>
            </div>

            {/* Social Media */}
            <div className="bg-gradient-to-br from-[#3c6e71] to-[#284b63] rounded-3xl p-8 shadow-xl text-white">
              <h3 className="text-2xl font-bold mb-4">Follow Us</h3>
              <p className="text-gray-200 mb-6">Stay connected with us on social media for updates and inspiration</p>
              
              <div className="flex gap-4">
                <a
                  href="https://www.facebook.com/profile.php?id=61585660263887"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110"
                  aria-label="Facebook"
                >
                  <FaFacebook className="text-2xl" />
                </a>
                <a
                  href="https://wa.me/919201976523?text=Hi!%20I%20want%20to%20know%20more%20about%20your%20services"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110"
                  aria-label="WhatsApp"
                >
                  <FaWhatsapp className="text-2xl" />
                </a>
                <a
                  href="https://www.instagram.com/goeventify/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110"
                  aria-label="Instagram"
                >
                  <FaInstagram className="text-2xl" />
                </a>
                <a
                  href="https://www.linkedin.com/in/go-eventify/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110"
                  aria-label="LinkedIn"
                >
                  <FaLinkedin className="text-2xl" />
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ContactPage;
