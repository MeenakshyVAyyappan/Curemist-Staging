import React, { useCallback, useEffect } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "./WhySafe.css";

const cards = [
  {
    num: "01",
    icon: "🌱",
    title: "Biodegradable Polymer Technology",
    desc: "CureMist uses a German-engineered bio-safe polymer film that protects wounds and then breaks down naturally — leaving zero synthetic residue on your skin or in the environment.",
  },
  {
    num: "02",
    icon: "🧑‍⚕️",
    title: "Clinically Tested & Proven",
    desc: "Completed an independent human skin-irritation clinical trial. Results confirm it is non-irritating, non-sensitizing, and safe for adults, children, and sensitive skin types.",
  },
  {
    num: "03",
    icon: "🌿",
    title: "Zero Pesticides — Guaranteed",
    desc: "No pesticides are used at any stage — from raw ingredient sourcing and processing to final formulation and packaging. Lab-verified in every production batch.",
  },
  {
    num: "04",
    icon: "🛡️",
    title: "No Heavy Metals — Lab Verified",
    desc: "Independently tested and certified free of lead, mercury, arsenic, cadmium, and all regulated heavy metals — meeting international safety thresholds in every batch.",
  },
  {
    num: "05",
    icon: "🧪",
    title: "100% PFAS-Free Formulation",
    desc: "Completely free of polyfluoroalkyl substances (PFAS). Formulated with a safe, eco-friendly acrylic monomer instead of harmful fluorinated compounds.",
  },
];

const WhySafe: React.FC = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "center",
    breakpoints: {
      "(min-width: 1025px)": { active: false },
    },
  });

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  useEffect(() => {
    // Autoplay removed for mobile view as per request
  }, [emblaApi]);

  return (
    <React.Fragment>
      <style>{`
        @media (max-width: 1024px) {
          .ws-grid {
            display: flex !important;
            gap: 0 !important;
            overflow: visible !important;
            scroll-snap-type: none !important;
            padding-bottom: 0 !important;
            padding-left: 0 !important;
            padding-right: 0 !important;
          }
          .embla-slide {
            flex: 0 0 70% !important;
            min-width: 0 !important;
            scroll-snap-align: none !important;
            margin: 0 12px !important;
          }
          .ws-card.embla-slide {
            box-sizing: border-box;
            border-right: 1.5px solid rgba(213, 160, 0, 0.18) !important;
            transform: scale(0.95);
            padding-top: 40px !important;
            padding-bottom: 40px !important;
          }
          .embla-viewport {
            overflow: hidden;
            width: 100%;
            padding-left: 20px;
            padding-right: 20px;
          }
        }
        @media (min-width: 1025px) {
          .embla-viewport {
            overflow: visible;
          }
        }
      `}</style>
      <section className="ws-section relative overflow-hidden">
        <div className="ws-deco-line" />

        <div className="ws-label">
          <span>Quality Assurance</span>
        </div>

        <h2 className="ws-title">Why CureMist is 100% Safe</h2>

        <p className="ws-sub">
          Every promise is backed by independent lab reports and clinical
          studies publicly available for you to verify.
        </p>

        <div className="relative h-fit group max-w-[1300px] mx-auto">
          <button
            onClick={scrollPrev}
            className="flex lg:hidden absolute left-2 bottom-4 z-10 bg-white/95 shadow-lg border border-gray-100 p-2 rounded-full hover:bg-gray-50 focus:outline-none transition-transform active:scale-95"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-5 h-5 text-gray-800" />
          </button>

          <button
            onClick={scrollNext}
            className="flex lg:hidden absolute right-2 bottom-4 z-10 bg-white/95 shadow-lg border border-gray-100 p-2 rounded-full hover:bg-gray-50 focus:outline-none transition-transform active:scale-95"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-5 h-5 text-gray-800" />
          </button>

          <div className="embla-viewport" ref={emblaRef}>
            <div className="ws-grid hide-scrollbar">
              {cards.map((card) => (
                <div className="ws-card embla-slide" key={card.num}>
                  <div
                    className="ws-icon-wrap w-12 h-12 flex items-center justify-center text-3xl mb-6 relative"
                    style={{ textAlign: "center" }}
                  >
                    {card.icon}
                  </div>
                  <h3>{card.title}</h3>
                  <p>{card.desc}</p>
                  <div className="ws-card-accent" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </React.Fragment>
  );
};

export default WhySafe;
