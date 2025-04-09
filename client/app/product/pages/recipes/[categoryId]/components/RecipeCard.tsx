"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Recipe } from "@/types";

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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ scale: 1.03 }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 30,
        duration: 0.3,
      }}
      onClick={onClick}
      className={cn(
        "group cursor-pointer relative overflow-hidden rounded-xl bg-black/70 border-t border-l border-white/10",
        "shadow-[0_0_15px_rgba(255,215,0,0.15)] hover:shadow-[0_0_25px_rgba(255,215,0,0.3)]",
        "transition-all duration-300 ease-in-out"
      )}
    >
      <div className="relative aspect-square w-full overflow-hidden">
        <div className="absolute inset-0 z-10 flex flex-col justify-between p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-end"
          >
            <div className="rounded-full bg-black/70 px-3 py-1.5 backdrop-blur-md border border-amber-600/30">
              <span className="text-sm font-medium text-amber-300">
                {formattedPrice}
              </span>
            </div>
          </motion.div>

          <div className="space-y-1 text-shadows">
            <motion.h3
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg font-semibold leading-none tracking-tight text-white group-hover:text-amber-200 transition-colors"
            >
              {recipe.name}
            </motion.h3>
            <motion.p
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="text-sm text-amber-100/70 line-clamp-2"
            >
              {recipe.description || "A delicious coffee recipe"}
            </motion.p>
          </div>
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent" />

        <Image
          src={recipe.image || "/placeholder-recipe.jpg"}
          alt={recipe.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className={cn(
            "object-cover transition-all duration-500",
            "group-hover:scale-110 group-hover:brightness-110",
            !isAvailable && "grayscale brightness-50"
          )}
        />
      </div>

      {!isAvailable && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm"
        >
          <div className="flex flex-col items-center space-y-3 px-4 text-center">
            <div className="rounded-full bg-amber-900/30 p-3">
              <AlertCircle className="h-6 w-6 text-amber-500" />
            </div>
            <div className="space-y-1">
              <h3 className="font-medium text-amber-100">
                Currently Unavailable
              </h3>
              <p className="text-sm text-amber-300/60">
                This recipe is not available right now
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
