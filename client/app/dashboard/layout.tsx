"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
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
      const tokenFromStorage = localStorage.getItem('token');
      const userFromStorage = localStorage.getItem('user');
      
      const isAuthenticated = authService.isAuthenticated();
      
      if (!isAuthenticated) {
        // Redirect to auth page if not authenticated
        router.push("/dashboard/auth");
      } else {
        // Verify token is valid by getting the profile
        try {
          // Only attempt to verify the token if it exists
          const token = localStorage.getItem('token');
          
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
        } catch (error) {
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
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="relative w-12 h-12">
            <div className="absolute w-12 h-12 rounded-full border-2 border-amber-500/20"></div>
            <div className="absolute w-12 h-12 rounded-full border-t-2 border-amber-500 animate-spin"></div>
          </div>
          <p className="mt-4 text-amber-500 text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Don't show the navbar on the auth page
  if (pathname === "/dashboard/auth") {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">{children}</main>
    </div>
  );
} 