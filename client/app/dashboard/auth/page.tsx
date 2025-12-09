"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertCircle,
  Coffee,
  Loader2,
  Lock,
  ChevronLeft,
  UserPlus,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { motion } from "framer-motion";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { authService } from "@/lib/api/services";

export default function DashboardAuthPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  // Login form state
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });

  // Signup form state
  const [signupForm, setSignupForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    age_group: "adult", // default value
  });

  useEffect(() => {
    setIsMounted(true);

    // Check if we're already logged in and redirect to dashboard if that's the case
    if (authService.isAuthenticated()) {
      const currentPath = window.location.pathname;
      // Only redirect if we're on the auth page and a token exists
      if (currentPath === "/dashboard/auth") {
        router.push("/dashboard");
      }
    }
  }, [router]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Use the authService for login
      const response = await authService.login({
        email: loginForm.email,
        password: loginForm.password,
      });

      if (!response.success) {
        throw new Error(response.message || "Login failed");
      }

      // Type assertion to match actual API response structure
      const authResponse = response as unknown as {
        success: boolean;
        token: string;
        user: {
          id: string;
          name: string;
          email: string;
          role: string;
        };
        message?: string;
      };

      // Store token and user data in localStorage
      localStorage.setItem("token", authResponse.token);
      localStorage.setItem("user", JSON.stringify(authResponse.user));

      // Force a small delay to ensure localStorage is updated
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Use direct page navigation instead of Next.js router for a complete page reload
      window.location.href = "/dashboard";
    } catch (err: unknown) {
      console.error("Login error:", err);
      const error = err as {
        response?: {
          status?: number;
          data?: { message?: string; error?: string };
        };
        message?: string;
      };

      // Handle common error cases with user-friendly messages
      if (error.response?.status === 401) {
        setError("Invalid email or password. Please check your credentials.");
      } else if (error.message) {
        // Show a user-friendly message instead of the technical error
        setError("Login failed. Please check your email and password.");
      } else {
        setError("Authentication failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (signupForm.password !== signupForm.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Additional client-side validation
    if (signupForm.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Use the authService for registration
      const response = await authService.register({
        name: signupForm.name,
        email: signupForm.email,
        password: signupForm.password,
        age_group: signupForm.age_group,
        role: "admin", // Default to admin for dashboard
      });

      if (!response.success) {
        throw new Error(response.message || "Registration failed");
      }

      // Type assertion to match actual API response structure
      const authResponse = response as unknown as {
        success: boolean;
        token: string;
        user: {
          id: string;
          name: string;
          email: string;
          role: string;
        };
        message?: string;
      };

      // Store token and user data in localStorage
      localStorage.setItem("token", authResponse.token);
      localStorage.setItem("user", JSON.stringify(authResponse.user));

      // Force a small delay to ensure localStorage is updated
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Use direct page navigation instead of Next.js router for a complete page reload
      window.location.href = "/dashboard";
    } catch (err: unknown) {
      console.error("Signup error:", err);

      const error = err as {
        response?: {
          status?: number;
          data?: { message?: string; error?: string };
        };
        message?: string;
      };

      // Handle common error cases with user-friendly messages
      if (
        error.response?.status === 400 &&
        error.response?.data?.message?.includes("exists")
      ) {
        setError(
          "This email is already registered. Please use a different email or login instead."
        );
      } else if (
        error.response?.data?.error?.includes("password") &&
        error.response?.data?.error?.includes("shorter")
      ) {
        setError("Password must be at least 6 characters long.");
      } else if (
        error.response?.data?.error?.includes("email") &&
        error.response?.data?.error?.includes("valid")
      ) {
        setError("Please enter a valid email address.");
      } else if (error.message) {
        // Show a user-friendly message instead of the technical error
        setError(
          "Registration failed. Please check your information and try again."
        );
      } else {
        setError("Registration failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const updateLoginForm = (field: string, value: string) => {
    setLoginForm((prev) => ({ ...prev, [field]: value }));
  };

  const updateSignupForm = (field: string, value: string) => {
    setSignupForm((prev) => ({ ...prev, [field]: value }));
  };

  // Only render animations after component has mounted on the client
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F4EBDE] to-[#DAB49D] flex flex-col items-center justify-center">
        <div className="w-full max-w-md p-8">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-[#5F3023]">
              DASHBOARD <span className="text-[#C28654]">ACCESS</span>
            </h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4EBDE] to-[#DAB49D] flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-[#F4EBDE] to-[#DAB49D] opacity-90"></div>

        {/* Coffee bean pattern */}
        <div className="absolute inset-0">
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-[#C28654]/10"
              initial={{ opacity: 0.1, scale: 0.8 }}
              animate={{
                opacity: [0.1, 0.3, 0.1],
                scale: [0.8, 1, 0.8],
                rotate: [0, 20, 0],
              }}
              transition={{
                duration: Math.random() * 8 + 4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: Math.random() * 5,
              }}
              style={{
                width: Math.random() * 40 + 10 + "px",
                height: Math.random() * 25 + 5 + "px",
                top: Math.random() * 100 + "%",
                left: Math.random() * 100 + "%",
              }}
            ></motion.div>
          ))}
        </div>

        {/* Swirling coffee elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute w-[600px] h-[600px] rounded-full border-[10px] border-[#8A5738]/10 -top-[300px] -right-[300px]"></div>
          <div className="absolute w-[400px] h-[400px] rounded-full border-[8px] border-[#C28654]/10 -bottom-[200px] -left-[200px]"></div>
        </div>

        <div className="absolute top-0 w-full h-32 bg-gradient-to-b from-[#F4EBDE] to-transparent"></div>
        <div className="absolute bottom-0 w-full h-32 bg-gradient-to-t from-[#F4EBDE] to-transparent"></div>
      </div>

      {/* Header - Back Link */}
      <Link href="/" className="absolute top-8 left-8 z-10">
        <motion.div
          whileHover={{ x: -3 }}
          className="flex items-center text-[#8A5738] hover:text-[#5F3023] transition-colors duration-300"
        >
          <ChevronLeft size={20} />
          <span className="ml-1 text-sm font-medium">Back to Home</span>
        </motion.div>
      </Link>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-md px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Title Section */}
          <div className="mb-8 text-center">
            <motion.div
              initial={{ scale: 0.9, rotate: -5 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                duration: 0.5,
                type: "spring",
                stiffness: 100,
              }}
              className="inline-flex mb-6 p-4 bg-gradient-to-br from-[#C28654]/20 to-[#8A5738]/10 rounded-full backdrop-blur-md border border-[#C28654]/30"
            >
              <Lock size={32} className="text-[#5F3023]" />
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-3xl font-bold text-[#5F3023] tracking-tight"
            >
              DASHBOARD <span className="text-[#C28654]">ACCESS</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="mt-2 text-[#8A5738]"
            >
              Login or create an account to continue
            </motion.p>
          </div>

          {/* Card Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <div className="bg-white/90 backdrop-blur-xl rounded-2xl overflow-hidden shadow-[0_20px_60px_-15px_rgba(194,134,84,0.3)] border border-[#C28654]/20">
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="border-b border-red-200/50"
                >
                  <Alert
                    variant="destructive"
                    className="rounded-none bg-red-50/80 border-0 text-red-700 backdrop-blur-sm"
                  >
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Authentication Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                </motion.div>
              )}

              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-1 bg-[#F4EBDE]/80 rounded-none border-b border-[#C28654]/20">
                  <TabsTrigger
                    value="login"
                    className="data-[state=active]:bg-[#C28654]/20 data-[state=active]:text-[#5F3023] text-[#8A5738] font-medium"
                  >
                    Login
                  </TabsTrigger>
                  {/* <TabsTrigger
                    value="signup"
                    className="data-[state=active]:bg-[#C28654]/20 data-[state=active]:text-[#5F3023] text-[#8A5738] font-medium"
                  >
                    Sign Up
                  </TabsTrigger> */}
                </TabsList>

                <TabsContent value="login" className="p-8">
                  <form onSubmit={handleLoginSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-[#5F3023]">
                        Email
                      </label>
                      <div className="relative">
                        <Input
                          type="email"
                          placeholder="Enter your email"
                          value={loginForm.email}
                          onChange={(e) =>
                            updateLoginForm("email", e.target.value)
                          }
                          className="bg-white/70 border-[#C28654]/30 focus:border-[#5F3023] focus:ring-[#C28654]/20 h-12 pl-12 text-[#5F3023] placeholder:text-[#8A5738]/60 backdrop-blur-sm"
                          required
                          disabled={isLoading}
                        />
                        <Coffee
                          size={18}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C28654]"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-[#5F3023]">
                        Password
                      </label>
                      <div className="relative">
                        <Input
                          type="password"
                          placeholder="Enter your password"
                          value={loginForm.password}
                          onChange={(e) =>
                            updateLoginForm("password", e.target.value)
                          }
                          className="bg-white/70 border-[#C28654]/30 focus:border-[#5F3023] focus:ring-[#C28654]/20 h-12 pl-12 text-[#5F3023] placeholder:text-[#8A5738]/60 backdrop-blur-sm"
                          required
                          disabled={isLoading}
                        />
                        <Lock
                          size={18}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C28654]"
                        />
                      </div>
                    </div>

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        type="submit"
                        className={`w-full h-12 text-base font-medium ${
                          isLoading
                            ? "bg-[#8A5738]/20 text-[#5F3023]/60"
                            : "bg-gradient-to-r from-[#8A5738] to-[#5F3023] hover:from-[#C28654] hover:to-[#8A5738] text-white shadow-lg hover:shadow-xl transition-all duration-300"
                        }`}
                        disabled={
                          isLoading || !loginForm.email || !loginForm.password
                        }
                      >
                        {isLoading ? (
                          <div className="flex items-center justify-center">
                            <Loader2 className="mr-2 h-5 w-5 animate-spin text-[#5F3023]/60" />
                            <span>Authenticating...</span>
                          </div>
                        ) : (
                          <span>Login</span>
                        )}
                      </Button>
                    </motion.div>
                  </form>
                </TabsContent>

                <TabsContent value="signup" className="p-8">
                  <form onSubmit={handleSignupSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300">
                        Full Name
                      </label>
                      <div className="relative">
                        <Input
                          type="text"
                          placeholder="Enter your full name"
                          value={signupForm.name}
                          onChange={(e) =>
                            updateSignupForm("name", e.target.value)
                          }
                          className="bg-[#1A1A1A] border-[#333] focus:border-amber-600/50 h-12 pl-12 text-white"
                          required
                          disabled={isLoading}
                        />
                        <UserPlus
                          size={18}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500/70"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300">
                        Email
                      </label>
                      <div className="relative">
                        <Input
                          type="email"
                          placeholder="Enter your email"
                          value={signupForm.email}
                          onChange={(e) =>
                            updateSignupForm("email", e.target.value)
                          }
                          className="bg-[#1A1A1A] border-[#333] focus:border-amber-600/50 h-12 pl-12 text-white"
                          required
                          disabled={isLoading}
                        />
                        <Coffee
                          size={18}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500/70"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300">
                        Password
                      </label>
                      <div className="relative">
                        <Input
                          type="password"
                          placeholder="Create a password"
                          value={signupForm.password}
                          onChange={(e) =>
                            updateSignupForm("password", e.target.value)
                          }
                          className="bg-[#1A1A1A] border-[#333] focus:border-amber-600/50 h-12 pl-12 text-white"
                          required
                          disabled={isLoading}
                        />
                        <Lock
                          size={18}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500/70"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <Input
                          type="password"
                          placeholder="Confirm your password"
                          value={signupForm.confirmPassword}
                          onChange={(e) =>
                            updateSignupForm("confirmPassword", e.target.value)
                          }
                          className="bg-[#1A1A1A] border-[#333] focus:border-amber-600/50 h-12 pl-12 text-white"
                          required
                          disabled={isLoading}
                        />
                        <Lock
                          size={18}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500/70"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300">
                        Age Group
                      </label>
                      <select
                        value={signupForm.age_group}
                        onChange={(e) =>
                          updateSignupForm("age_group", e.target.value)
                        }
                        className="w-full bg-[#1A1A1A] border border-[#333] focus:border-amber-600/50 h-12 px-4 text-white rounded-md"
                        disabled={isLoading}
                      >
                        <option value="adult">Adult (18+)</option>
                        <option value="senior">Senior (65+)</option>
                      </select>
                    </div>

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        type="submit"
                        className={`w-full h-12 text-base font-medium ${
                          isLoading
                            ? "bg-amber-800/20 text-amber-300/80"
                            : "bg-gradient-to-r from-amber-600 to-amber-800 hover:from-amber-500 hover:to-amber-700 text-white"
                        }`}
                        disabled={
                          isLoading ||
                          !signupForm.name ||
                          !signupForm.email ||
                          !signupForm.password ||
                          !signupForm.confirmPassword
                        }
                      >
                        {isLoading ? (
                          <div className="flex items-center justify-center">
                            <Loader2 className="mr-2 h-5 w-5 animate-spin text-amber-300/80" />
                            <span>Creating Account...</span>
                          </div>
                        ) : (
                          <span>Create Account</span>
                        )}
                      </Button>
                    </motion.div>
                  </form>
                </TabsContent>
              </Tabs>

              <div className="py-4 px-8 border-t border-[#C28654]/20 flex justify-center bg-[#F4EBDE]/50">
                <p className="text-xs text-[#8A5738]">
                  Contact{" "}
                  <span className="text-[#5F3023] hover:underline cursor-pointer font-medium">
                    support@frothfilter.com
                  </span>{" "}
                  for assistance
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Animated element at bottom */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
      >
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{
            duration: 4,
            repeat: Infinity,
            repeatType: "loop",
            ease: "easeInOut",
          }}
          className="flex items-center text-xs text-[#8A5738] tracking-widest"
        >
          <span className="h-px w-6 bg-gradient-to-r from-transparent to-[#C28654] mr-4"></span>
          ADMIN PORTAL
          <span className="h-px w-6 bg-gradient-to-l from-transparent to-[#C28654] ml-4"></span>
        </motion.div>
      </motion.div>
    </div>
  );
}
