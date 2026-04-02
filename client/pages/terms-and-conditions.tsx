import React, { useState } from "react";
import AnnouncementBar from "@/components/AnnouncementBar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BlogHero from "@/components/BlogHero";
import WhatsAppButton from "@/components/WhatsAppButton";
import { ChevronDown } from "lucide-react";

interface Section {
    title: string;
    content: string[];
}

const sections: Section[] = [
    {
        title: "1. Acceptance of Terms",
        content: [
            "By accessing or using the CureMist website (https://curemist.in) and purchasing our products, you agree to be bound by these Terms and Conditions and our Privacy Policy.",
            "If you do not agree with any part of these terms, please do not use our website. We reserve the right to modify these terms at any time without prior notice.",
        ],
    },
    {
        title: "2. Products & Descriptions",
        content: [
            "All products listed on our website are described as accurately as possible. However, we do not warrant that product descriptions, images, or other content are entirely error-free.",
            "CureMist products are Ayurvedic healthcare products approved under AYUSH guidelines. They are not intended to diagnose, treat, cure, or prevent any disease. Always consult a qualified healthcare professional before use.",
        ],
    },
    {
        title: "3. Pricing & Payment",
        content: [
            "All prices are listed in Indian Rupees (INR) and are inclusive of applicable taxes unless stated otherwise.",
            "We reserve the right to adjust prices at any time without prior notice. Prices in effect at the time of order placement will apply to that order.",
            "Payment is processed securely through our payment partners. We accept UPI, credit/debit cards, net banking, and other available methods.",
        ],
    },
    {
        title: "4. Orders & Cancellations",
        content: [
            "By placing an order, you make an offer to purchase the selected products. We reserve the right to accept or reject any order.",
            "Orders may be cancelled before dispatch. Once an order has been dispatched, our Return & Refund policy applies.",
            "We reserve the right to cancel any order due to stock unavailability, pricing errors, or suspected fraudulent activity.",
        ],
    },
    {
        title: "5. User Accounts",
        content: [
            "You are responsible for maintaining the confidentiality of your account credentials. Any activity under your account is your responsibility.",
            "You must provide accurate and up-to-date information when creating an account. We reserve the right to suspend accounts found to be in violation of these terms.",
        ],
    },
    {
        title: "6. Intellectual Property",
        content: [
            "All content on this website — including text, images, logos, graphics, and software — is the intellectual property of Altus Pharma / CureMist and is protected under applicable copyright and trademark laws.",
            "You may not reproduce, distribute, or create derivative works from our content without explicit written permission.",
        ],
    },
    {
        title: "7. Limitation of Liability",
        content: [
            "To the fullest extent permitted by law, Altus Pharma shall not be liable for any indirect, incidental, or consequential damages arising from the use of our products or website.",
            "Our total liability in any matter arising from these terms shall not exceed the value of the order in question.",
        ],
    },
    {
        title: "8. Governing Law",
        content: [
            "These Terms and Conditions are governed by the laws of India. Any disputes arising shall be subject to the exclusive jurisdiction of the courts in Kerala, India.",
        ],
    },
    {
        title: "9. Contact Us",
        content: [
            "For questions regarding these Terms, contact us at: contact@altuspharma.in or call +91 88488 15296.",
            "Altus Pharma, 13/223 B,C, Sukapuram Complex, Near Chambaramanam Temple, Naduvattom, Sugapuram Po, Edappal, Kerala 679576.",
        ],
    },
];

function AccordionItem({ title, content }: Section) {
    const [open, setOpen] = useState(false);
    return (
        <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm mb-3">
            <button
                className="w-full flex items-center justify-between px-6 py-4 bg-white hover:bg-gray-50 transition-colors text-left"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
            >
                <span className="text-brand-blue font-bold text-sm md:text-base">{title}</span>
                <ChevronDown
                    size={18}
                    className={`text-brand-blue flex-shrink-0 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
                />
            </button>
            {open && (
                <div className="px-6 pb-5 pt-1 bg-white border-t border-gray-100">
                    {content.map((para, i) => (
                        <p key={i} className="text-gray-600 text-sm md:text-base leading-relaxed mb-3 last:mb-0">
                            {para}
                        </p>
                    ))}
                </div>
            )}
        </div>
    );
}

const TermsAndConditions = () => {
    const breadcrumbItems = [
        { label: "Home", href: "/" },
        { label: "Terms & Conditions" },
    ];

    return (
        <div className="min-h-screen flex flex-col">
            <AnnouncementBar />
            <Header />

            <BlogHero title="Terms & Conditions" subtitle="Last updated: February 2025" breadcrumbItems={breadcrumbItems} />

            <section className="bg-white py-12 md:py-20">
                <div className="container mx-auto px-4 md:px-6 lg:px-24 max-w-4xl">
                    {/* Intro Banner */}
                    <div className="bg-gradient-to-r from-brand-blue to-[#1a2a6c] rounded-2xl p-6 md:p-8 mb-10 text-white">
                        <h2 className="text-lg md:text-xl font-bold mb-2">Please Read Carefully</h2>
                        <p className="text-white/80 text-sm md:text-base leading-relaxed">
                            These Terms & Conditions govern your use of the CureMist website and the purchase of our products.
                            By using our platform, you agree to these terms.
                        </p>
                    </div>

                    {/* Accordion Sections */}
                    <div>
                        {sections.map((s) => (
                            <AccordionItem key={s.title} {...s} />
                        ))}
                    </div>

                    <p className="text-xs text-gray-400 text-center mt-10">
                        These terms may be updated from time to time. Continued use of our website constitutes acceptance of any revised terms.
                    </p>
                </div>
            </section>

            <Footer />
            <WhatsAppButton />
        </div>
    );
};

export default TermsAndConditions;
