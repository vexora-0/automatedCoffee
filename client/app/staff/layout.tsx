"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  Coffee,
  LogOut,
  Package,
  Users,
  Home,
  Wrench,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  const handleLogout = () => {
    // Clear staff data from localStorage
    localStorage.removeItem("staffToken");
    localStorage.removeItem("staffData");

    // Close mobile menu
    setIsMobileMenuOpen(false);

    // Redirect to login page
    router.push("/staff/login");
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Show loading state
  if (isLoading && pathname !== "/staff/login") {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <motion.div
            className="relative w-12 h-12"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="absolute w-12 h-12 rounded-full border-2 border-amber-500/20"></div>
            <motion.div
              className="absolute w-12 h-12 rounded-full border-t-2 border-amber-500"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          </motion.div>
          <motion.p
            className="mt-4 text-amber-500 text-sm"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            Loading staff portal...
          </motion.p>
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

  const sidebarVariants = {
    open: {
      x: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        duration: 0.3,
      },
    },
    closed: {
      x: "-100%",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        duration: 0.3,
      },
    },
  };

  const overlayVariants = {
    open: {
      opacity: 1,
      transition: { duration: 0.2 },
    },
    closed: {
      opacity: 0,
      transition: { duration: 0.2 },
    },
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex relative">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-[#121212] border-b border-gray-800 h-16 flex items-center justify-between px-4">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMobileMenu}
            className="text-white hover:bg-gray-800 mr-3 h-10 w-10"
          >
            <motion.div
              animate={{ rotate: isMobileMenuOpen ? 90 : 0 }}
              transition={{ duration: 0.2 }}
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </motion.div>
          </Button>
          <Coffee size={20} className="text-amber-500 mr-2" />
          <span className="text-sm font-bold text-white">Staff Portal</span>
        </div>

        {staffData && (
          <div className="flex items-center">
            <div className="w-8 h-8 bg-amber-500/20 rounded-full flex items-center justify-center">
              <Users size={14} className="text-amber-500" />
            </div>
          </div>
        )}
      </div>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            variants={overlayVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        variants={sidebarVariants}
        initial="closed"
        animate={isMobileMenuOpen ? "open" : "closed"}
        className="lg:relative lg:translate-x-0 fixed inset-y-0 left-0 z-50 w-72 lg:w-64 bg-[#121212] border-r border-gray-800 flex flex-col"
      >
        {/* Logo/Header */}
        <div className="p-4 lg:p-6 border-b border-gray-800 mt-16 lg:mt-0">
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
          <motion.div
            className="p-4 border-b border-gray-800"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}
          >
            <div className="flex items-center mb-2">
              <div className="w-10 h-10 bg-amber-500/20 rounded-full flex items-center justify-center mr-3">
                <Users size={18} className="text-amber-500" />
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
          </motion.div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navigation.map((item, index) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + index * 0.05, duration: 0.3 }}
            >
              <Link
                href={item.href}
                className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  item.current
                    ? "bg-amber-600/20 text-amber-400 border border-amber-600/30 shadow-lg"
                    : "text-gray-300 hover:bg-[#1A1A1A] hover:text-amber-500 active:scale-95"
                }`}
              >
                <item.icon size={20} className="mr-3" />
                {item.name}
              </Link>
            </motion.div>
          ))}
        </nav>

        {/* Logout Button */}
        <motion.div
          className="p-4 border-t border-gray-800"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
        >
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full text-gray-300 border-gray-700 hover:bg-red-600/20 hover:border-red-600/30 hover:text-red-400 h-12 active:scale-95 transition-all duration-200"
          >
            <LogOut size={16} className="mr-2" />
            Logout
          </Button>
        </motion.div>
      </motion.div>

      {/* Desktop Sidebar (Always Visible) */}
      <div className="hidden lg:flex w-64 bg-[#121212] border-r border-gray-800 flex-col">
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
      <main className="flex-1 overflow-auto pt-16 lg:pt-0">{children}</main>
    </div>
  );
}
