import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth";
import { toast } from "@/components/ui/use-toast";
import { products } from "@/lib/products";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "./product-details.css";

/* ──────────────── helpers ──────────────── */
const parseNum = (s?: string) =>
    s ? Number(s.replace(/[^\d]/g, "")) || 0 : 0;

/* ──────────────── MAIN COMPONENT ──────────────── */
export default function ProductDetailsPage() {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const { addItem } = useCart();
    const { user } = useAuth();

    /* Find product */
    const product = products.find((p) => p.slug === slug);

    /* Embla carousel setup for mechanism section */
    const [emblaRef, emblaApi] = useEmblaCarousel({ 
        loop: true,
        align: "center",
        breakpoints: {
            '(min-width: 769px)': { active: false }
        }
    });

    const scrollPrev = useCallback(() => {
        if (emblaApi) emblaApi.scrollPrev();
    }, [emblaApi]);

    const scrollNext = useCallback(() => {
        if (emblaApi) emblaApi.scrollNext();
    }, [emblaApi]);

    useEffect(() => {
        if (!emblaApi) return;
        const interval = setInterval(() => {
            if (window.innerWidth <= 768) {
                emblaApi.scrollNext();
            }
        }, 3000);
        return () => clearInterval(interval);
    }, [emblaApi]);

    /* Redirect if not found */
    if (!product) {
        return (
            <div style={{ textAlign: "center", padding: "120px 24px", fontFamily: "Montserrat, sans-serif" }}>
                <h2 style={{ fontSize: 28, fontWeight: 800, color: "#0C1F4A", marginBottom: 12 }}>
                    Product Not Found
                </h2>
                <p style={{ color: "#888", marginBottom: 28 }}>
                    The product you are looking for does not exist.
                </p>
                <Link to="/#products" style={{ background: "#0C1F4A", color: "#FFD147", padding: "12px 28px", borderRadius: 8, textDecoration: "none", fontWeight: 700 }}>
                    Back to Products
                </Link>
            </div>
        );
    }

    const productImages =
        product.images && product.images.length > 0
            ? product.images
            : [product.image];

    /* Local state */
    const [activeImg, setActiveImg] = useState(0);
    const [qty, setQty] = useState(1);

    const numPrice = parseNum(product.price);
    const numOrig = parseNum(product.originalPrice);
    const saving = numOrig > numPrice ? numOrig - numPrice : 0;
    const total = numPrice * qty;

    /* Cart / checkout handlers */
    const getCartItem = () => ({
        id: product.slug,
        title: product.title,
        image: product.image,
        price: numPrice,
        originalPrice: numOrig,
        quantity: qty,
        size: product.size,
    });

    const handleBuyNow = () => {
        if (!user) {
            navigate("/login", { state: { from: { pathname: "/checkout" } } });
            return;
        }
        addItem(getCartItem(), qty);
        navigate("/checkout");
    };

    const handleAddToCart = () => {
        if (!user) {
            navigate("/login");
            return;
        }
        addItem(getCartItem(), qty);
        try { toast({ title: "✓ Added to cart", description: `${qty} item(s) added successfully` }); } catch { }
    };

    /* Related products (other 3) */
    const related = products.filter((p) => p.slug !== product.slug).slice(0, 3);

    return (
        <>
            <Header />
            <div className="pd-page">

                {/* ── Breadcrumb ── */}
                <div className="pd-container">
                    <div className="pd-breadcrumb">
                        <Link to="/">Home</Link> &nbsp;/&nbsp;
                        <Link to="/#products">Products</Link> &nbsp;/&nbsp;
                        <span>{product.title.replace(/\n/g, " ")}</span>
                    </div>
                </div>

                {/* ══════════════════════════════
            HERO — Images + Info
        ══════════════════════════════ */}
                <div className="pd-hero">

                    {/* Left: Image Gallery */}
                    <div className="pd-images">
                        <div className="pd-main-image">
                            <img
                                src={productImages[activeImg]}
                                alt={product.title.replace(/\n/g, " ")}
                            />
                        </div>
                        <div className="pd-thumbs">
                            {productImages.map((src, i) => (
                                <button
                                    key={i}
                                    className={`pd-thumb ${i === activeImg ? "active" : ""}`}
                                    onClick={() => setActiveImg(i)}
                                    aria-label={`View image ${i + 1}`}
                                >
                                    <img src={src} alt={`Thumbnail ${i + 1}`} />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Right: Product Info */}
                    <div className="pd-info">
                        {/* Top Badge */}
                        <div className="pd-badge">
                            🌿 AYUSH Approved &nbsp;·&nbsp; 100% Ayurvedic
                        </div>

                        {/* Title */}
                        <h1 className="pd-title">{product.title}</h1>

                        {/* Sub-text */}
                        <p className="pd-subtext">
                            World's First Ayurvedic Wound Spray — forms a waterproof, dust-proof bio-film instantly.
                            Trusted by thousands of Indian families for everyday first-aid.
                        </p>

                        {/* Price */}
                        <div className="pd-price-block">
                            <span className="pd-price">{product.price}</span>
                            {product.originalPrice && (
                                <span className="pd-original">{product.originalPrice}</span>
                            )}
                            <span className="pd-discount-badge">{product.discount}</span>
                        </div>
                        {saving > 0 && (
                            <p className="pd-saving">You save ₹{saving}! 🎉</p>
                        )}

                        {/* Size */}
                        <p className="pd-size-label">Size / Weight</p>
                        <div className="pd-size-chip">{product.size}</div>

                        {/* Quantity */}
                        <p className="pd-qty-label">Quantity</p>
                        <div className="pd-qty-row">
                            <div className="pd-qty-control">
                                <button className="pd-qty-btn" onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
                                <span className="pd-qty-num">{String(qty).padStart(2, "0")}</span>
                                <button className="pd-qty-btn" onClick={() => setQty((q) => q + 1)}>+</button>
                            </div>
                            <span className="pd-total-note">
                                <span className="label">Total:</span> ₹{total}
                            </span>
                        </div>

                        {/* CTAs */}
                        <div className="pd-cta-row">
                            <button className="pd-btn-buy" onClick={handleBuyNow}>
                                BUY NOW
                            </button>
                            <button className="pd-btn-cart" onClick={handleAddToCart}>
                                ADD TO CART
                            </button>
                        </div>

                        {/* Trust chips */}
                        <div className="pd-trust-row">
                            {[
                                { icon: "✅", text: "AYUSH Govt. Approved" },
                                { icon: "🏭", text: "GMP Certified" },
                                { icon: "🔬", text: "Clinically Tested" },
                                { icon: "🚚", text: "Free Delivery Across India." },
                            ].map((t) => (
                                <div key={t.text} className="pd-trust-chip">
                                    <span>{t.icon}</span>
                                    {t.text}
                                </div>
                            ))}
                        </div>

                        {/* Highlights mini strip */}
                        <div className="pd-highlights">
                            {[
                                { num: "3×", label: "Faster Healing" },
                                { num: "1min", label: "Dries Instantly" },
                                { num: "100%", label: "Ayurvedic" },
                                { num: "Zero", label: "Parabens / Sulfates" },
                            ].map((h) => (
                                <div key={h.label} className="pd-highlight-item">
                                    <span className="hi-num">{h.num}</span>
                                    {h.label}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ══════════════════
            ABOUT THIS PRODUCT (moved above Phytochemicals)
        ══════════════════ */}
                <section className="pd-description-section">
                    <div className="pd-container">
                        <p className="pd-section-tag">Product Details</p>
                        <h2 className="pd-section-title">About This Product</h2>
                        <div className="pd-desc-grid">
                            <div className="pd-desc-text">
                                <h3>CureMist — The World's First Ayurvedic Wound Spray</h3>
                                <p>
                                    CureMist represents a breakthrough in first-aid care — the world's first
                                    Ayurvedic wound spray that combines the ancient wisdom of Indian botanicals
                                    with cutting-edge German polymer technology.
                                </p>
                                <p>
                                    Unlike traditional antiseptics that sting and dry out the skin, CureMist
                                    creates a breathable, waterproof bio-film that protects the wound while
                                    actively promoting healing through its powerful Ayurvedic ingredients.
                                </p>
                                <p>
                                    Registered under AYUSH License No: L-AUS-676. Manufactured in a GMP-certified,
                                    ISO-certified facility. Clinically tested on human subjects with zero adverse effects.
                                </p>
                            </div>
                            <div>
                                <div className="pd-spec-table">
                                    {[
                                        ["Product Name", "CureMist Ayurvedic Wound Spray"],
                                        ["Form", product.form ?? "Spray"],
                                        ["Size / Weight", product.size],
                                        ["Primary Benefit", product.benefit ?? "Anti Fungal, Wound Healing"],
                                        ["Shelf Life", "3 Years"],
                                        ["Suitable For", "All ages — Men, Women, Children, Elderly"],
                                    ].map(([key, val]) => (
                                        <div key={key} className="pd-spec-row">
                                            <span className="key">{key}</span>
                                            <span className="val">{val}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════
            MERGED — Mechanism of Actions + Phytochemicals at Work
        ══════════════════════════════════════════ */}
                <section className="pd-phyto-mechanism-section">
                    <div className="pd-container">
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

                        {/* ── TOP: Mechanism of Actions ── */}
                        <div className="pd-mechanism-header">
                            <p className="pd-section-tag">Science Behind the Healing</p>
                            <h2 className="pd-mechanism-title">CureMist : Mechanism of Actions</h2>
                            <p className="pd-mechanism-subtitle">Understanding how CureMist works at a cellular level to accelerate wound recovery.</p>
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
                                    <div className="pd-mechanism-card">
                                        <div className="pd-mechanism-card-icon" style={{ display: "flex", justifyContent: "center", alignItems: "center", margin: "0 auto" }}>{item.icon}</div>
                                        <h3 className="pd-mechanism-card-title">{item.title}</h3>
                                        <p className="pd-mechanism-card-detail">{item.detail}:</p>
                                        <p className="pd-mechanism-card-text">{item.text}</p>
                                    </div>
                                </div>
                            ))}
                                </div>
                            </div>
                        </div>

                        {/* ── BOTTOM: Phytochemicals at Work ── */}
                        <div className="pd-phyto-header pd-phyto-header--inner">
                            <p className="pd-section-tag">Nature's Power</p>
                            <h2 className="pd-section-title">Phytochemicals at Work</h2>
                            <p className="pd-section-sub">
                                Clinically proven phytochemicals that drive the healing power of CureMist.
                            </p>
                        </div>
                        <div className="pd-phyto-img-wrap">
                            <img
                                src="/ProductDetails/Phythochemicals.png"
                                alt="Phytochemicals in CureMist"
                                className="pd-phyto-img"
                            />
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
                                <p className="pd-section-tag" style={{ textAlign: "left" }}>Film Formation Technology</p>
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
            A NATURAL WOUND CARE LIQUID BANDAGE
        ══════════════════ */}
                <section className="pd-nwc-section">
                    <div className="pd-container">
                        <div className="pd-nwc-header">
                            <p className="pd-section-tag">Clinical Innovation</p>
                            <h2 className="pd-nwc-title">A Natural Wound Care<br />Liquid Bandage</h2>
                            <div className="pd-nwc-divider" />
                        </div>
                        <div className="pd-nwc-grid">
                            {[
                                {
                                    icon: "⚗️",
                                    label: "TECHNOLOGY",
                                    text: "A Platform Patented Film Formulation technology, Fabricated with clinical evidence for wound care management",
                                    delay: "0s",
                                },
                                {
                                    icon: "🌿",
                                    label: "INGREDIENTS",
                                    text: "Cure mist contains clinically proven combination of Phytochemicals free from heavy metals and pesticides with potent anti-sceptical and anti-fungal properties and re-epithelization.",
                                    delay: "0.12s",
                                },
                                {
                                    icon: "✅",
                                    label: "APPLICATION",
                                    text: "Cure Mist is an innovative medical devise for Acute wounds & Chronic wounds by controlling wound oxidative stress, anti-inflammatory action for acute and chronic wound therapy.",
                                    delay: "0.24s",
                                },
                            ].map((item) => (
                                <div
                                    key={item.label}
                                    className="pd-nwc-card"
                                    style={{ animationDelay: item.delay }}
                                >
                                    <div className="pd-nwc-card-top">
                                        <div className="pd-nwc-icon-ring">
                                            <span className="pd-nwc-icon">{item.icon}</span>
                                        </div>
                                        <span className="pd-nwc-label">{item.label}</span>
                                    </div>
                                    <p className="pd-nwc-text">{item.text}</p>
                                    <div className="pd-nwc-card-bar" />
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ══════════════════
            HOW IT WORKS
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
                    </div>
                </section>

                {/* ══════════════════
            INGREDIENTS
        ══════════════════ */}
                <section className="pd-ingredients-section">
                    <div className="pd-container">
                        <p className="pd-section-tag">100% Natural</p>
                        <h2 className="pd-section-title">Key Ingredients</h2>
                        <p className="pd-section-sub">
                            A powerful blend of time-tested Ayurvedic botanicals with modern science.
                        </p>
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

                {/* ══════════════════
            RELATED PRODUCTS
        ══════════════════ */}
                <section className="pd-related-section">
                    <div className="pd-container">
                        <p className="pd-section-tag">Also Available</p>
                        <h2 className="pd-section-title">You May Also Like</h2>
                        <p className="pd-section-sub" style={{ marginBottom: 36 }}>
                            Explore other CureMist sizes and combos — get the right one for your needs.
                        </p>
                        <div className="pd-related-grid">
                            {related.map((p) => (
                                <Link key={p.slug} to={`/product/${p.slug}`} className="pd-related-card">
                                    <img className="pd-related-img" src={p.image} alt={p.title.replace(/\n/g, " ")} />
                                    <div className="pd-related-info">
                                        <h4>{p.title}</h4>
                                        <span className="price">{p.price}</span>
                                        {p.originalPrice && <span className="orig">{p.originalPrice}</span>}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>

            </div>
            <Footer />
        </>
    );
}
