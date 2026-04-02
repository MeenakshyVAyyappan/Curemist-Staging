import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ProductSection from "@/components/ProductSection";
import FeatureSections from "@/components/FeatureSections";
import StatsSection from "@/components/StatsSection";
import Certifications from "@/components/ui/Certification";
import TestimonialsSection from "@/components/TestimonialsSection";
import FAQSection from "@/components/FAQSection";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import KeyFeaturesSection from "@/components/KeyFeaturesSection";
import WhySafe from "@/components/ui/WhySafe";
import CuremistDetailsSections from "@/components/CuremistDetailsSections";

export default function Index() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("welcome") === "true") {
      setShowWelcome(true);
      // Clean up the URL
      navigate("/", { replace: true });
    }
  }, [location, navigate]);

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="pt-[110px] md:pt-[100px]">
        <Hero />
        
        {/* Mobile Properties Section (Anti-fungal, etc) */}
        <div className="md:hidden py-5 px-1 bg-white">
          <div className="container mx-auto">
            <div className="grid grid-cols-4 gap-1 sm:gap-2 text-center items-start">
              <div className="flex flex-col items-center">
                <div className="bg-[#FFE9AE]/30 rounded-full p-2 mb-2">
                  <img src="/banners/Mask group.png" alt="Anti-fungal" className="w-[45px] sm:w-[55px] h-auto object-contain" />
                </div>
                <span className="text-[9px] sm:text-[11px] whitespace-nowrap tracking-tight font-bold text-[#282b70] leading-[1.15]">Anti-fungal</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="bg-[#FFE9AE]/30 rounded-full p-2 mb-2">
                  <img src="/banners/Mask group (3).png" alt="Anti-microbial" className="w-[45px] sm:w-[55px] h-auto object-contain" />
                </div>
                <span className="text-[9px] sm:text-[11px] whitespace-nowrap tracking-tight font-bold text-[#282b70] leading-[1.15]">Anti-microbial</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="bg-[#FFE9AE]/30 rounded-full p-2 mb-2">
                  <img src="/banners/Mask group (2).png" alt="Anti-inflammatory" className="w-[45px] sm:w-[55px] h-auto object-contain" />
                </div>
                <span className="text-[9px] sm:text-[11px] whitespace-nowrap tracking-tight font-bold text-[#282b70] leading-[1.15]">Anti-inflammatory</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="bg-[#FFE9AE]/30 rounded-full p-2 mb-2">
                  <img src="/banners/Mask group (1).png" alt="Anti-septic" className="w-[45px] sm:w-[55px] h-auto object-contain" />
                </div>
                <span className="text-[9px] sm:text-[11px] whitespace-nowrap tracking-tight font-bold text-[#282b70] leading-[1.15]">Anti-septic</span>
              </div>
            </div>
          </div>
        </div>

        <KeyFeaturesSection />
        <ProductSection />
        <CuremistDetailsSections />
        <FeatureSections />
        <StatsSection />
        <WhySafe />
        <Certifications />
        <FAQSection />
        <Footer />
      </main>
      <WhatsAppButton />

      <Dialog open={showWelcome} onOpenChange={setShowWelcome}>
        <DialogContent className="sm:max-w-md text-center">
          <DialogHeader>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-4">
              <span className="text-3xl">🎉</span>
            </div>
            <DialogTitle className="text-2xl text-center">Welcome to Curemist!</DialogTitle>
            <DialogDescription className="text-center text-lg mt-2">
              Your email has been verified successfully. We are thrilled to have you with us.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-brand-yellow/10 p-4 rounded-lg mt-4">
            <p className="text-brand-blue font-semibold">Enjoy 5% off on all orders automatically!</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
