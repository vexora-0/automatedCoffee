"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { AlertCircle, Coffee } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    // Log the error for debugging
    console.error("Global error caught:", error);

    // Redirect to screensaver after a short delay
    const redirectTimer = setTimeout(() => {
      router.push("/product/screensaver");
    }, 3000); // 3 second delay to show the error message

    return () => clearTimeout(redirectTimer);
  }, [error, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#432818] via-[#5F3023] to-[#2C1006] flex flex-col items-center justify-center overflow-hidden relative">
      {/* Background effects similar to screensaver */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Coffee bean floating elements */}
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={`bean-${i}`}
            className="absolute bg-[#C28654]/20 rounded-full"
            style={{
              width: Math.random() * 40 + 10,
              height: Math.random() * 20 + 5,
              borderRadius: "40% 60% 60% 40% / 60% 30% 70% 40%",
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              rotate: Math.random() * 360,
            }}
            animate={{
              rotate: [0, 360],
              y: [0, Math.random() * 20 - 10],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: Math.random() * 20 + 10,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Error message */}
      <motion.div
        className="relative z-10 text-center max-w-md mx-auto px-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div
          className="mb-6 flex justify-center"
          animate={{
            rotate: [0, 10, -10, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <AlertCircle className="text-[#F4EBDE] h-16 w-16" />
        </motion.div>

        <h1 className="text-4xl font-light text-[#F4EBDE] mb-4 tracking-wide">
          Sorry, something went wrong
        </h1>

        <p className="text-lg text-[#F4EBDE]/70 mb-8 font-light">
          We&apos;re redirecting you back to the home screen...
        </p>

        <motion.div
          className="flex items-center justify-center space-x-2 text-[#F4EBDE]/60"
          animate={{
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <Coffee className="h-5 w-5" />
          <span className="text-sm">Please wait</span>
        </motion.div>

        {/* Optional: Reset button (hidden but available for development) */}
        {process.env.NODE_ENV === "development" && (
          <motion.button
            onClick={reset}
            className="mt-6 px-4 py-2 bg-[#F4EBDE]/10 hover:bg-[#F4EBDE]/20 text-[#F4EBDE] rounded-lg border border-[#F4EBDE]/20 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Try again
          </motion.button>
        )}
      </motion.div>
    </div>
  );
}

