import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

// Example vendor generator — in production replace with API call
const makeVendorsForCategory = (categorySlug) => {
  // create 6 demo vendors with ids and image paths
  return Array.from({ length: 6 }).map((_, idx) => {
    const id = `${categorySlug}-${idx + 1}`;
    return {
      id,
      name: `${categorySlug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())} Vendor ${idx + 1}`,
      priceRange: "₹10,000–₹50,000",
      // profile image path — put images under public/images/vendors/<id>/profile.jpg
      profileImage: `/images/vendors/${id}/profile.jpg`,
      // array of works images — public/images/vendors/<id>/work-1.jpg ... work-4.jpg
      works: Array.from({ length: 4 }).map((__, w) => `/images/vendors/${id}/work-${w + 1}.jpg`),
      description: "Premium event vendor offering top-quality services.",
    };
  });
};

const CategoryPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const categoryTitle = slug.replace(/-/g, " ").toUpperCase();
  const vendors = makeVendorsForCategory(slug);

  // hero image handling: try .jpg then .svg then default
  const [heroSrc, setHeroSrc] = React.useState(`/images/${slug}.jpg`);
  React.useEffect(() => {
    setHeroSrc(`/images/${slug}.jpg`);
  }, [slug]);

  const addToCart = (vendor) => {
    const stored = JSON.parse(localStorage.getItem("cart") || "[]");
    const exists = stored.find((s) => s.id === vendor.id);
    if (exists) {
      exists.qty = (exists.qty || 1) + 1;
    } else {
      stored.push({ id: vendor.id, name: vendor.name, price: 10000, qty: 1 });
    }
    localStorage.setItem("cart", JSON.stringify(stored));
    alert(`${vendor.name} added to cart`);
    navigate("/cart");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero section */}
      <div className="relative h-72 w-full">
        <img
          src={heroSrc}
          alt={categoryTitle}
          className="w-full h-full object-cover brightness-75"
          onError={(e) => {
            const curr = e.currentTarget;
            const src = curr.src || "";
            // if current is jpg, try svg; otherwise fallback to default
            if (src.includes('.jpg')) {
              const svg = `/images/${slug}.svg`;
              curr.src = svg;
              setHeroSrc(svg);
            } else {
              curr.src = '/images/default-category.jpg';
              setHeroSrc('/images/default-category.jpg');
            }
          }}
        />

        <div className="absolute inset-0 bg-black/40"></div>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
          <h1 className="text-5xl font-extrabold drop-shadow-xl">
            {categoryTitle}
          </h1>
          <p className="text-lg mt-3 opacity-90">
            Discover premium vendors and services for {categoryTitle}.
          </p>
        </div>
      </div>

      {/* Vendor Listing Section */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <h2 className="text-3xl font-bold text-[#284b63] mb-6">
          Vendors for {categoryTitle}
        </h2>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {vendors.map((vendor) => (
            <motion.div
              key={vendor.id}
              whileHover={{ scale: 1.03 }}
              className="bg-white rounded-xl shadow-lg overflow-hidden"
            >
              <img
                src={vendor.profileImage}
                className="h-48 w-full object-cover"
                alt={vendor.name}
                onError={(e) => { e.currentTarget.src = '/images/vendors/default-profile.jpg'; }}
              />

              <div className="p-5">
                <h3 className="text-xl font-semibold text-gray-800">{vendor.name}</h3>
                <p className="text-gray-600 mt-2 text-sm">{vendor.description}</p>

                <div className="mt-4 flex items-center justify-between">
                  <span className="text-[#3c6e71] font-bold">{vendor.priceRange}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/vendor/view/${encodeURIComponent(vendor.id)}`)}
                      className="px-4 py-1.5 bg-[#3c6e71] text-white rounded-lg hover:bg-[#284b63] transition"
                    >
                      View
                    </button>
                    <button
                      onClick={() => addToCart(vendor)}
                      className="px-4 py-1.5 bg-yellow-400 text-black rounded-lg hover:brightness-95 transition"
                    >
                      Book
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default CategoryPage;
