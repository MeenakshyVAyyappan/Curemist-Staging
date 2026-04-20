import React, { useState } from "react";
import AnnouncementBar from "@/components/AnnouncementBar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BlogHero from "@/components/BlogHero";
import { useToast } from "@/components/ui/use-toast";
import {
  MapPin,
  Phone,
  Mail,
  Send,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import ReCAPTCHA from "react-google-recaptcha";


/* ─── Types ─── */
interface FormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}
interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  subject?: string;
  message?: string;
}

/* ─── Validation ─── */
function validate(data: FormData): FormErrors {
  const errors: FormErrors = {};
  if (!data.name.trim()) errors.name = "Full name is required.";
  if (!data.email.trim()) {
    errors.email = "Email address is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = "Please enter a valid email address.";
  }
  if (!data.phone.trim()) {
    errors.phone = "Phone number is required.";
  } else if (!/^\d{10}$/.test(data.phone.trim())) {
    errors.phone = "Phone number must be exactly 10 digits.";
  }
  if (!data.subject.trim()) errors.subject = "Subject is required.";
  if (!data.message.trim()) errors.message = "Message is required.";
  return errors;
}

/* ─── Contact Info Card ─── */
interface InfoCardProps {
  icon: React.ReactNode;
  label: string;
  lines: { text: string; href?: string }[];
}
function InfoCard({ icon, label, lines }: InfoCardProps) {
  return (
    <div className="group flex flex-row md:flex-col items-center md:text-center gap-4 md:gap-0 p-4 md:p-8 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-full bg-brand-blue text-brand-yellow md:mb-4 group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <div className="flex flex-col text-left md:text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">
          {label}
        </p>
        {lines.map((line, i) =>
          line.href ? (
            <a
              key={i}
              href={line.href}
              className="text-brand-blue font-semibold text-sm md:text-base hover:text-brand-yellow transition-colors leading-relaxed"
            >
              {line.text}
            </a>
          ) : (
            <p
              key={i}
              className="text-brand-blue font-semibold text-sm md:text-base leading-relaxed"
            >
              {line.text}
            </p>
          ),
        )}
      </div>
    </div>
  );
}

/* ─── Input Component ─── */
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}
function Input({ error, className = "", ...props }: InputProps) {
  return (
    <div className="w-full">
      <input
        {...props}
        className={`w-full px-4 py-3.5 rounded-xl border text-base font-medium outline-none transition-all duration-200 bg-white
          ${error
            ? "border-red-400 focus:ring-2 focus:ring-red-200"
            : "border-gray-200 focus:border-brand-blue focus:ring-2 focus:ring-blue-100"
          } ${className}`}
      />
      {error && (
        <p className="flex items-center gap-1 mt-1 text-xs text-red-500 font-medium">
          <AlertCircle size={12} /> {error}
        </p>
      )}
    </div>
  );
}

/* ─── Textarea Component ─── */
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}
function Textarea({ error, className = "", ...props }: TextareaProps) {
  return (
    <div className="w-full">
      <textarea
        {...props}
        className={`w-full px-4 py-3.5 rounded-xl border text-base font-medium outline-none transition-all duration-200 bg-white resize-none
          ${error
            ? "border-red-400 focus:ring-2 focus:ring-red-200"
            : "border-gray-200 focus:border-brand-blue focus:ring-2 focus:ring-blue-100"
          } ${className}`}
      />
      {error && (
        <p className="flex items-center gap-1 mt-1 text-xs text-red-500 font-medium">
          <AlertCircle size={12} /> {error}
        </p>
      )}
    </div>
  );
}

