import React, { useCallback, useEffect } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "./Certification.css";

/* ── Types ── */
interface CertCard {
    tag: string;
    iconClass: string;
    icon: React.ReactNode;
    title: string;
    desc: string;
    file: string;
    downloadHref?: string;
    viewHref?: string;
    className?: string;
}

/* ── Icon SVGs ── */
const DownloadIcon = () => (
    <svg viewBox="0 0 24 24" fill="none">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
);

const ViewIcon = () => (
    <svg viewBox="0 0 24 24" fill="none">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);

const FileIcon = () => (
    <svg viewBox="0 0 24 24" fill="none">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
    </svg>
);

/* ── Data ── */
const row1: CertCard[] = [
    {
        tag: "Government",
        iconClass: "ic-green",
        icon: (
            <svg viewBox="0 0 24 24" fill="none">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
        ),
        title: "AYUSH License",
        desc: "Official AYUSH Ministry license certifying CureMist as an approved Ayurvedic medicinal product sold across India.",
        file: "CureMist Ayush License.pdf",
        downloadHref: "/Certificates/CureMist Ayush License.pdf",
        viewHref: "/Certificates/CureMist Ayush License.pdf",
    },
    {
        tag: "Clinical Trial",
        iconClass: "ic-blue",
        icon: (
            <svg viewBox="0 0 24 24" fill="none">
                <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18" />
            </svg>
        ),
        title: "Human Skin Safety Study",
        desc: "Independent clinical-grade skin irritation study confirming CureMist is safe for all skin types including children.",
        file: "Curemist Human-Skin irritation Safety study Report.pdf",
        downloadHref: "/Certificates/Curemist Human-Skin irritation Safety study Report.pdf",
        viewHref: "/Certificates/Curemist Human-Skin irritation Safety study Report.pdf",
    },
    {
        tag: "Patent",
        iconClass: "ic-gold",
        icon: (
            <svg viewBox="0 0 24 24" fill="none">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
        ),
        title: "Product Patent",
        desc: "Registered Indian patent for CureMist's unique bio-polymer Ayurvedic wound-spray formulation by Indian scientists.",
        file: "Patent_Curemist.pdf",
        downloadHref: "/Certificates/Patent_Curemist.pdf",
        viewHref: "/Certificates/Patent_Curemist.pdf",
    },
    {
        tag: "Manufacturing",
        iconClass: "ic-purple",
        icon: (
            <svg viewBox="0 0 24 24" fill="none">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
        ),
        title: "GMP Certificate (AYUSH)",
        desc: "Good Manufacturing Practices certificate under AYUSH — ensures every batch is produced to exact safety standards.",
        file: "Primacya Ayush GMP.pdf",
        downloadHref: "/Certificates/Primacya Ayush GMP.pdf",
        viewHref: "/Certificates/Primacya Ayush GMP.pdf",
    },
];

const row2: CertCard[] = [
    {
        tag: "ISO Quality",
        iconClass: "ic-teal",
        icon: (
            <svg viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" />
                <path d="M9 12l2 2 4-4" />
            </svg>
        ),
        title: "ISO Certificate",
        desc: "International ISO quality management certification for the manufacturing facility, guaranteeing world-class standards.",
        file: "Primacya ISO Certificate.pdf",
        downloadHref: "/Certificates/Primacya ISO Certificate.pdf",
        viewHref: "/Certificates/Primacya ISO Certificate.pdf",
    },
    {
        tag: "Lab Report",
        iconClass: "ic-red",
        icon: (
            <svg viewBox="0 0 24 24" fill="none">
                <path d="M9 3v11a3 3 0 0 0 6 0V3" />
                <line x1="6" y1="3" x2="18" y2="3" />
            </svg>
        ),
        title: "Lab Quality Report — I",
        desc: "First independent lab test confirming purity, potency of active Ayurvedic ingredients, and absence of contaminants.",
        file: "Quality_Lab-test-1.pdf",
        downloadHref: "/Certificates/Quality_Lab-test-1.pdf",
        viewHref: "/Certificates/Quality_Lab-test-1.pdf",
    },
    {
        tag: "Lab Report",
        iconClass: "ic-orange",
        icon: (
            <svg viewBox="0 0 24 24" fill="none">
                <path d="M9 3v11a3 3 0 0 0 6 0V3" />
                <line x1="6" y1="3" x2="18" y2="3" />
            </svg>
        ),
        title: "Lab Quality Report — II",
        desc: "Second-round analysis validating batch consistency, microbial safety, zero heavy metals, and regulatory compliance.",
        file: "Quality_Lab-test-2.pdf",
        downloadHref: "/Certificates/Quality_Lab-test-2.pdf",
        viewHref: "/Certificates/Quality_Lab-test-2.pdf",
    },
    {
        tag: "Lab Report",
        iconClass: "ic-emerald",
        icon: (
            <svg viewBox="0 0 24 24" fill="none">
                <path d="M9 3v11a3 3 0 0 0 6 0V3" />
                <line x1="6" y1="3" x2="18" y2="3" />
            </svg>
        ),
        title: "Lab Quality Report — III",
        desc: "Comprehensive final-batch test confirming zero pesticides, zero heavy metals, and full product safety compliance.",
        file: "Quality_Lab-test-3.pdf",
        downloadHref: "/Certificates/Quality_Lab-test-3.pdf",
        viewHref: "/Certificates/Quality_Lab-test-3.pdf",
    },
];

