"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { AlertCircle, Coffee } from "lucide-react";
import { cn } from "@/lib/utils";
import { Recipe } from "@/lib/api/types";

// Track failed image URLs to avoid repeated 404 fetches
const failedImageUrls = new Set<string>();

interface RecipeCardProps {
  recipe: Recipe;
  isAvailable?: boolean;
  onClick?: () => void;
}

// Helper function to validate image URL
const isValidImageUrl = (url: string | undefined): boolean => {
  if (!url) return false;
  try {
    const urlObj = new URL(url);
    // Check if it's a valid HTTP/HTTPS URL
    return urlObj.protocol === "http:" || urlObj.protocol === "https:";
  } catch {
    return false;
  }
};

export function RecipeCard({
  recipe,
  isAvailable = true,
  onClick,
}: RecipeCardProps) {
  const [imageError, setImageError] = useState(false);
  const [isImageValid, setIsImageValid] = useState(
    () =>
      isValidImageUrl(recipe.image_url) &&
      !failedImageUrls.has(recipe.image_url || "")
  );

  // Format price to show ₹ symbol
  const formattedPrice = `₹${recipe.price}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{
        duration: 0.3,
        ease: "easeOut",
      }}
      onClick={isAvailable ? onClick : undefined}
      className={cn(
        "relative h-[370px] w-full overflow-hidden",
        isAvailable ? "cursor-pointer" : "cursor-not-allowed opacity-80"
      )}
      aria-disabled={!isAvailable}
    >
      {/* Main card container */}
      <div
        className={cn(
          "absolute inset-0 rounded-2xl overflow-hidden shadow-lg",
          isAvailable ? "bg-white" : "bg-gray-200"
        )}
      >
        {/* Sold out badge */}
        {!isAvailable && (
          <div className="absolute top-3 right-3 z-40 px-3 py-1 rounded-full bg-[#5F3023] text-white text-[11px] font-semibold uppercase tracking-wide shadow-md border border-white/30 pointer-events-none">
            Sold Out
          </div>
        )}

        {/* Image section */}
        <div className="h-[65%] relative overflow-hidden">
          <Image
            src={recipe.image_url || "/placeholder-recipe.jpg"}
            alt={recipe.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className={cn(
              "object-cover",
              !isAvailable && "grayscale brightness-50"
            )}
          />

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#000000]/80 via-transparent to-transparent" />

          {/* Price tag */}
          <div className="absolute bottom-4 right-4 z-20">
            <div className="px-3 py-1.5 rounded-full bg-[#5F3023] text-white font-bold shadow-lg flex items-center">
              <span>{formattedPrice}</span>
            </div>
          </div>
        </div>

        {/* Content section */}
        <div
          className={cn(
            "h-[35%] p-5 relative",
            isAvailable ? "bg-white" : "bg-gray-100"
          )}
        >
          {/* Static accent line */}
          <div
            className={cn(
              "absolute top-0 left-8 right-8 h-[2px]",
              isAvailable ? "bg-[#C28654]" : "bg-gray-400"
            )}
          />

          <div className="flex flex-col h-full justify-between">
            <div>
              {/* Coffee name */}
              <h3
                className={cn(
                  "text-xl font-bold",
                  isAvailable ? "text-[#5F3023]" : "text-gray-700"
                )}
              >
                {recipe.name}
              </h3>

              {/* Description with no line clamp */}
              <p
                className={cn(
                  "text-sm mt-2 leading-relaxed overflow-hidden",
                  isAvailable ? "text-[#8A5738]/80" : "text-gray-600"
                )}
              >
                {recipe.description ||
                  "A delicious coffee recipe crafted with premium-quality beans."}
              </p>
            </div>

            {/* Simple card footer */}
            <div className="mt-2 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div
                  className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    isAvailable ? "bg-[#C28654]" : "bg-gray-500"
                  )}
                ></div>
                <div
                  className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    isAvailable ? "bg-[#8A5738]" : "bg-gray-500"
                  )}
                ></div>
                <div
                  className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    isAvailable ? "bg-[#5F3023]" : "bg-gray-500"
                  )}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
