import React, { useState } from "react";
import AnnouncementBar from "@/components/AnnouncementBar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BlogHero from "@/components/BlogHero";
import { ChevronDown } from "lucide-react";

interface Section {
  title: string;
  content: string[];
}

const sections: Section[] = [
  {
    title: "1. Shipping and Dispatch",
    content: [
      "All orders placed on working days will be shipped within 48 hours from the time the order is placed.",
      "Orders placed on holidays will be processed on the next working day.",
    ],
  },
  {
    title: "2. Return & Exchange Guidelines",
    content: [
      "To initiate a return or exchange, please note that requests must be raised within 7 days from the date of delivery.",
      "You may send your return request over email to Contact@altuspharma.in or via WhatsApp at +918848815296.",
      "Once your return request is accepted, we will provide you with detailed instructions for the return process via phone call, WhatsApp, or email.",
    ],
  },
  {
    title: "3. Shipping Charges for Returns",
    content: [
      "For returns, shipping charges will be deducted from the refund amount, starting from the actual cost of shipping and onwards.",
      "However, if the product was defective or damaged during transit, we will not deduct any shipping charges.",
    ],
  },
  {
    title: "4. Exchange Process",
    content: [
      "If you wish to exchange an item, we will pick up the existing order and issue a refund. You may place a new order at your convenience.",
    ],
  },
  {
    title: "5. Refund Processing Time",
    content: [
      "Refunds will be initiated within 48 hours for prepaid orders and 7 days for cash on delivery (COD) orders once we receive the product back at our facility.",
    ],
  },
  {
    title: "6. Order Cancellations",
    content: [
      "If you need to cancel an order, please do so before it is dispatched.",
      "If the order has already been shipped, shipping charges will be deducted from your refund.",
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
        <span className="text-brand-blue font-bold text-sm md:text-base">
          {title}
        </span>
        <ChevronDown
          size={18}
          className={`text-brand-blue flex-shrink-0 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="px-6 pb-5 pt-1 bg-white border-t border-gray-100">
          {content.map((para, i) => (
            <p
              key={i}
              className="text-gray-600 text-sm md:text-base leading-relaxed mb-3 last:mb-0"
            >
              {para}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

const ReturnPolicy = () => {
  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Return Policy" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <AnnouncementBar />
      <Header />

      <BlogHero
        title="Return & Refund Policy"
        subtitle="Our guidelines for returns, exchanges, and cancellations."
        breadcrumbItems={breadcrumbItems}
      />

      <section className="bg-white py-12 md:py-20">
        <div className="container mx-auto px-4 md:px-6 lg:px-24 max-w-4xl">
          {/* Intro Banner */}
          <div className="bg-gradient-to-r from-brand-blue to-[#1a2a6c] rounded-2xl p-6 md:p-8 mb-10 text-white">
            <h2 className="text-lg md:text-xl font-bold mb-2">
              Our Commitment
            </h2>
            <p className="text-white/80 text-sm md:text-base leading-relaxed">
              We aim to make your experience smooth and hassle-free. Please review our return and refund guidelines below to understand the process.
            </p>
          </div>

          {/* Accordion Sections */}
          <div>
            {sections.map((s) => (
              <AccordionItem key={s.title} {...s} />
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ReturnPolicy;
