import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://mpaysdxsmxqcivpsprlw.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wYXlzZHhzbXhxY2l2cHNwcmx3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg1NjM2MDIsImV4cCI6MjA4NDEzOTYwMn0.EWlABmiNMYese4iEKPZdS8DPodNVdWIX0OLfGe4cS9U";

// Get the redirect URL from env or derive it from current host.
// This avoids Supabase emails redirecting to an unexpected domain (for example cure-mist.vercel.app).
const getRedirectUrl = () => {
  const envRedirect =
    import.meta.env.VITE_SUPABASE_REDIRECT_URL ||
    import.meta.env.VITE_PUBLIC_SITE_URL;
  if (envRedirect) {
    return envRedirect;
  }

  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    const knownProductionHosts = [
      "curemist-website.vercel.app",
      "cure-mist.vercel.app",
      "www.curemist-website.vercel.app",
      "localhost",
      "127.0.0.1",
    ];

    if (knownProductionHosts.includes(host)) {
      return "https://curemist-website.vercel.app";
    }

    // For local development or unknown hosts dynamically use current origin.
    return window.location.origin;
  }

  return "https://curemist-website.vercel.app";
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

export const getAuthRedirectUrl = () => getRedirectUrl();
