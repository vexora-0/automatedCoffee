"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertCircle,
  Coffee,
  Loader2,
  ChevronLeft,
  Users,
  Phone,
  Mail,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { motion } from "framer-motion";
import Link from "next/link";

export default function StaffLoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  // Login form state
  const [loginForm, setLoginForm] = useState({
    email: "",
    mobile_number: "",
  });

  useEffect(() => {
    setIsMounted(true);

    // Check if staff is already logged in
    const staffToken = localStorage.getItem("staffToken");
    const staffData = localStorage.getItem("staffData");

    if (staffToken && staffData) {
      router.push("/staff/dashboard");
    }
  }, [router]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Call staff login API
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
        }/auth/staff-login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: loginForm.email,
            mobile_number: loginForm.mobile_number,
          }),
        }
      );

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Login failed");
      }

      // Store staff token and data
      localStorage.setItem("staffToken", data.token);
      localStorage.setItem("staffData", JSON.stringify(data.staff));

      // Force a small delay to ensure localStorage is updated
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Redirect to staff dashboard
      router.push("/staff/dashboard");
    } catch (err: unknown) {
      console.error("Staff login error:", err);
      const error = err as {
        message?: string;
      };

      setError(
        error.message ||
          "Login failed. Please check your credentials and try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const updateLoginForm = (field: string, value: string) => {
    setLoginForm((prev) => ({ ...prev, [field]: value }));
  };

  // Only render animations after component has mounted on the client
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-white">
              STAFF <span className="text-amber-500">LOGIN</span>
            </h2>
          </div>
        </div>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
      },
    },
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col relative overflow-hidden">
      {/* Background elements - Optimized for mobile */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0F0F0F] to-black opacity-80"></div>
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-amber-900/5"
              style={{
                width: Math.random() * 3 + 1 + "px",
                height: Math.random() * 3 + 1 + "px",
                top: Math.random() * 100 + "%",
                left: Math.random() * 100 + "%",
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: Math.random() * 2, duration: 1 }}
            />
          ))}
        </div>
        <div className="absolute top-0 w-full h-32 bg-gradient-to-b from-black to-transparent"></div>
        <div className="absolute bottom-0 w-full h-32 bg-gradient-to-t from-black to-transparent"></div>
      </div>

      {/* Header - Back Link */}
      <motion.div
        className="absolute top-4 left-4 z-10"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <Link href="/">
          <motion.div
            whileHover={{ x: -3 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center text-gray-400 hover:text-amber-500 transition-colors py-2 px-3 rounded-lg active:bg-gray-800/30"
          >
            <ChevronLeft size={20} />
            <span className="ml-1 text-sm">Back to Home</span>
          </motion.div>
        </Link>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-8 pt-20">
        <motion.div
          className="z-10 w-full max-w-md mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Title Section */}
          <motion.div variants={itemVariants} className="mb-8 text-center">
            <motion.div
              className="inline-flex mb-6 p-4 bg-gradient-to-br from-amber-600/30 to-amber-800/10 rounded-2xl"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Users size={36} className="text-amber-500" />
            </motion.div>
            <h2 className="text-3xl lg:text-4xl font-bold text-white tracking-tight mb-2">
              STAFF <span className="text-amber-500">LOGIN</span>
            </h2>
            <p className="text-gray-400 text-sm lg:text-base">
              Access your assigned machines and maintenance tools
            </p>
          </motion.div>

          {/* Card Section */}
          <motion.div
            variants={itemVariants}
            className="bg-[#141414] backdrop-blur-xl border border-gray-800 rounded-2xl lg:rounded-3xl shadow-2xl overflow-hidden"
          >
            {/* Error Alert */}
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="p-4 border-b border-gray-800"
              >
                <Alert className="bg-red-900/20 border-red-800">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle className="text-red-400">Error</AlertTitle>
                  <AlertDescription className="text-red-300">
                    {error}
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}

            <div className="p-6 lg:p-8">
              <form onSubmit={handleLoginSubmit} className="space-y-6">
                <motion.div className="space-y-2" variants={itemVariants}>
                  <label className="text-sm font-medium text-gray-300">
                    Email Address
                  </label>
                  <div className="relative">
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      value={loginForm.email}
                      onChange={(e) => updateLoginForm("email", e.target.value)}
                      className="bg-[#1A1A1A] border-[#333] focus:border-amber-600/50 h-14 pl-12 text-white text-base lg:text-sm rounded-xl transition-all duration-200 focus:ring-2 focus:ring-amber-600/20"
                      required
                      disabled={isLoading}
                    />
                    <Mail
                      size={20}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500/70"
                    />
                  </div>
                </motion.div>

                <motion.div className="space-y-2" variants={itemVariants}>
                  <label className="text-sm font-medium text-gray-300">
                    Mobile Number
                  </label>
                  <div className="relative">
                    <Input
                      type="tel"
                      placeholder="Enter your 10-digit mobile number"
                      value={loginForm.mobile_number}
                      onChange={(e) =>
                        updateLoginForm("mobile_number", e.target.value)
                      }
                      className="bg-[#1A1A1A] border-[#333] focus:border-amber-600/50 h-14 pl-12 text-white text-base lg:text-sm rounded-xl transition-all duration-200 focus:ring-2 focus:ring-amber-600/20"
                      required
                      disabled={isLoading}
                      maxLength={10}
                      pattern="[0-9]{10}"
                    />
                    <Phone
                      size={20}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500/70"
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    Use your registered mobile number as password
                  </p>
                </motion.div>

                <motion.div
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    type="submit"
                    className={`w-full h-14 text-base font-medium rounded-xl transition-all duration-200 ${
                      isLoading
                        ? "bg-amber-800/20 text-amber-300/80"
                        : "bg-gradient-to-r from-amber-600 to-amber-800 hover:from-amber-500 hover:to-amber-700 text-white shadow-lg hover:shadow-amber-500/25"
                    }`}
                    disabled={
                      isLoading || !loginForm.email || !loginForm.mobile_number
                    }
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                        >
                          <Loader2 className="mr-2 h-5 w-5" />
                        </motion.div>
                        <span>Authenticating...</span>
                      </div>
                    ) : (
                      <span>Login</span>
                    )}
                  </Button>
                </motion.div>
              </form>
            </div>
          </motion.div>

          {/* Footer */}
          <motion.div variants={itemVariants} className="mt-8 text-center">
            <p className="text-gray-500 text-sm">
              Need help? Contact your administrator
            </p>
          </motion.div>
        </motion.div>
      </div>

      {/* Safe area for mobile devices */}
      <div className="h-safe-area-inset-bottom"></div>
    </div>
  );
}
