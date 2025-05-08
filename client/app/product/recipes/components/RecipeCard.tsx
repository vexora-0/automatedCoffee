"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { AlertCircle, Coffee } from "lucide-react";
import { cn } from "@/lib/utils";
import { Recipe } from "@/lib/api/types";

interface RecipeCardProps {
  recipe: Recipe;
  isAvailable?: boolean;
  onClick?: () => void;
}

export function RecipeCard({
  recipe,
  isAvailable = true,
  onClick,
}: RecipeCardProps) {
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
      onClick={onClick}
      className="relative h-[370px] w-full overflow-hidden cursor-pointer"
    >
      {/* Main card container */}
      <div className="absolute inset-0 rounded-2xl overflow-hidden bg-white shadow-lg">
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

          {/* Coffee icon badge */}
          <div className="absolute bottom-4 left-4 z-20">
            <div className="w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center">
              <Coffee className="h-4 w-4 text-[#5F3023]" />
            </div>
          </div>
        </div>

        {/* Content section */}
        <div className="h-[35%] p-5 bg-white relative">
          {/* Static accent line */}
          <div className="absolute top-0 left-8 right-8 h-[2px] bg-[#C28654]" />

          <div className="flex flex-col h-full justify-between">
            <div>
              {/* Coffee name */}
              <h3 className="text-xl font-bold text-[#5F3023]">
                {recipe.name}
              </h3>

              {/* Description with no line clamp */}
              <p className="text-sm text-[#8A5738]/80 mt-2 leading-relaxed overflow-hidden">
                {recipe.description ||
                  "A delicious coffee recipe crafted with premium-quality beans."}
              </p>
            </div>

            {/* Simple card footer */}
            <div className="mt-2 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#C28654]"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-[#8A5738]"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-[#5F3023]"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay for unavailable items */}
      {!isAvailable && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm rounded-2xl border-2 border-red-200">
          <div className="flex flex-col items-center space-y-3 px-4 text-center">
            <div className="rounded-full bg-red-50 p-3 shadow-lg border border-red-200">
              <AlertCircle className="h-7 w-7 text-red-500" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-red-600 text-lg">
                Currently Unavailable
              </h3>
              <p className="text-sm text-red-500/80">
                This recipe cannot be prepared right now
              </p>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