const CertCard: React.FC<CertCard> = ({
    tag,
    iconClass,
    icon,
    title,
    desc,
    file,
    downloadHref = "#",
    viewHref = "#",
    className = "",
}) => (
    <div className={`ct-card ${className}`}>
        <div className="ct-card-tag">{tag}</div>
        <div className={`ct-icon ${iconClass}`}>{icon}</div>
        <h3>{title}</h3>
        <p>{desc}</p>
        <div className="ct-file">
            <FileIcon />
            {file}
        </div>
        <div className="ct-actions">
            <a href={downloadHref} download className="ct-btn-download">
                <DownloadIcon />
                Download
            </a>
            <a href={viewHref} target="_blank" rel="noopener noreferrer" className="ct-btn-view">
                <ViewIcon />
                View
            </a>
        </div>
    </div>
);

const Certifications: React.FC = () => {
    const [emblaRef, emblaApi] = useEmblaCarousel({
        loop: true,
        align: "center",
        breakpoints: {
            '(min-width: 640px)': { active: false }
        }
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
        @media (max-width: 639px) {
          .ct-grid {
            display: flex !important;
            gap: 0 !important;
            overflow: visible !important;
            scroll-snap-type: none !important;
            padding-bottom: 0 !important;
            padding-left: 0 !important;
            padding-right: 0 !important;
            scroll-padding: 0 !important;
          }
          .embla-slide {
            flex: 0 0 100% !important;
            min-width: 0 !important;
            scroll-snap-align: none !important;
            margin: 0 !important;
          }
          .ct-card.embla-slide {
            box-sizing: border-box;
            transform: scale(0.95);
          }
          .embla-viewport {
            overflow: hidden;
            width: 100%;
          }
        }
        @media (min-width: 640px) {
          .embla-viewport {
            overflow: visible;
          }
        }
      `}</style>
            <section className="ct-section relative overflow-hidden">
                <div className="ct-rule" />

                <div className="ct-label">
                    <span>Verified &amp; Certified</span>
                </div>

                <h2 className="ct-title">
                    Our Certifications Lab Reports
                </h2>
                <p className="ct-sub">
                    Transparency is the foundation of trust. Every certificate and lab
                    report is publicly available — download them to see exactly what makes
                    CureMist the safest choice for your family.
                </p>

                {/* Certifications Grid (Desktop: wrap 2 rows, Mobile: carousel) */}
                <div className="relative group max-w-[1280px] mx-auto">
                    <button
                        onClick={scrollPrev}
                        className="flex sm:hidden absolute left-2 bottom-4 z-10 bg-white/95 shadow-lg border border-gray-100 p-2 rounded-full hover:bg-gray-50 focus:outline-none transition-transform active:scale-95"
                        aria-label="Scroll left"
                    >
                        <ChevronLeft className="w-5 h-5 text-gray-800" />
                    </button>

                    <button
                        onClick={scrollNext}
                        className="flex sm:hidden absolute right-2 bottom-4 z-10 bg-white/95 shadow-lg border border-gray-100 p-2 rounded-full hover:bg-gray-50 focus:outline-none transition-transform active:scale-95"
                        aria-label="Scroll right"
                    >
                        <ChevronRight className="w-5 h-5 text-gray-800" />
                    </button>

                    <div className="embla-viewport" ref={emblaRef}>
                        <div className="ct-grid hide-scrollbar">
                            {[...row1, ...row2].map((card) => (
                                <CertCard key={card.title} {...card} className="embla-slide" />
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        </React.Fragment>
    );
};

export default Certifications;
