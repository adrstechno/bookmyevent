import React from "react";

const reviews = [
  {
    name: "Aarav Mehta",
    text: "EventPlus made our wedding unforgettable. Everything was managed so smoothly!",
  },
  {
    name: "Priya Sharma",
    text: "As a vendor, I’ve gained so many clients. The dashboard is super easy to use.",
  },
  {
    name: "Raj Patel",
    text: "We booked our corporate event within hours. Great platform!",
  },
];

const Testimonials = () => (
  <section className="py-20 bg-[#f8f9fa] text-center">
    <h2 className="text-4xl font-bold text-[#3c6e71] mb-12">What People Say</h2>
    <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
      {reviews.map((r, i) => (
        <div key={i} className="bg-white p-8 rounded-2xl shadow hover:shadow-lg transition">
          <p className="italic text-gray-600 mb-4">“{r.text}”</p>
          <h3 className="text-lg font-semibold text-[#3c6e71]">{r.name}</h3>
        </div>
      ))}
    </div>
  </section>
);

export default Testimonials;
