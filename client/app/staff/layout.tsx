"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  Coffee,
  LogOut,
  Settings,
  Package,
  Users,
  Home,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface StaffData {
  staff_id: string;
  name: string;
  email: string;
  assigned_machines: any[];
  role: string;
}

export default function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const [staffData, setStaffData] = useState<StaffData | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    // Only check once per session and skip re-checks on login page
    if (authChecked || pathname === "/staff/login") {
      setIsLoading(false);
      return;
    }

    // Check if the staff is authenticated
    const checkAuth = async () => {
      // Skip auth check for login page
      if (pathname === "/staff/login") {
        setIsLoading(false);
        return;
      }

      // Check localStorage for token and staff data
      const token = localStorage.getItem("staffToken");
      const storedStaffData = localStorage.getItem("staffData");

      if (!token || !storedStaffData) {
        // Redirect to login page if not authenticated
        router.push("/staff/login");
        return;
      }

      try {
        // Parse stored staff data
        const parsedStaffData = JSON.parse(storedStaffData);
        setStaffData(parsedStaffData);
        setAuthChecked(true);
        setIsLoading(false);
      } catch (error) {
        console.error("Error parsing staff data:", error);
        // Clear invalid data and redirect to login
        localStorage.removeItem("staffToken");
        localStorage.removeItem("staffData");
        router.push("/staff/login");
      }
    };

    checkAuth();
  }, [pathname, router, authChecked]);

  const handleLogout = () => {
    // Clear staff data from localStorage
    localStorage.removeItem("staffToken");
    localStorage.removeItem("staffData");

    // Redirect to login page
    router.push("/staff/login");
  };

  // Show loading state
  if (isLoading && pathname !== "/staff/login") {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="relative w-12 h-12">
            <div className="absolute w-12 h-12 rounded-full border-2 border-amber-500/20"></div>
            <div className="absolute w-12 h-12 rounded-full border-t-2 border-amber-500 animate-spin"></div>
          </div>
          <p className="mt-4 text-amber-500 text-sm">Loading staff portal...</p>
        </div>
      </div>
    );
  }

  // Don't show the navbar on the login page
  if (pathname === "/staff/login") {
    return <>{children}</>;
  }

  const navigation = [
    {
      name: "Dashboard",
      href: "/staff/dashboard",
      icon: Home,
      current: pathname === "/staff/dashboard",
    },
    {
      name: "Machine Inventory",
      href: "/staff/inventory",
      icon: Package,
      current: pathname === "/staff/inventory",
    },
    {
      name: "Maintenance",
      href: "/staff/maintenance",
      icon: Wrench,
      current: pathname === "/staff/maintenance",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex">
      {/* Sidebar */}
      <div className="w-64 bg-[#121212] border-r border-gray-800 flex flex-col">
        {/* Logo/Header */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center">
            <Coffee size={24} className="text-amber-500 mr-3" />
            <div>
              <h1 className="text-lg font-bold text-white">Staff Portal</h1>
              <p className="text-xs text-gray-400">Maintenance & Inventory</p>
            </div>
          </div>
        </div>

        {/* Staff Info */}
        {staffData && (
          <div className="p-4 border-b border-gray-800">
            <div className="flex items-center mb-2">
              <div className="w-8 h-8 bg-amber-500/20 rounded-full flex items-center justify-center mr-3">
                <Users size={16} className="text-amber-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">
                  {staffData.name}
                </p>
                <p className="text-xs text-gray-400">{staffData.email}</p>
              </div>
            </div>
            <div className="text-xs text-gray-500">
              {staffData.assigned_machines?.length || 0} machines assigned
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                item.current
                  ? "bg-amber-600/20 text-amber-400 border border-amber-600/30"
                  : "text-gray-300 hover:bg-[#1A1A1A] hover:text-amber-500"
              }`}
            >
              <item.icon size={18} className="mr-3" />
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-800">
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full text-gray-300 border-gray-700 hover:bg-red-600/20 hover:border-red-600/30 hover:text-red-400"
          >
            <LogOut size={16} className="mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
