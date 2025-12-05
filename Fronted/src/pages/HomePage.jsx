import React from "react";
import Headers from "../components/mainpage/Headers";
import HeroSection from "../components/mainpage/HeroSection";
import ServicesSection from "../components/mainpage/ServiceSection";
import VendorsSection from "../components/mainpage/Vendorsection";
import WhyChooseUs from "../components/mainpage/WhyChooseUs";
import Testimonials from "../components/mainpage/Testimonials";
import CTASection from "../components/mainpage/CTASection";
import Footer from "../components/mainpage/Footer";
import ShowcaseSection from "../components/mainpage/ShowcaseSection";
import SocialSidebar from "../components/mainpage/SocialSidebar";
import ContactPopup from "../components/mainpage/ContactPopup";


const HomePage = () => {
  return (
    <div className="bg-[#f8f9fa]">
      <Headers />
      <HeroSection />
      <ServicesSection />
      <VendorsSection />
      <ShowcaseSection />
      <Testimonials />
      <WhyChooseUs />
      <CTASection />
      <Footer />

      {/* Floating Sidebar + WhatsApp */}
      <SocialSidebar />

      {/* Contact Popup */}
      <ContactPopup />
    </div>
  );
};

export default HomePage;
