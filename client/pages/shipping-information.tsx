import React from "react";
import AnnouncementBar from "@/components/AnnouncementBar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BlogHero from "@/components/BlogHero";
import WhatsAppButton from "@/components/WhatsAppButton";
import { Package, Clock, MapPin, Truck, RefreshCw, ShieldCheck } from "lucide-react";

interface InfoCardProps {
    icon: React.ReactNode;
    title: string;
    items: string[];
    accent?: boolean;
}

function InfoCard({ icon, title, items, accent = false }: InfoCardProps) {
    return (
        <div
            className={`rounded-2xl p-6 md:p-8 shadow-sm border transition-all duration-300 hover:shadow-md hover:-translate-y-0.5
       ${accent ? "bg-brand-blue border-brand-blue text-white" : "bg-white border-gray-100 text-brand-blue"}`}
        >
            <div
                className={`flex items-center justify-center w-12 h-12 rounded-full mb-4
        ${accent ? "bg-white/15" : "bg-brand-yellow/20"}`}
            >
                <span className={accent ? "text-brand-yellow" : "text-brand-blue"}>{icon}</span>
            </div>
            <h3 className={`font-bold text-base md:text-lg mb-4 ${accent ? "text-white" : "text-brand-blue"}`}>{title}</h3>
            <ul className="space-y-2.5">
                {items.map((item, i) => (
                    <li key={i} className={`flex gap-2.5 text-sm leading-relaxed ${accent ? "text-white/85" : "text-gray-600"}`}>
                        <span className={`flex-shrink-0 mt-0.5 w-1.5 h-1.5 rounded-full mt-2 ${accent ? "bg-brand-yellow" : "bg-brand-blue"}`} />
                        {item}
                    </li>
                ))}
            </ul>
        </div>
    );
}

const shippingCards = [
    {
        icon: <Clock size={22} />,
        title: "Processing Time",
        items: [
            "Orders are processed within 1–2 business days.",
            "Orders placed on weekends or public holidays are processed the next business day.",
            "You will receive an order confirmation email once your order is successfully placed.",
        ],
    },
    {
        icon: <Truck size={22} />,
        title: "Delivery Time",
        items: [
            "Standard delivery: 4–7 business days across India.",
            "Express delivery (where available): 2–3 business days.",
            "Delivery timelines may vary during peak seasons or due to unforeseen circumstances.",
        ],
        accent: true,
    },
    {
        icon: <MapPin size={22} />,
        title: "Delivery Areas",
        items: [
            "We deliver across all major cities and towns in India.",
            "Remote areas may require additional transit time of 2–3 days.",
            "We currently do not offer international shipping.",
        ],
    },
    {
        icon: <Package size={22} />,
        title: "Shipping Charges",
        items: [
            "Free shipping on all orders above ₹499.",
            "A flat shipping fee of ₹50 applies to orders below ₹499.",
            "Shipping charges, if any, will be clearly displayed at checkout before payment.",
        ],
    },
    {
        icon: <RefreshCw size={22} />,
        title: "Returns & Refunds",
        items: [
            "We accept returns within 7 days of delivery for damaged or defective products.",
            "Products must be returned in original, unused condition with packaging intact.",
            "Refunds are processed within 5–7 business days to the original payment method.",
            "To initiate a return, please contact us at contact@altuspharma.in.",
        ],
    },
    {
        icon: <ShieldCheck size={22} />,
        title: "Order Tracking",
        items: [
            "Once your order is shipped, you will receive a tracking number via email.",
            "Use the tracking number on the courier's website to track your shipment.",
            "For tracking assistance, contact us at contact@altuspharma.in.",
        ],
        accent: true,
    },
];

const ShippingInformation = () => {
    const breadcrumbItems = [
        { label: "Home", href: "/" },
        { label: "Shipping Information" },
    ];

    return (
        <div className="min-h-screen flex flex-col">
            <AnnouncementBar />
            <Header />

            <BlogHero title="Shipping Information" subtitle="Fast, reliable delivery across India" breadcrumbItems={breadcrumbItems} />

            <section className="bg-gray-50 py-12 md:py-20">
                <div className="container mx-auto px-4 md:px-6 lg:px-24">
                    {/* Highlight Banner */}
                    <div className="bg-gradient-to-r from-brand-yellow/30 to-brand-yellow/10 border border-brand-yellow/40 rounded-2xl p-5 md:p-7 mb-10 flex flex-col sm:flex-row items-start sm:items-center gap-3">
                        <span className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-brand-yellow text-brand-blue">
                            <Truck size={20} />
                        </span>
                        <div>
                            <p className="text-brand-blue font-bold text-sm md:text-base">Free Shipping Across India</p>
                            <p className="text-gray-600 text-xs md:text-sm mt-0.5">
                                We ship PAN India. Delivery within 4–7 business days. Returns accepted within 7 days for damaged products.
                            </p>
                        </div>
                    </div>

                    {/* Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {shippingCards.map((card) => (
                            <InfoCard key={card.title} {...card} />
                        ))}
                    </div>

                    {/* Contact CTA */}
                    <div className="mt-12 text-center">
                        <p className="text-gray-500 text-sm md:text-base mb-4">
                            Have a question about your order or delivery?
                        </p>
                        <a
                            href="mailto:contact@altuspharma.in"
                            className="inline-flex items-center gap-2 bg-brand-blue text-white font-bold text-sm px-8 py-3 rounded-xl hover:bg-brand-blue/90 transition-all duration-200"
                        >
                            Contact Support
                        </a>
                    </div>
                </div>
            </section>

            <Footer />
            <WhatsAppButton />
        </div>
    );
};

export default ShippingInformation;
