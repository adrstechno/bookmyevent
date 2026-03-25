import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "What services does GoEventify provide in Jabalpur?",
    answer: "GoEventify provides complete event management services in Jabalpur including wedding planning (shadi planner), birthday party planning, corporate events, mehndi ceremony, sangeet, engagement, kitty parties, puran katha, bhandara, concerts, Holi & Diwali celebrations, office seminars, and trip booking. We connect you with verified vendors like tent services, caterers, photographers, videographers, mehndi artists, makeup artists, pandit ji, party halls, ghodi baggi, firecracker workers, flower decorators, car decorators, and all event-related services."
  },
  {
    question: "How can I book a wedding planner or shadi planner in Jabalpur?",
    answer: "You can easily book a wedding planner or shadi planner in Jabalpur by browsing our verified vendors, checking their profiles, reviews, and pricing, then making a booking directly through our platform. We offer 24/7 booking support, transparent pricing, and hassle-free booking process. Simply select your event type, choose your preferred vendors, and confirm your booking."
  },
  {
    question: "Are the vendors on GoEventify verified?",
    answer: "Yes, all vendors on GoEventify are thoroughly verified. We ensure quality service by checking credentials, past work portfolios, customer reviews, and conducting background verification before listing any vendor on our platform. You can book with confidence knowing all our vendors are trusted professionals."
  },
  {
    question: "What areas does GoEventify serve?",
    answer: "GoEventify primarily serves Jabalpur and surrounding areas in Madhya Pradesh. We connect you with local vendors and service providers for all types of events and celebrations. Our network covers all major localities in Jabalpur including Dadda Nagar, Katangi Highway area, and other regions."
  },
  {
    question: "How much does event planning cost in Jabalpur?",
    answer: "Event planning costs in Jabalpur vary based on the type of event, number of guests, and services required. We offer transparent pricing with no hidden charges. You can compare prices from multiple vendors and choose the one that fits your budget. Contact us for customized quotes for your specific event requirements."
  },
  {
    question: "Can I book vendors for same-day events?",
    answer: "While we recommend booking in advance for better availability, we do our best to accommodate same-day bookings based on vendor availability. Contact our 24/7 support team, and we'll help you find available vendors for your urgent event needs in Jabalpur."
  }
];

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden" aria-labelledby="faq-heading">
      {/* Decorative elements */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-[#f9a826]/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-10 w-72 h-72 bg-[#3c6e71]/10 rounded-full blur-3xl" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 id="faq-heading" className="text-4xl sm:text-5xl font-bold text-[#284b63] mb-4">
              Frequently Asked Questions
            </h2>
            <div className="h-1.5 bg-gradient-to-r from-[#f9a826] to-[#f7b733] w-24 mx-auto rounded-full mb-4" />
            <p className="text-gray-600 text-lg">
              Everything you need to know about event planning in Jabalpur
            </p>
          </motion.div>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors duration-300"
                aria-expanded={openIndex === index}
              >
                <h3 className="text-lg font-semibold text-gray-800 pr-4">
                  {faq.question}
                </h3>
                <ChevronDown
                  className={`w-6 h-6 text-[#f9a826] flex-shrink-0 transition-transform duration-300 ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                />
              </button>
              
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-5 text-gray-600 leading-relaxed border-t border-gray-100 pt-4">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
