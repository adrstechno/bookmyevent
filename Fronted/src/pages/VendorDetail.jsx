import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

// Simple Vendor Detail page that reads images from /images/vendors/:id/
const VendorDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vendor, setVendor] = useState(null);

  useEffect(() => {
    // In production, fetch vendor by id. Here we simulate the same shape as CategoryPage
    const vendorObj = {
      id,
      name: id.replace(/-/g, " "),
      profileImage: `/images/vendors/${id}/profile.jpg`,
      works: Array.from({ length: 6 }).map((_, i) => `/images/vendors/${id}/work-${i + 1}.jpg`),
      description: "Full vendor profile with portfolio and booking options.",
      price: 25000,
    };
    setVendor(vendorObj);
  }, [id]);

  const addToCart = () => {
    const stored = JSON.parse(localStorage.getItem("cart") || "[]");
    const exists = stored.find((s) => s.id === id);
    if (exists) exists.qty = (exists.qty || 1) + 1;
    else stored.push({ id, name: vendor.name, price: vendor.price, qty: 1 });
    localStorage.setItem("cart", JSON.stringify(stored));
    alert("Added to cart");
    navigate("/cart");
  };

  if (!vendor) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto bg-white rounded-lg shadow p-6">
        <div className="flex gap-6 items-start">
          <img src={vendor.profileImage} alt={vendor.name} className="w-40 h-40 object-cover rounded-md" onError={(e)=>{e.currentTarget.src='/images/vendors/default-profile.jpg'}} />
          <div>
            <h1 className="text-2xl font-bold">{vendor.name}</h1>
            <p className="text-gray-600 mt-2">{vendor.description}</p>
            <div className="mt-4 flex items-center gap-4">
              <span className="text-xl font-semibold text-[#3c6e71]">₹{vendor.price.toLocaleString()}</span>
              <button onClick={addToCart} className="px-4 py-2 bg-yellow-400 rounded-md">Book</button>
            </div>
          </div>
        </div>

        <hr className="my-6" />

        <h2 className="text-xl font-semibold mb-4">Portfolio</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {vendor.works.map((src, idx) => (
            <div key={idx} className="rounded overflow-hidden bg-gray-100">
              <img src={src} alt={`work-${idx + 1}`} className="w-full h-40 object-cover" onError={(e)=>{e.currentTarget.src='/images/vendors/default-work.jpg'}} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VendorDetail;
