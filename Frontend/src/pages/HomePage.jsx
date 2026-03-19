import { useEffect, useState } from "react";
import HeroSection from "../components/mainpage/HeroSection";
import ServicesSection from "../components/mainpage/ServiceSection";
import SubServicesSection from "../components/mainpage/SubServicesSection";
import WhyChooseUs from "../components/mainpage/WhyChooseUs";
import Testimonials from "../components/mainpage/Testimonials";
import CTASection from "../components/mainpage/CTASection";
import Footer from "../components/mainpage/Footer";
import ShowcaseSection from "../components/mainpage/ShowcaseSection";
import SocialSidebar from "../components/mainpage/SocialSidebar";
import HomeNavbar from "../components/mainpage/HomeNavbar";
import ErrorBoundary from "../components/ErrorBoundary";
import usePWAInstall from "../hooks/usePWAInstall";

const HomePage = () => {
  /* ================= PWA LOGIC (ONLY ADDITION) ================= */
  const { isInstallable, installApp } = usePWAInstall();
  const [showInstallPopup, setShowInstallPopup] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [componentError, setComponentError] = useState(null);

  useEffect(() => {
    // console.log('HomePage component mounting...');
    
    try {
      const ua = window.navigator.userAgent.toLowerCase();
      const ios =
        /iphone|ipad|ipod/.test(ua) &&
        !window.matchMedia("(display-mode: standalone)").matches;
      setIsIOS(ios);
      // console.log('iOS detection complete:', ios);
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
      <div className="relative min-h-screen">
        {/* Global Background */}
        <div className="fixed inset-0 -z-10">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-fixed opacity-30"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1920&h=1080&fit=crop&crop=center')`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-white/95 via-gray-50/90 to-white/95" />
        </div>

        {/* Navigation */}
        <ErrorBoundary>
          <HomeNavbar />
        </ErrorBoundary>
        
        {/* Hero Section */}
        <ErrorBoundary>
          <HeroSection />
        </ErrorBoundary>
        
        {/* Services Section */}
        <ErrorBoundary>
          <ServicesSection />
        </ErrorBoundary>
        
        {/* Sub-Services Section */}
        <ErrorBoundary>
          <SubServicesSection />
        </ErrorBoundary>
        
        {/* Showcase Section */}
        <ErrorBoundary>
          <ShowcaseSection />
        </ErrorBoundary>
        
        {/* Testimonials */}
        <ErrorBoundary>
          <Testimonials />
        </ErrorBoundary>
        
        {/* Why Choose Us */}
        <ErrorBoundary>
          <WhyChooseUs />
        </ErrorBoundary>
        
        {/* CTA Section */}
        <ErrorBoundary>
          <CTASection />
        </ErrorBoundary>
        
        {/* Footer */}
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
