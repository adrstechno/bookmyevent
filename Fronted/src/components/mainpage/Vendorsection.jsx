import React from "react";

const vendors = [
  { name: "Royal Catering", img: "/Vendor1.jpeg" },
  { name: "Bliss Decor", img: "/Vendor2.jpeg" },
  { name: "Elite DJ", img: "/Vendor3.jpeg" },
  { name: "Pixel Moments", img: "/Vendor4.jpeg" },
];

const VendorsSection = () => (
  <section className="py-20 bg-[var(--light-bg)] text-center">
    <h2 className="text-4xl font-bold text-[#3c6e71] mb-12">Featured Vendors</h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
      {vendors.map((v) => (
        <div
          key={v.name}
          className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl hover:-translate-y-2 transition"
        >
          <img src={v.img} alt={v.name} className="w-full h-48 object-cover" />
          <div className="p-4 font-semibold text-gray-700">{v.name}</div>
        </div>
      ))}
    </div>
  </section>
);

export default VendorsSection;
