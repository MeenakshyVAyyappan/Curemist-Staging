import React, { useRef } from "react";
import ProductCard from "./ProductCard";
import { products } from "@/lib/products";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function ProductSection() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = scrollContainerRef.current.clientWidth * 0.8;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth"
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
            Fast relief for sports injuries & active lifestyles. Protects and heals scrapes, turf burns & workout wounds instantly.
          </p>

          {/* Premium Condition Cards */}
          <div className="max-w-6xl mx-auto mt-8 md:mt-12">
            <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-8 gap-2 md:gap-3">
              {[
                "Nail Fungus",
                "Tinea / Ringworm",
                "Foot ulcers",
                "Varicose vein ulcers",
                "Bed sore ulcers/wounds",
                "Cancer treatment Radiation wounds",
                "Minor cuts & scratches",
                "Shaving cuts",
                "Shoe bites",
                "Small burns",
                "Paper cuts",
                "Kitchen injuries",
                "Insect bites",
                "Redness or skin irritation",
                "Jock Itch",
                "Eczema",
              ].map((condition, index) => (
                <div
                  key={condition}
                  className={`group bg-[#fff7d9] border border-[#252c74] rounded-lg p-2 h-14 flex items-center justify-center text-center shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-300 hover:scale-105 ${
                    index >= 12 ? 'hidden md:flex' : ''
                  }`}
                >
                  <span className="text-xs font-medium text-black leading-tight line-clamp-2">
                    {condition}
                  </span>
                </div>
              ))}
            </div>
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
          {/* Navigation Arrows for Desktop */}
          <button 
            onClick={() => scroll('left')} 
            className="hidden md:flex absolute -left-4 xl:-left-12 top-1/2 -translate-y-1/2 z-10 bg-white shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] border border-gray-100 p-3 rounded-full hover:bg-gray-50 hover:scale-105 transition-all duration-300 opacity-0 group-hover:opacity-100 focus:outline-none"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-6 h-6 text-gray-800" />
          </button>
          
          <button 
            onClick={() => scroll('right')} 
            className="hidden md:flex absolute -right-4 xl:-right-12 top-1/2 -translate-y-1/2 z-10 bg-white shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] border border-gray-100 p-3 rounded-full hover:bg-gray-50 hover:scale-105 transition-all duration-300 opacity-0 group-hover:opacity-100 focus:outline-none"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-6 h-6 text-gray-800" />
          </button>

          {/* Desktop Snap Scroll List */}
          <div 
             ref={scrollContainerRef}
             className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-8 hide-scrollbar scroll-smooth pt-4 items-stretch"
          >
             {carouselProducts.map((product, index) => (
                <div key={index} className="w-[calc(33.333%-16px)] lg:w-[calc(25%-18px)] flex-shrink-0 snap-start flex flex-col">
                   <ProductCard {...product} />
                </div>
             ))}
          </div>
          
          <style dangerouslySetInnerHTML={{__html: `
            .hide-scrollbar::-webkit-scrollbar {
              display: none;
            }
            .hide-scrollbar {
              -ms-overflow-style: none;
              scrollbar-width: none;
            }
          `}} />
        </div>
      </div>
    </section>
  );
}
