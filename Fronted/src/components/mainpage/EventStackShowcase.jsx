import { motion } from "framer-motion";
import Stack from "./Stack";

const EventStackShowcase = ({ 
  title = "Our Events", 
  subtitle = "Explore our portfolio",
  images = [],
  className = ""
}) => {
  const defaultImages = [
    { 
      id: 1, 
      img: "https://images.unsplash.com/photo-1519167758481-83f29da8c2b6?q=80&w=500&auto=format",
      title: "Elegant Wedding"
    },
    { 
      id: 2, 
      img: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=500&auto=format",
      title: "Corporate Gala"
    },
    { 
      id: 3, 
      img: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?q=80&w=500&auto=format",
      title: "Birthday Celebration"
    },
    { 
      id: 4, 
      img: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=500&auto=format",
      title: "Music Festival"
    }
  ];

  const displayImages = images.length > 0 ? images : defaultImages;

  return (
    <div className={`py-20 ${className}`}>
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {title}
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            {subtitle}
          </p>
        </motion.div>

        <div className="flex justify-center items-center min-h-[450px]">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, type: "spring" }}
            className="relative"
          >
            <Stack
              randomRotation={true}
              sensitivity={150}
              sendToBackOnClick={true}
              cardDimensions={{ width: 280, height: 350 }}
              cardsData={displayImages}
              animationConfig={{ stiffness: 300, damping: 25 }}
            />
            
            {/* Animated background blobs */}
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                repeatType: "reverse"
              }}
              className="absolute -bottom-16 -right-16 w-48 h-48 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full blur-3xl -z-10"
            />
            <motion.div
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.3, 0.5, 0.3]
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                repeatType: "reverse",
                delay: 1
              }}
              className="absolute -top-16 -left-16 w-48 h-48 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full blur-3xl -z-10"
            />
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="text-center mt-12"
        >
          <p className="text-gray-500 text-sm">
            👆 Drag or click the cards to explore more events
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default EventStackShowcase;
