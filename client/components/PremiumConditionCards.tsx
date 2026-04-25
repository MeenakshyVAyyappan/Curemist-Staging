import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export const conditionsList = [
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

export default function PremiumConditionCards() {
  const [showAllConditions, setShowAllConditions] = useState(false);

  const visibleCount = 8;
  const visibleConditions = showAllConditions
    ? conditionsList
    : conditionsList.slice(0, visibleCount);

  return (
    <div className="max-w-6xl mx-auto mt-8 md:mt-12">
      <motion.div
        layout
        className="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-8 gap-4 md:gap-6"
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
                <span className="text-xs md:text-sm font-medium text-center mt-2 max-w-[80px] md:max-w-[110px] leading-tight text-black">
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
  );
}
