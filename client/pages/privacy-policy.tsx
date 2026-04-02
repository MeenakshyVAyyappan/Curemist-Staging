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
        title: "1. Introduction",
        content: [
            "Welcome to CureMist, operated by Altus Pharma. We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, and share information about you when you use our website at https://curemist.in.",
            "By using our services you agree to the collection and use of information in accordance with this policy. If you have any objections, please refrain from using our platform.",
        ],
    },
    {
        title: "2. Information We Collect",
        content: [
            "Personal Identification Information: Name, email address, phone number, shipping address, billing address — collected when you create an account, place an order, or contact us.",
            "Automatically Collected Data: IP address, browser type, pages visited, time spent, referral URL — collected via cookies, log files, and similar technologies.",
            "Payment Information: Payment card details are processed securely by our payment partners and are never stored on our servers.",
        ],
    },
    {
        title: "3. How We Use Your Information",
        content: [
            "To process and fulfill your orders, including shipping and order confirmation communications.",
            "To manage your account and provide customer support.",
            "To send promotional emails and offers if you have opted in (you may unsubscribe at any time).",
            "To improve our website, products, and services based on usage patterns and feedback.",
            "To comply with legal obligations and protect against fraudulent or illegal activity.",
        ],
    },
    {
        title: "4. Sharing of Information",
        content: [
            "We do not sell, trade, or rent your personal data to third parties.",
            "We may share your information with trusted service providers (e.g., shipping partners, payment processors) solely to facilitate our services.",
            "We may disclose information if required by law or if we believe in good faith that such action is necessary to comply with legal obligations or protect our rights.",
        ],
    },
    {
        title: "5. Cookies & Tracking",
        content: [
            "We use cookies and similar tracking technologies to enhance your experience. Cookies help us remember your preferences, keep you logged in, and understand how visitors use our site.",
            "You can control cookie settings through your browser preferences. Disabling cookies may affect certain features of our website.",
        ],
    },
    {
        title: "6. Data Security",
        content: [
            "We implement industry-standard security measures including SSL encryption to protect your personal information.",
            "While we strive to use commercially acceptable means to protect your data, no method of transmission over the internet is 100% secure. We cannot guarantee absolute security.",
        ],
    },
    {
        title: "7. Your Rights",
        content: [
            "You have the right to access, correct, or delete your personal information at any time by contacting us.",
            "You may opt out of marketing communications by clicking the unsubscribe link in any email we send or by contacting us directly.",
            "For residents of applicable jurisdictions, you may have additional rights under data protection laws (e.g., GDPR, PDPB).",
        ],
    },
    {
        title: "8. Contact Us",
        content: [
            "If you have any questions about this Privacy Policy, please contact us at: Altus Pharma, 13/223 B,C, Sukapuram Complex, Near Chambaramanam Temple, Naduvattom, Sugapuram Po, Edappal, Kerala 679576.",
            "Email: contact@altuspharma.in | Phone: +91 88488 15296",
        ],
    },
];

function AccordionItem({ title, content }: Section) {
    const [open, setOpen] = useState(false);
    return (
        <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm mb-3">
            <button
                className="w-full flex items-center justify-between px-6 py-4 bg-white hover:bg-gray-50 transition-colors text-left group"
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

const PrivacyPolicy = () => {
    const breadcrumbItems = [
        { label: "Home", href: "/" },
        { label: "Privacy Policy" },
    ];

    return (
        <div className="min-h-screen flex flex-col">
            <AnnouncementBar />
            <Header />

            <BlogHero title="Privacy Policy" subtitle="Last updated: February 2025" breadcrumbItems={breadcrumbItems} />

            <section className="bg-white py-12 md:py-20">
                <div className="container mx-auto px-4 md:px-6 lg:px-24 max-w-4xl">
                    {/* Intro Banner */}
                    <div className="bg-gradient-to-r from-brand-blue to-[#1a2a6c] rounded-2xl p-6 md:p-8 mb-10 text-white">
                        <h2 className="text-lg md:text-xl font-bold mb-2">Your Privacy Matters to Us</h2>
                        <p className="text-white/80 text-sm md:text-base leading-relaxed">
                            At CureMist (Altus Pharma), we handle your personal data with the highest level of care and
                            transparency. Please read this policy carefully to understand our practices.
                        </p>
                    </div>

                    {/* Accordion Sections */}
                    <div>
                        {sections.map((s) => (
                            <AccordionItem key={s.title} {...s} />
                        ))}
                    </div>

                    <p className="text-xs text-gray-400 text-center mt-10">
                        This policy is subject to change. We will notify you of significant updates via email or a notice on our website.
                    </p>
                </div>
            </section>

            <Footer />
            <WhatsAppButton />
        </div>
    );
};

export default PrivacyPolicy;
