"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { authService } from "@/lib/api/services";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);

  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    // Only check once per session and skip re-checks on auth page
    if (authChecked || pathname === "/dashboard/auth") {
      setIsLoading(false);
      return;
    }

    // Check if the user is authenticated
    const checkAuth = async () => {
      // Skip auth check for auth page
      if (pathname === "/dashboard/auth") {
        setIsLoading(false);
        return;
      }

      // Check localStorage for token and user data
      localStorage.getItem("token");
      localStorage.getItem("user");

      const isAuthenticated = authService.isAuthenticated();

      if (!isAuthenticated) {
        // Redirect to auth page if not authenticated
        router.push("/dashboard/auth");
      } else {
        // Verify token is valid by getting the profile
        try {
          // Only attempt to verify the token if it exists
          const token = localStorage.getItem("token");

          if (token) {
            const result = await authService.getProfile();

            if (result.success) {
              setAuthChecked(true);
              setIsLoading(false);
            } else {
              throw new Error("Invalid profile response");
            }
          } else {
            // No token found, redirect to auth
            authService.logout();
            router.push("/dashboard/auth");
          }
        } catch (_) {
          // Token is invalid, clear it and redirect to auth
          authService.logout();
          router.push("/dashboard/auth");
        }
      }
    };

    checkAuth();
  }, [pathname, router, authChecked]);

  // Show loading state
  if (isLoading && pathname !== "/dashboard/auth") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F4EBDE] to-[#DAB49D] flex items-center justify-center relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-[#F4EBDE] to-[#DAB49D] opacity-90"></div>

          {/* Coffee bean pattern */}
          <div className="absolute inset-0">
            {[...Array(20)].map((_, i) => (
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
                  width: Math.random() * 60 + 20 + "px",
                  height: Math.random() * 40 + 10 + "px",
                  top: Math.random() * 100 + "%",
                  left: Math.random() * 100 + "%",
                }}
              ></motion.div>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex flex-col items-center">
          <div className="relative w-16 h-16 mb-6">
            <motion.div
              className="absolute w-16 h-16 rounded-full border-2 border-[#C28654]/30"
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="absolute w-16 h-16 rounded-full border-t-2 border-[#5F3023]"
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            />
            <div className="absolute inset-4 rounded-full bg-[#C28654]/20 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-[#5F3023]"></div>
            </div>
          </div>
          <motion.p
            className="text-[#5F3023] text-lg font-medium"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Loading dashboard...
          </motion.p>
          <p className="text-[#8A5738]/70 text-sm mt-1">Please wait</p>
        </div>
      </div>
    );
  }

  // Don't show the navbar on the auth page
  if (pathname === "/dashboard/auth") {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4EBDE] to-[#DAB49D] flex flex-col relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#F4EBDE] to-[#DAB49D] opacity-90"></div>

        {/* Coffee bean pattern */}
        <div className="absolute inset-0 opacity-30">
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-[#C28654]/10"
              initial={{ opacity: 0.1, scale: 0.8 }}
              animate={{
                opacity: [0.1, 0.2, 0.1],
                scale: [0.8, 1, 0.8],
                rotate: [0, 10, 0],
              }}
              transition={{
                duration: Math.random() * 12 + 8,
                repeat: Infinity,
                ease: "easeInOut",
                delay: Math.random() * 5,
              }}
              style={{
                width: Math.random() * 80 + 30 + "px",
                height: Math.random() * 50 + 15 + "px",
                top: Math.random() * 100 + "%",
                left: Math.random() * 100 + "%",
              }}
            ></motion.div>
          ))}
        </div>

        {/* Swirling coffee elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute w-[600px] h-[600px] rounded-full border-[10px] border-[#8A5738]/10 -top-[300px] -right-[300px]"></div>
          <div className="absolute w-[800px] h-[800px] rounded-full border-[15px] border-[#C28654]/10 -bottom-[400px] -left-[400px]"></div>
        </div>
      </div>

      <main className="relative z-10 flex-1">{children}</main>
    </div>
  );
}
