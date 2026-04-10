import { useState, useEffect, useRef, type TouchEvent } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const BANNERS = [
  {
    image: "/banners/banner01new.png",
    title: "CureMist - Ayurvedic First Aid Wound Spray",
    description: "Safe for all ages | AYUSH Certified |\nPatented Formula",
    buttonText: "Shop Now",
    // ✅ Keep model face visible (move focus to right side)
    mobileBgPos: "55% 30%",
  },
  {
    image: "/banners/banner02.png",
    title: "Trusted by Over 5000+ Families for Everyday Healing",
    description: "From Kids Scrapes\nto daily first aid needs",
    buttonText: "Shop Now",
    mobileBgPos: "70% 20%",
  },
  {
    image: "/banners/banner3.png",
    title: "Small Wounds Can Happen Anytime.",
    description: "Curemist Combo Pack\nBuy 2 & save More",
    buttonText: "Shop Now",
    mobileBgPos: "75% 20%",
  },
];

export default function Hero() {
  const [currentBanner, setCurrentBanner] = useState(0);
  const [sliderIndex, setSliderIndex] = useState(1);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const minSwipeDistance = 50;
  const isTransitioningRef = useRef(false);
  const sliderRef = useRef<HTMLDivElement>(null);

  const sliderItems = [BANNERS[BANNERS.length - 1], ...BANNERS, BANNERS[0]];

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (isTransitioningRef.current) return;
      isTransitioningRef.current = true;
      setCurrentBanner((prev) => (prev + 1) % BANNERS.length);
      setSliderIndex((prev) => prev + 1);
    }, 8000);

    return () => window.clearTimeout(timer);
  }, [currentBanner]);

  const prevBanner = () => {
    if (isTransitioningRef.current) return;
    isTransitioningRef.current = true;
    setCurrentBanner((prev) => (prev - 1 + BANNERS.length) % BANNERS.length);
    setSliderIndex((prev) => prev - 1);
  };

  const nextBanner = () => {
    if (isTransitioningRef.current) return;
    isTransitioningRef.current = true;
    setCurrentBanner((prev) => (prev + 1) % BANNERS.length);
    setSliderIndex((prev) => prev + 1);
  };

  const goToBanner = (index: number) => {
    if (isTransitioningRef.current || index === currentBanner) return;
    isTransitioningRef.current = true;
    setCurrentBanner(index);
    setSliderIndex(index + 1);
  };

  const onTransitionEnd = () => {
    if (sliderIndex <= 0) {
      if (sliderRef.current) {
        sliderRef.current.style.transition = "none";
        sliderRef.current.style.transform = `translateX(-${BANNERS.length * 100}%)`;
        void sliderRef.current.offsetWidth; // Force synchronous reflow
        sliderRef.current.style.transition = "";
      }
      setSliderIndex(BANNERS.length);
    } else if (sliderIndex >= sliderItems.length - 1) {
      if (sliderRef.current) {
        sliderRef.current.style.transition = "none";
        sliderRef.current.style.transform = `translateX(-100%)`;
        void sliderRef.current.offsetWidth; // Force synchronous reflow
        sliderRef.current.style.transition = "";
      }
      setSliderIndex(1);
    }
    
    // Safety delay to prevent rapid double-clicks from misaligning state right after a loop
    setTimeout(() => {
      isTransitioningRef.current = false;
    }, 20);
  };

  const onTouchStartHandler = (e: TouchEvent<HTMLDivElement>) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMoveHandler = (e: TouchEvent<HTMLDivElement>) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEndHandler = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      nextBanner();
    } else if (isRightSwipe) {
      prevBanner();
    }
  };

  const banner = BANNERS[currentBanner];

  return (
    <section
      className="relative mt-0 min-h-[50vh] md:h-[650px] overflow-hidden"
      onTouchStart={onTouchStartHandler}
      onTouchMove={onTouchMoveHandler}
      onTouchEnd={onTouchEndHandler}
    >
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          ref={sliderRef}
          className="flex h-full transition-transform duration-700 ease-out"
          style={{ transform: `translateX(-${sliderIndex * 100}%)` }}
          onTransitionEnd={onTransitionEnd}
        >
          {sliderItems.map((b, index) => (
            <div key={index} className="relative min-w-full h-full">
              <div
                className="absolute inset-0 bg-cover bg-no-repeat md:bg-center"
                style={{
                  backgroundImage: `url(${b.image})`,
                  backgroundSize: "cover",
                  // ✅ mobile crop control (keeps face clear)
                  backgroundPosition: b.mobileBgPos,
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 md:px-6 lg:px-24 h-full relative z-10">
        <div className="h-full flex items-center">
          {/* ✅ Limit width on mobile so text won't cover the face */}
          <div className="w-[62%] sm:w-[58%] md:w-full lg:w-1/2 space-y-4 md:space-y-6 pt-6 md:pt-0">
            <h1 className="text-[22px] sm:text-3xl md:text-xl lg:text-5xl font-bold text-brand-blue leading-snug whitespace-pre-line">
              {banner.title}
            </h1>

            {/* hide on mobile (your old requirement), show from md */}
            <h3 className="hidden md:block text-sm sm:text-lg md:text-xl lg:text-3xl font-medium text-black whitespace-pre-line">
              {banner.description}
            </h3>

            <button
              onClick={() => {
                const productsSection = document.getElementById("products");
                if (productsSection) {
                  const offsetTop = productsSection.offsetTop - 120; // Offset for header
                  window.scrollTo({
                    top: offsetTop,
                    behavior: "smooth",
                  });
                }
              }}
              className="bg-brand-yellow hover:bg-brand-yellow/90 text-brand-blue px-5 md:px-12 py-3 md:py-4 rounded-lg text-sm sm:text-base md:text-lg font-extrabold transition-colors"
            >
              {banner.buttonText}
            </button>

            {/* Badges */}
            <div className="flex items-center gap-2 sm:gap-4 pt-2 md:pt-4">
              <img
                src="/banners/element1.png"
                alt="AYUSH Badge"
                className="h-[28px] sm:h-[35px] md:h-[51px] w-auto"
              />
              <img
                src="/banners/element2.png"
                alt="Certification Badge"
                className="h-[28px] sm:h-[35px] md:h-[51px] w-auto"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Left Arrow */}
      {/* Left Arrow */}
      <button
        onClick={prevBanner}
        className="
    absolute left-4 sm:left-6
    bottom-16 md:bottom-auto
    top-auto md:top-1/2
    translate-y-0 md:-translate-y-1/2
    z-30 bg-white/80 hover:bg-white
    p-2 sm:p-3 rounded-full shadow-lg text-brand-blue
    transition-all hover:scale-110
  "
        aria-label="Previous Banner"
      >
        <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
      </button>

      {/* Right Arrow */}
      <button
        onClick={nextBanner}
        className="
    absolute right-4 sm:right-6
    bottom-16 md:bottom-auto
    top-auto md:top-1/2
    translate-y-0 md:-translate-y-1/2
    z-30 bg-white/80 hover:bg-white
    p-2 sm:p-3 rounded-full shadow-lg text-brand-blue
    transition-all hover:scale-110
  "
        aria-label="Next Banner"
      >
        <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
      </button>

      {/* Indicators */}
      <div className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {BANNERS.map((_, index) => (
          <button
            key={index}
            onClick={() => goToBanner(index)}
            className={`h-2 md:h-3 rounded-full transition-all duration-300 ${
              index === currentBanner
                ? "bg-brand-blue w-8 md:w-10"
                : "bg-brand-blue/40 w-2 md:w-3 hover:bg-brand-blue/60"
            }`}
            aria-label={`Go to banner ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
