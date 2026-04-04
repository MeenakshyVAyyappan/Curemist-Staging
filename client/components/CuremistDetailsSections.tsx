import React, { useEffect, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, ShieldCheck } from "lucide-react";
import "../pages/product-details.css"; // Ensure styles are available

export default function CuremistDetailsSections() {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "center",
    breakpoints: {
      "(min-width: 769px)": { active: false },
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
              @media (max-width: 768px) {
                .pd-mechanism-grid {
                  display: flex !important;
                  gap: 0 !important;
                }
                .embla-slide-container {
                  flex: 0 0 100%;
                  min-width: 0;
                  padding: 0 10px;
                }
                .embla-viewport {
                  overflow: hidden;
                  width: 100%;
                }
              }
              @media (min-width: 769px) {
                .embla-viewport {
                  overflow: visible;
                }
                .embla-slide-container {
                  display: contents; /* so the grid works natively */
                }
                .mobile-arrows {
                  display: none !important;
                }
              }
            `}</style>
      {/* ══════════════════════════════════════════
            MERGED — Mechanism of Actions + Phytochemicals at Work
        ══════════════════════════════════════════ */}
      <section className="pd-phyto-mechanism-section">
        <div className="pd-container px-4">
          {/* ── TOP: Mechanism of Actions ── */}
          <div className="pd-mechanism-header">
            <p className="pd-section-tag">Science Behind the Healing</p>
            <h2 className="pd-mechanism-title">
              CUREMIST : Mechanism of Actions
            </h2>
            <p className="pd-mechanism-subtitle">
              Understanding how CureMist works at a cellular level to accelerate
              wound recovery.
            </p>
          </div>

          <div className="relative h-fit">
            <button
              className="mobile-arrows absolute left-0 bottom-4 z-10 bg-white/90 shadow-lg border border-gray-100 p-2 rounded-full text-brand-blue"
              onClick={scrollPrev}
              aria-label="Previous card"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              className="mobile-arrows absolute right-0 bottom-4 z-10 bg-white/90 shadow-lg border border-gray-100 p-2 rounded-full text-brand-blue"
              onClick={scrollNext}
              aria-label="Next card"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            <div className="embla-viewport" ref={emblaRef}>
              <div className="pd-mechanism-grid">
                {[
                  {
                    icon: "🔥",
                    title: "Anti-inflammatory Effects",
                    detail: "Inhibition of Pro-inflammatory Cytokines",
                    text: "Curemist reduces the levels of pro-inflammatory cytokines such as TNF-α, IL-1β, and IL-6. By modulating these cytokines.",
                  },
                  {
                    icon: "⚡",
                    title: "Antioxidant Properties",
                    detail: "Scavenging Free Radicals",
                    text: "Curemist acts as a potent antioxidant, neutralizing free radicals and reducing oxidative stress at the wound site.",
                  },
                  {
                    icon: "🦠",
                    title: "Antimicrobial Activity",
                    detail: "Direct Antimicrobial Effects",
                    text: "Curemist has broad-spectrum antimicrobial properties by inhibiting the growth of various bacteria & fungi",
                  },
                  {
                    icon: "🧬",
                    title: "Collagen Synthesis",
                    detail: "Increased Collagen Deposition",
                    text: "Curemist stimulates the synthesis of collagen, a major component of the extracellular matrix, which provides structural support to the wound.",
                  },
                ].map((item) => (
                  <div key={item.title} className="embla-slide-container">
                    <div className="pd-mechanism-card h-full">
                      <div
                        className="pd-mechanism-card-icon"
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          margin: "0 auto",
                        }}
                      >
                        {item.icon}
                      </div>
                      <h3 className="pd-mechanism-card-title text-center">
                        {item.title}
                      </h3>
                      <p className="pd-mechanism-card-detail text-center">
                        {item.detail}:
                      </p>
                      <p className="pd-mechanism-card-text text-center">
                        {item.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════
            HOW CURE MIST ACTS — with WhyCuremistAct image
        ══════════════════ */}
      <section className="pd-howact-section">
        <div className="pd-container">
          <div className="pd-howact-grid">
            <div className="pd-howact-visual">
              <img
                src="/WhyCuremist/WhycuremistAct.png"
                alt="How CureMist Acts on Wound"
                className="pd-howact-img"
              />
            </div>
            <div className="pd-howact-content">
              <p className="pd-section-tag" style={{ textAlign: "left" }}>
                Film Formation Technology
              </p>
              <h2 className="pd-howact-title">How CureMist Acts</h2>
              <div className="pd-howact-points">
                {[
                  "Cure Mist film formation spray is designed to provide a protective barrier over wounds.",
                  "The spray forms a thin, flexible film over the wound, protecting it from external contaminants such as bacteria, dirt, and debris.",
                  "The bioactive maintain a moist wound environment. Moist wounds heal faster and with less scarring compared to dry wounds.",
                  "The semi-permeable film, allowing oxygen to reach the wound. Oxygen is crucial for cell regeneration and the overall healing process.",
                ].map((point, i) => (
                  <div key={i} className="pd-howact-point">
                    <div className="pd-howact-bullet">{i + 1}</div>
                    <p>{point}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════
            HOW IT WORKS (How to Use CureMist)
        ══════════════════ */}
      <section className="pd-how-section">
        <div className="pd-container">
          <p className="pd-section-tag">Simple &amp; Effective</p>
          <h2 className="pd-section-title">How To Use CureMist</h2>
          <p className="pd-section-sub">
            Three simple steps — and your wound is protected in under a minute.
          </p>
          <div className="pd-steps-grid">
            {[
              {
                step: "01",
                title: "Clean the Wound",
                desc: "Gently clean the wound area with saline water. Pat dry with a clean cotton swab to remove moisture and debris.",
              },
              {
                step: "02",
                title: "Spray CureMist",
                desc: "Hold the bottle 4–5 cm from the wound and spray evenly across the entire affected area in a sweeping motion.",
              },
              {
                step: "03",
                title: "Let It Dry",
                desc: "Allow the spray to air-dry for 30–60 seconds. A protective bio-film forms instantly — no bandage needed!",
              },
            ].map((s) => (
              <div key={s.step} className="pd-step">
                <div className="pd-step-num">{s.step}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>

          {/* Film Visibility Info -> PREMIUM LAYOUT */}
          {/* Film Visibility Info -> VERY COMPACT LAYOUT */}
          <div className="mt-8 max-w-md mx-auto flex flex-col md:flex-row gap-3 px-4">
            {/* Darker Skin Box - Match top boxes background */}
            <div className="flex-1 bg-white/60 backdrop-blur-sm p-3 rounded-lg border border-white/80 shadow-sm">
              <h5 className="font-bold text-[#252c74] text-xs mb-1 flex items-center justify-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#252c74]"></span>
                Darker Skin
              </h5>
              <p className="text-[11px] text-black leading-snug text-center">
                The protective film may appear more clearly visible once it dries onto the skin.
              </p>
            </div>

            {/* Fair Skin Box - Match top boxes background */}
            <div className="flex-1 bg-white/60 backdrop-blur-sm p-3 rounded-lg border border-white/80 shadow-sm">
              <h5 className="font-bold text-[#252c74] text-xs mb-1 flex items-center justify-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ffe38d]"></span>
                Fair Skin
              </h5>
              <p className="text-[11px] text-black leading-snug text-center">
                The film may not be seen with a single spray, but becomes noticeably visible after multiple sprays.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════
            INGREDIENTS
        ══════════════════ */}
      <section className="pd-ingredients-section">
        <div className="pd-container">
          <p className="pd-section-tag">100% Natural</p>
          <h2 className="pd-section-title">Key Ingredients</h2>
          <div className="pd-ingredients-row">
            {[
              "Turmeric (Curcumin)",
              "Onion Extract",
              "Clove (Eugenol)",
              "Brahmi",
            ].map((ing) => (
              <div key={ing} className="pd-ingredient-chip">
                <span className="dot" />
                {ing}
              </div>
            ))}
          </div>
        </div>
      </section>
    </React.Fragment>
  );
}
