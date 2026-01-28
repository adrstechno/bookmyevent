import React, { useEffect, useState } from "react";
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
// import ContactPopup from "../components/mainpage/ContactPopup";
import HomeNavbar from "../components/mainpage/HomeNavbar";
import ErrorBoundary from "../components/ErrorBoundary";

/* ✅ ADD THIS */
import usePWAInstall from "../hooks/usePWAInstall";

const HomePage = () => {
  /* ================= PWA LOGIC (ONLY ADDITION) ================= */
  const { isInstallable, installApp } = usePWAInstall();
  const [showInstallPopup, setShowInstallPopup] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [componentError, setComponentError] = useState(null);

  useEffect(() => {
    console.log('HomePage component mounting...');
    
    try {
      const ua = window.navigator.userAgent.toLowerCase();
      const ios =
        /iphone|ipad|ipod/.test(ua) &&
        !window.matchMedia("(display-mode: standalone)").matches;
      setIsIOS(ios);
      console.log('iOS detection complete:', ios);
    } catch (error) {
      console.error('Error in iOS detection:', error);
      setComponentError(error);
    }
  }, []);

  useEffect(() => {
    if (!isInstallable && !isIOS) return;

    const timer = setTimeout(() => {
      setShowInstallPopup(true);
    }, 2000); // 2 sec delay

    return () => clearTimeout(timer);
  }, [isInstallable, isIOS]);
  /* ============================================================= */

  // Error fallback
  if (componentError) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Welcome to GoEventify</h1>
          <p className="text-gray-600">Loading components...</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="bg-[#f8f9fa]">
        {/* <Headers /> */}
        <ErrorBoundary>
          <HomeNavbar />
        </ErrorBoundary>
        
        <ErrorBoundary>
          <HeroSection />
        </ErrorBoundary>
        
        <ErrorBoundary>
          <ServicesSection />
        </ErrorBoundary>
        
        <ErrorBoundary>
          <VendorsSection />
        </ErrorBoundary>
        
        <ErrorBoundary>
          <ShowcaseSection />
        </ErrorBoundary>
        
        <ErrorBoundary>
          <Testimonials />
        </ErrorBoundary>
        
        <ErrorBoundary>
          <WhyChooseUs />
        </ErrorBoundary>
        
        <ErrorBoundary>
          <CTASection />
        </ErrorBoundary>
        
        <ErrorBoundary>
          <Footer />
        </ErrorBoundary>

        {/* Floating Sidebar + WhatsApp */}
        <ErrorBoundary>
          <SocialSidebar />
        </ErrorBoundary>

        {/* Contact Popup */}
        {/* <ErrorBoundary>
          <ContactPopup />
        </ErrorBoundary> */}

        {/* ================= PWA INSTALL POPUP (ONLY ADDITION) ================= */}
        {showInstallPopup && (
          <div className="fixed bottom-4 left-4 right-4 z-[9999]">
            <div className="bg-[#0b0f19] border border-white/10 rounded-xl p-4 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="text-white font-semibold">
                  Install GoEventify App 🚀
                </h4>
                <p className="text-gray-400 text-sm">
                  Faster access • App-like experience
                </p>
              </div>

              <div className="flex items-center gap-3">
                {!isIOS && isInstallable && (
                  <button
                    onClick={installApp}
                    className="bg-cyan-400 text-black px-4 py-2 rounded-lg font-medium hover:bg-cyan-300 transition"
                  >
                    Install
                  </button>
                )}

                {isIOS && (
                  <span className="text-gray-300 text-sm">
                    Tap <b>Share</b> → <b>Add to Home Screen</b>
                  </span>
                )}

                <button
                  onClick={() => setShowInstallPopup(false)}
                  className="text-gray-400 hover:text-white transition"
                >
                  Later
                </button>
              </div>
            </div>
          </div>
        )}
        {/* ===================================================================== */}
      </div>
    </ErrorBoundary>
  );
};

export default HomePage;
