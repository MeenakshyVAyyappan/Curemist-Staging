import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { supabase, getAuthRedirectUrl } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { FiEye, FiEyeOff } from "react-icons/fi";
// import ReCAPTCHA from "react-google-recaptcha";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  // const recaptchaRef = React.useRef<ReCAPTCHA>(null);
  // const resetRecaptchaRef = React.useRef<ReCAPTCHA>(null);

  // Reset Password State
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);

  const [googleLoading, setGoogleLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // if (!captchaToken) {
    //   toast({
    //     title: "Captcha Required",
    //     description: "Please complete the captcha verification.",
    //     variant: "destructive",
    //   });
    //   return;
    // }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: "Login Failed",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      const session =
        data?.session ||
        (await supabase.auth.getSession()).data?.session;

      if (!session) {
        toast({
          title: "Login Failed",
          description: "Unable to confirm your login. Please try again.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Logged in successfully!",
      });

      const from = (location.state as any)?.from?.pathname;
      const redirectTo = from && from !== "/login" ? from : "/";

      navigate(redirectTo, { replace: true, state: null });
    } catch (err: any) {
      console.error("Login error:", err);
      toast({
        title: "Connection Error",
        description:
          "Unable to connect to the server. Please check your internet connection and try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (googleLoading) return;
    setGoogleLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: getAuthRedirectUrl() },
      });

      if (error) {
        toast({ title: "Google Sign-In Failed", description: error.message, variant: "destructive" });
        setGoogleLoading(false);
        return;
      }

      // If Supabase returns a URL (older client versions), navigate there.
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      console.error("Google sign-in error:", err);
      toast({ title: "Error", description: "Unable to start Google Sign-In.", variant: "destructive" });
      setGoogleLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) {
      toast({
        title: "Error",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }

    // if (!captchaToken) {
    //   toast({
    //     title: "Captcha Required",
    //     description: "Please complete the captcha verification.",
    //     variant: "destructive",
    //   });
    //   return;
    // }

    console.log("Attempting to reset password for:", resetEmail);
    setResetLoading(true);
    const { data, error } = await supabase.auth.resetPasswordForEmail(
      resetEmail,
      {
        redirectTo: `${getAuthRedirectUrl()}/reset-password`,
      },
    );
    console.log("Reset password result:", { data, error });
    setResetLoading(false);

    if (error) {
      console.error("Reset password error:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Password Reset Email Sent! 📧",
        description: `We've sent a password reset link to ${resetEmail}. Please check your inbox and spam folder.`,
      });
      setResetOpen(false);
      setResetEmail("");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-[10px] pb-10 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex justify-between items-center mb-2">
            <button
              onClick={() => navigate("/")}
              className="text-sm text-[#252c74] hover:text-brand-blue font-bold flex items-center gap-1"
            >
                            ← Back to Website
            </button>
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            Login
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex justify-center">
            <Button 
              variant="outline" 
              className="w-full max-w-xs bg-[#efb506] border-none hover:bg-[#efb506]/90 flex items-center justify-center gap-2" 
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
            >
              {googleLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  <span>Loading...</span>
                </div>
              ) : (
                <>
                  <img src="/icons/google.png" alt="Google" className="h-5 w-5" />
                  Continue with Google
                </>
              )}
            </Button>
          </div>

          <div className="relative my-6 flex items-center justify-center">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="flex-shrink-0 px-3 text-xs font-medium text-gray-400 uppercase">Or</span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <CardDescription className="text-center">
            Enter your email and password to access your account
          </CardDescription>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password">Password</Label>
                <Dialog open={resetOpen} onOpenChange={setResetOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="link"
                      className="px-0 h-auto font-normal text-xs text-brand-blue"
                    >
                      Forgot password?
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Reset Password</DialogTitle>
                      <DialogDescription>
                        Enter your email address and we'll send you a link to
                        reset your password.
                      </DialogDescription>
                    </DialogHeader>
                    <form
                      onSubmit={handleResetPassword}
                      className="space-y-4 py-4"
                    >
                      <div className="space-y-2">
                        <Label htmlFor="reset-email">Email</Label>
                        <Input
                          id="reset-email"
                          type="email"
                          placeholder="name@example.com"
                          value={resetEmail}
                          onChange={(e) => setResetEmail(e.target.value)}
                          required
                        />
                      </div>
                      {/* <div className="flex justify-center py-2">
                        <ReCAPTCHA
                          ref={resetRecaptchaRef}
                          sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
                          onChange={(token) => setCaptchaToken(token)}
                        />
                      </div> */}
                      <DialogFooter>
                        <Button type="submit" disabled={resetLoading}>
                          {resetLoading ? "Sending..." : "Send Reset Link"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </button>
              </div>
            </div>
            {/* <div className="flex justify-center py-2">
              <ReCAPTCHA
                ref={recaptchaRef}
                sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
                onChange={(token) => setCaptchaToken(token)}
              />
            </div> */}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>
          <div className="relative my-6 flex items-center justify-center">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="flex-shrink-0 px-3 text-xs font-medium text-gray-400 uppercase">Or</span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>
         <a
  href="https://wa.me/918848815296"
  target="_blank"
  rel="noreferrer"
  className="flex items-center justify-center gap-2 bg-[#25D366] text-white py-2 px-4 rounded-md shadow-md transition-all duration-300 hover:bg-[#1ebe5d]"
>
  <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="white"
      xmlns="http://www.w3.org/2000/svg"
      className="flex-shrink-0"
    >
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.35 3.45 16.84L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2ZM12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19.02L7.55 18.85L4.43 19.65L5.25 16.61L5.06 16.29C4.24 14.98 3.8 13.47 3.8 11.91C3.81 7.37 7.5 3.67 12.05 3.67ZM8.53 7.33C8.37 7.33 8.1 7.39 7.87 7.64C7.65 7.89 7 8.5 7 9.71C7 10.93 7.89 12.1 8 12.27C8.14 12.44 9.76 14.94 12.25 16C12.84 16.27 13.3 16.42 13.66 16.53C14.25 16.72 14.79 16.69 15.22 16.63C15.7 16.56 16.68 16.03 16.89 15.45C17.1 14.87 17.1 14.38 17.04 14.27C16.97 14.17 16.81 14.11 16.56 13.98C16.31 13.86 15.09 13.26 14.87 13.18C14.64 13.1 14.5 13.06 14.31 13.31C14.15 13.56 13.67 14.11 13.53 14.27C13.38 14.44 13.24 14.46 13 14.34C12.74 14.21 11.94 13.95 11 13.11C10.26 12.45 9.77 11.64 9.62 11.39C9.48 11.14 9.61 11 9.73 10.87C9.84 10.76 10 10.57 10.1 10.43C10.23 10.28 10.27 10.18 10.35 10.01C10.43 9.84 10.39 9.7 10.33 9.57C10.27 9.44 9.77 8.21 9.56 7.72C9.36 7.23 9.15 7.29 9 7.28C8.86 7.27 8.7 7.26 8.53 7.26V7.33Z" />
    </svg>

  <span>Order via WhatsApp</span>
</a>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-brand-blue hover:underline font-semibold"
            >
              Register
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
