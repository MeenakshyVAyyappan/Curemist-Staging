import React, { useRef, useState } from "react";
import ProductCard from "./ProductCard";
import { products } from "@/lib/products";
import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { AnimatePresence, motion } from "framer-motion";

const conditionsList = [
  { name: "Nail Fungus", image: "/Productcards/nailfungus.png" },
  { name: "Tinea / Ringworm", image: "/Productcards/tinea_ringworm.png" },
  { name: "Eczema", image: "/Productcards/Eczema.png" },
  { name: "Jock Itch", image: "/Productcards/jockitch.png" },
  { name: "Bed sore ulcers/wounds", image: "/Productcards/bedsore.png" },
  { name: "Minor burns(Degree 1 & 2)", image: "/Productcards/minorburns.png" },
  { name: "Foot ulcers", image: "/Productcards/footulcers.png" },
  { name: "Shoe bites", image: "/Productcards/shoebites.png" },
  { name: "Varicose vein ulcers", image: "/Productcards/vericosvein.png" },
  { name: "Radiation treatment wounds", image: "/Productcards/radiationtreatment.png" },
  { name: "Minor cuts & scratches", image: "/Productcards/minorcutburns.png" },
  { name: "Shaving cuts", image: "/Productcards/shavingcuts.png" },
  { name: "Paper cuts", image: "/Productcards/papercuts.png" },
  { name: "Kitchen injuries", image: "/Productcards/kitchen-injuries.png" },
  { name: "Insect bites", image: "/Productcards/insectbites.png" },
  { name: "Redness or skin irritation", image: "/Productcards/redness.png" },
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
            We Are A Wound Care Company 
          </h2>
          <p className="text-base md:text-xl font-medium text-gray-700 max-w-3xl mx-auto leading-relaxed">
            Fast relief for sports injuries & active lifestyles. Protects and heals scrapes, turf burns & workout wounds instantly.
          </p>
          <p className="text-base md:text-xl font-medium text-gray-700 max-w-3xl mx-auto leading-relaxed">Essential at every Household for healing various conditions!</p>
          {/* Premium Condition Cards */}
          <div className="max-w-6xl mx-auto mt-8 md:mt-12">
            <motion.div
              layout
              className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-8 gap-4 md:gap-6"
            >
              <AnimatePresence>
                {visibleConditions.map((condition) => {
                  return (
                    <motion.div
                      key={condition.name}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                      layout
                      className="group relative flex flex-col items-center cursor-pointer"
                    >
                      <div className="w-[70px] h-[70px] md:w-[100px] md:h-[100px] rounded-full overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 border-2 border-[#252c74]">
                        <img src={condition.image} alt={condition.name} className="w-full h-full object-cover" />
                      </div>
                      <span className="text-xs md:text-sm font-medium text-center mt-2 max-w-[80px] md:max-w-[110px] leading-tight text-gray-700">
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
