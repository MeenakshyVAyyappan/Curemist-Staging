import React, { useRef, useState } from "react";
import ProductCard from "./ProductCard";
import { products } from "@/lib/products";
import {
  ChevronLeft,
  ChevronRight,
  Activity,
  Target,
  Droplet,
  Flame,
  Zap,
  ShieldAlert,
  Scissors,
  FileText,
  Bug,
  Thermometer,
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { AnimatePresence, motion } from "framer-motion";

const conditionsList = [
  { name: "Nail Fungus", icon: Zap },
  { name: "Tinea / Ringworm", icon: Target },
  { name: "Eczema", icon: Droplet },
  { name: "Jock Itch", icon: Activity },
  { name: "Bed sore ulcers/wounds", icon: ShieldAlert },
  { name: "Small burns(Degree 1 & 2)", icon: Flame },
  { name: "Foot ulcers", icon: Activity },
  { name: "Shoe bites", icon: Zap },
  { name: "Varicose vein ulcers", icon: Activity },
  { name: "Cancer treatment Radiation wounds", icon: Target },
  { name: "Minor cuts & scratches", icon: Scissors },
  { name: "Shaving cuts", icon: Scissors },
  { name: "Paper cuts", icon: FileText },
  { name: "Kitchen injuries", icon: Flame },
  { name: "Insect bites", icon: Bug },
  { name: "Redness or skin irritation", icon: Thermometer },
];

export default function ProductSection() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const [showAllConditions, setShowAllConditions] = useState(false);

  const visibleCount = isMobile ? 6 : 8;
  const visibleConditions = showAllConditions
    ? conditionsList
    : conditionsList.slice(0, visibleCount);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = scrollContainerRef.current.clientWidth * 0.8;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  // Replicate products to enable continuous scrolling flow on desktop
  const carouselProducts = [...products, ...products];

  return (
    <section id="products" className="py-12 md:py-20 bg-gray-50/30">
      <div className="container mx-auto px-4 sm:px-6 md:px-8 max-w-7xl relative">
        {/* Section Header */}
        <div className="text-center mb-10 md:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-[40px] font-bold text-black mb-4 tracking-tight">
            Most Trusted Wound Care Spray
          </h2>
          <p className="text-base md:text-xl font-medium text-gray-700 max-w-3xl mx-auto leading-relaxed">
            Fast relief for sports injuries & active lifestyles. Protects and
            heals scrapes, turf burns & workout wounds instantly.
          </p>

          {/* Premium Condition Cards */}
          <div className="max-w-6xl mx-auto mt-8 md:mt-12">
            <motion.div
              layout
              className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 md:gap-3"
            >
              <AnimatePresence>
                {visibleConditions.map((condition) => {
                  const Icon = condition.icon;
                  return (
                    <motion.div
                      key={condition.name}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                      layout
                      className="group relative overflow-hidden rounded-[9px] md:rounded-[14px] p-1.5 md:p-2 h-full min-h-[72px] md:min-h-[80px] flex flex-col items-center justify-center text-center border-[1.2px] border-[#ffe38d] transition-all duration-[250ms] md:hover:-translate-y-1.5 md:hover:scale-[1.04] shadow-[0_4px_16px_0_rgba(40,43,112,0.1),0_1.5px_6px_0_rgba(255,209,71,0.08)] md:hover:shadow-[0_12px_36px_0_rgba(40,43,112,0.18),0_2px_8px_0_rgba(255,209,71,0.13)]"
                      style={{
                        background:
                          "linear-gradient(135deg, #fffbe6 0%, #ffe38d 100%)",
                      }}
                    >
                      {/* Glare overlay */}
                      <div className="absolute inset-0 bg-gradient-to-br from-white/25 to-white/5 pointer-events-none" />

                      <div className="mb-0.5 md:mb-1 text-[#282b70] relative z-10 drop-shadow-[0_2px_8px_rgba(255,227,141,0.53)]">
                        <Icon
                          className="w-[18px] h-[18px] md:w-5 md:h-5"
                          strokeWidth={2.5}
                        />
                      </div>
                      <span
                        className="text-[10px] md:text-xs font-semibold text-[#282b70] leading-tight px-0.5 relative z-10 tracking-[0.01em]"
                        style={{ textShadow: "0 1px 0 #fffbe6" }}
                      >
                        {condition.name}
                      </span>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>

            {/* Show More Button */}
            <motion.div layout className="mt-8 flex justify-center">
              <button
                onClick={() => setShowAllConditions(!showAllConditions)}
                className="bg-white text-[#252c74] border border-[#252c74] hover:bg-[#252c74] hover:text-white px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 shadow-sm hover:shadow-md focus:outline-none"
              >
                {showAllConditions ? "Show Less" : "Show More"}
              </button>
            </motion.div>
          </div>
        </div>

        {/* Mobile View: 2-Column Grid Wrapper */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:hidden">
          {products.map((product, index) => (
            <ProductCard key={index} {...product} />
          ))}
        </div>

        {/* Desktop View: Carousel Container */}
        <div className="hidden md:block relative group">
          {/* Desktop Snap Scroll List */}
          <div
            ref={scrollContainerRef}
            className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-8 hide-scrollbar scroll-smooth pt-4 items-stretch"
          >
            {carouselProducts.map((product, index) => (
              <div
                key={index}
                className="w-[calc(33.333%-16px)] lg:w-[calc(25%-18px)] flex-shrink-0 snap-start flex flex-col"
              >
                <ProductCard {...product} />
              </div>
            ))}
          </div>

          <style
            dangerouslySetInnerHTML={{
              __html: `
            .hide-scrollbar::-webkit-scrollbar {
              display: none;
            }
            .hide-scrollbar {
              -ms-overflow-style: none;
              scrollbar-width: none;
            }
          `,
            }}
          />
        </div>
      </div>
    </section>
  );
}
