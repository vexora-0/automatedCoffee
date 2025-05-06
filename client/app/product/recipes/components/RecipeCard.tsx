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
  const formattedPrice = recipe.price;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{
        duration: 0.2,
      }}
      onClick={onClick}
      className={cn(
        "group relative overflow-hidden rounded-xl cursor-pointer",
        "bg-gradient-to-br from-[#8A5738] to-[#5F3023]",
        "border border-[#C28654]/30 hover:border-[#C28654]/60",
        "shadow-md hover:shadow-lg",
        "transition-all duration-200 h-[320px]"
      )}
    >
      {/* Image container */}
      <div className="relative h-[60%] w-full overflow-hidden rounded-t-xl">
        <div className="absolute inset-0 bg-gradient-to-b from-[#5F3023]/50 to-transparent z-10" />

        <Image
          src={recipe.image_url || "/placeholder-recipe.jpg"}
          alt={recipe.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className={cn(
            "object-cover transition-all duration-300",
            "group-hover:scale-105",
            !isAvailable && "grayscale brightness-50"
          )}
        />

        {/* Price tag */}
        <div className="absolute top-3 right-3 z-20">
          <motion.div className="rounded-full bg-[#5F3023]/80 backdrop-blur-sm px-3 py-1.5 border border-[#C28654]/40">
            <span className="text-sm font-medium text-[#F4EBDE]">
              {formattedPrice}
            </span>
          </motion.div>
        </div>
      </div>

      {/* Content area */}
      <div className="relative z-10 h-[40%] p-4 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="h-5 w-5 rounded-full bg-[#DAB49D]/60 flex items-center justify-center">
              <Coffee className="h-3 w-3 text-[#F4EBDE]" />
            </div>
            <p className="text-xs font-medium uppercase tracking-wider text-[#DAB49D]">
              {recipe.category_id === "1" ? "Coffee" : "Specialty"}
            </p>
          </div>

          <h3 className="text-lg font-bold text-[#F4EBDE] mb-1 group-hover:text-[#DAB49D] transition-colors duration-200">
            {recipe.name}
          </h3>

          <p className="text-sm text-[#F4EBDE]/80 line-clamp-2">
            {recipe.description || "A delicious coffee recipe"}
          </p>
        </div>

        {/* Bottom hint */}
        <div className="pt-2">
          <p className="text-xs text-[#DAB49D] text-center">
            Tap to view details
          </p>
        </div>
      </div>

      {/* Overlay for unavailable items */}
      {!isAvailable && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-[#5F3023]/90 backdrop-blur-sm"
        >
          <div className="flex flex-col items-center space-y-3 px-4 text-center">
            <div className="rounded-full bg-[#C28654]/50 p-3 border border-[#F4EBDE]/30">
              <AlertCircle className="h-6 w-6 text-[#F4EBDE]" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-[#F4EBDE]">
                Currently Unavailable
              </h3>
              <p className="text-sm text-[#DAB49D]">
                This recipe cannot be prepared right now
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
