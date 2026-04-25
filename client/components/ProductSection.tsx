import React, { useRef, useState } from "react";
import ProductCard from "./ProductCard";
import { products } from "@/lib/products";
import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import PremiumConditionCards from "./PremiumConditionCards";

export default function ProductSection() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);


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
            We are a Wound Care Company❤️
          </h2>
          <p className="text-base md:text-xl font-medium text-gray-700 max-w-3xl mx-auto leading-relaxed">
            Fast relief for sports injuries & active lifestyles. Protects and heals scrapes, turf burns & workout wounds instantly.
          </p>
          <br />
          <p className="text-base md:text-xl font-medium text-gray-700 max-w-3xl mx-auto leading-relaxed">Essential at every Household for healing various conditions!</p>
          <PremiumConditionCards />
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