/* ─── Page ─── */
const ContactUs = () => {
  const { toast } = useToast();
  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Contact Us" },
  ];

  const [form, setForm] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const recaptchaRef = React.useRef<ReCAPTCHA>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear individual field error on change
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validate(form);
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (!captchaToken) {
      toast({
        title: "Captcha Required",
        description: "Please complete the captcha verification.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    // Send the form to the server which will forward via Resend
    (async () => {
      try {
        const resp = await fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...form, captchaToken }),
        });

        if (!resp.ok) {
          const json = await resp.json().catch(() => ({}));
          throw new Error(json?.error || "Failed to send message");
        }

        setSubmitted(true);
        setForm({ name: "", email: "", phone: "", subject: "", message: "" });
        setErrors({});
        toast({
          title: "Message Sent!",
          description: "Thank you for reaching out. We'll get back to you within 24 hours.",
        });
        setTimeout(() => setSubmitted(false), 4000);
      } catch (err: any) {
        toast({ title: "Send failed", description: err?.message || "Unable to send message", variant: "destructive" });
      } finally {
        setSubmitting(false);
      }
    })();
  };

  return (
    <div className="min-h-screen flex flex-col">
      <AnnouncementBar />
      <Header />

      <BlogHero title="Contact Us" breadcrumbItems={breadcrumbItems} />

      {/* ── Contact Info Cards ── */}
      <section className="bg-gray-50 py-8 md:py-16">
        <div className="container mx-auto px-4 md:px-6 lg:px-24">
          <div className="flex flex-col md:grid md:grid-cols-3 gap-4 md:gap-6">
            <InfoCard
              icon={<MapPin size={22} />}
              label="Our Address"
              lines={[
                { text: "13/223 B,C, Sukapuram Complex," },
                { text: "Near Chambaramanam Temple Naduvattom," },
                { text: "Sugapuram Po, Edappal, Kerala 679576" },
              ]}
            />
            <InfoCard
              icon={<Phone size={22} />}
              label="Phone Number"
              lines={[{ text: "+91 88488 15296", href: "tel:+918848815296" }]}
            />
            <InfoCard
              icon={<Mail size={22} />}
              label="Email Address"
              lines={[
                {
                  text: "contact@altuspharma.in",
                  href: "mailto:contact@altuspharma.in",
                },
              ]}
            />
          </div>
        </div>
      </section>

      {/* ── Map + Form ── */}
      <section className="bg-white py-10 md:py-20">
        <div className="container mx-auto px-4 md:px-6 lg:px-24">
          <div className="text-center mb-8 md:mb-14">
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest bg-brand-yellow/20 text-brand-blue mb-3">
              Get In Touch
            </span>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-brand-blue">
              We'd Love to Hear From You
            </h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto text-sm md:text-base">
              Have a question, feedback, or need support? Fill out the form
              below and our team will respond within 24 hours.
            </p>
          </div>

          {/* On mobile: form first, map second. On desktop: side-by-side (map left, form right) */}
          <div className="flex flex-col lg:grid lg:grid-cols-2 gap-8 lg:gap-16 items-start">

            {/* Contact Form — order-1 on mobile (appears first) */}
            <div className="order-1 lg:order-2 bg-gray-50 rounded-2xl p-5 sm:p-8 md:p-10 shadow-sm border border-gray-100">
              {submitted ? (
                <div className="flex flex-col items-center justify-center py-10 gap-4 text-center">
                  <CheckCircle2 className="w-16 h-16 text-green-500" />
                  <h3 className="text-xl font-bold text-brand-blue">
                    Message Sent!
                  </h3>
                  <p className="text-gray-500 text-sm">
                    Thank you for contacting us. We'll get back to you shortly.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate className="space-y-4">
                  {/* Row 1: Name + Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                        Full Name <span className="text-red-400">*</span>
                      </label>
                      <Input
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="John Doe"
                        autoComplete="name"
                        error={errors.name}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                        Email Address <span className="text-red-400">*</span>
                      </label>
                      <Input
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="john@example.com"
                        autoComplete="email"
                        error={errors.email}
                      />
                    </div>
                  </div>

                  {/* Row 2: Phone + Subject */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                        Phone Number <span className="text-red-400">*</span>
                      </label>
                      <Input
                        name="phone"
                        type="tel"
                        inputMode="numeric"
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="10-digit mobile number"
                        maxLength={10}
                        autoComplete="tel"
                        error={errors.phone}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                        Subject <span className="text-red-400">*</span>
                      </label>
                      <Input
                        name="subject"
                        value={form.subject}
                        onChange={handleChange}
                        placeholder="How can we help?"
                        error={errors.subject}
                      />
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                      Message <span className="text-red-400">*</span>
                    </label>
                    <Textarea
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      placeholder="Tell us more about your query..."
                      rows={4}
                      error={errors.message}
                    />
                  </div>

                  {/* ReCAPTCHA — scale down on xs screens to prevent horizontal overflow */}
                  <div className="flex justify-center py-1 overflow-hidden">
                    <div className="scale-[0.82] sm:scale-100 origin-top">
                      <ReCAPTCHA
                        ref={recaptchaRef}
                        sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
                        onChange={(token) => setCaptchaToken(token)}
                      />
                    </div>
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full flex items-center justify-center gap-2 bg-brand-blue text-white font-bold text-base py-4 px-6 rounded-xl hover:bg-brand-blue/90 active:scale-[0.98] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed mb-4"
                  >
                    {submitting ? (
                      <>
                        <svg
                          className="animate-spin w-4 h-4"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v4l3-3-3-3V4a10 10 0 100 20v-4l-3 3 3 3v-4a8 8 0 01-8-8z"
                          />
                        </svg>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send size={16} /> Send Message
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Google Map — order-2 on mobile (appears below form) */}
            <div className="order-2 lg:order-1 rounded-2xl overflow-hidden shadow-md border border-gray-100 w-full" style={{ minHeight: '260px' }}>
              <iframe
                title="Altus Pharma Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3913.3869823737354!2d76.0077!3d11.0145!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba64a6e0e6e3c61%3A0x5b3e4e3b3c3b3c3b!2sEdappal%2C%20Kerala%20679576!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: '260px' }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ContactUs;
