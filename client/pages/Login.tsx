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
  // const [captchaToken, setCaptchaToken] = useState<string | null>(null);
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-[110px] pb-10 px-4">
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
