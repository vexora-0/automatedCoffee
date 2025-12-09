"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Recipe, RecipeIngredient, Ingredient } from "@/lib/api/types";
import { paymentService } from "@/lib/api/services";
import { Button } from "@/components/ui/button";
import { X, ShoppingCart, Loader2, ThumbsUp, Coffee } from "lucide-react";
import { useRouter } from "next/navigation";

// Track failed image URLs to avoid repeated 404 fetches
const failedImageUrls = new Set<string>();

// Array of benefits/quotes for each category
const COFFEE_QUOTES = [
  "Coffee is a language in itself.",
  "Life happens, coffee helps.",
  "Behind every successful person is a substantial amount of coffee.",
  "Coffee first. Schemes later.",
  "Take life one sip at a time.",
  "Coffee is the best medicine.",
];

const SPECIALTY_QUOTES = [
  "Indulge in the extraordinary.",
  "Elevate your everyday ritual.",
  "For those who appreciate the finer things.",
  "Exquisite taste, exceptional moments.",
  "Crafted for connoisseurs.",
  "Where passion meets perfection.",
];

const BENEFITS = [
  "Rich in antioxidants",
  "Boosts energy & focus",
  "Improves physical performance",
  "May help burn fat",
  "Enhances cognitive function",
  "May lower risk of type 2 diabetes",
];

interface RecipeDetailsDialogProps {
  recipe: Recipe | null;
  isOpen: boolean;
  onClose: () => void;
  recipeIngredients: RecipeIngredient[];
  ingredients: Ingredient[];
}

// Helper function to validate image URL
const isValidImageUrl = (url: string | undefined): boolean => {
  if (!url) return false;
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
};

export default function RecipeDetailsDialog({
  recipe,
  isOpen,
  onClose,
  recipeIngredients,
}: RecipeDetailsDialogProps) {
  const router = useRouter();
  const [isOrdering, setIsOrdering] = useState(false);
  const [showOrderSuccess, setShowOrderSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [imageError, setImageError] = useState(false);
  const [isImageValid, setIsImageValid] = useState(() => 
    recipe ? (isValidImageUrl(recipe.image_url) && !failedImageUrls.has(recipe.image_url || "")) : false
  );

  // Reset image error and validate URL when recipe changes
  useEffect(() => {
    if (recipe) {
      const failedPreviously = !!recipe.image_url && failedImageUrls.has(recipe.image_url);
      const valid = isValidImageUrl(recipe.image_url) && !failedPreviously;
      setIsImageValid(valid);
      setImageError(!valid);
    }
  }, [recipe]);

  // Generate random quote based on category
  const getRandomQuote = () => {
    if (!recipe) return "";

    const quotes =
      recipe.category_id === "1" ? COFFEE_QUOTES : SPECIALTY_QUOTES;
    const randomIndex = Math.floor(Math.random() * quotes.length);
    return quotes[randomIndex];
  };

  // Generate random benefit
  const getRandomBenefit = () => {
    const randomIndex = Math.floor(Math.random() * BENEFITS.length);
    return BENEFITS[randomIndex];
  };

  // Memoize random quotes and benefits
  const [randomQuote, setRandomQuote] = useState("");
  const [randomBenefit, setRandomBenefit] = useState("");

  useEffect(() => {
    if (isOpen && recipe) {
      setRandomQuote(getRandomQuote());
      setRandomBenefit(getRandomBenefit());
    }
  }, [isOpen, recipe]);

  // Reset state when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setErrorMessage("");
      setShowOrderSuccess(false);
    }
  }, [isOpen]);

  // Format price as currency
  const formattedPrice = recipe
    ? new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(recipe.price)
    : "₹0.00";

  const handlePlaceOrder = async () => {
    if (!recipe) return;

    const userId = sessionStorage.getItem("userId");
    const machineId = localStorage.getItem("machineId");

    if (!userId || !machineId) {
      setErrorMessage("Session expired. Please login again.");
      return;
    }

    setIsOrdering(true);
    setErrorMessage("");

    try {
      // Ask server to build and return an HTML form that posts to CCAvenue
      const html = await paymentService.initiate({
        user_id: userId,
        machine_id: machineId,
        recipe_id: recipe.recipe_id,
      });

      // Create a new document and write the HTML to trigger redirect
      const newWindow = window.open('', '_self');
      if (newWindow) {
        newWindow.document.open();
        newWindow.document.write(html);
        newWindow.document.close();
      } else {
        // Fallback: render inline
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        document.body.appendChild(iframe);
        iframe.contentDocument?.open();
        iframe.contentDocument?.write(html);
        iframe.contentDocument?.close();
      }
    } catch (err) {
      console.error('Payment initiation error:', err);
      setErrorMessage('Failed to initiate payment. Please try again.');
    } finally {
      setIsOrdering(false);
    }
  };

  if (!recipe) return null;

  // Find recipe ingredients for the current recipe (for quantity info only)
  const currentRecipeIngredients = recipeIngredients.filter(
    (ri) => ri.recipe_id === recipe.recipe_id
  );

  // Get coffee quantity - just check ingredient_id
  const coffeeIngredient = currentRecipeIngredients.find((ri) =>
    ri.ingredient_id.includes("coffee")
  );

  // Get milk quantity - just check ingredient_id
  const milkIngredient = currentRecipeIngredients.find((ri) =>
    ri.ingredient_id.includes("milk")
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-[#5F3023]/50 backdrop-blur-lg"
            onClick={onClose}
          />

          {/* Dialog container */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.97, opacity: 0, y: 10 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="relative z-[55] w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-2xl shadow-[0_20px_60px_-10px_rgba(95,48,35,0.3)]"
          >
            {/* Close button */}
            <motion.button
              whileHover={{ scale: 1.1, backgroundColor: "#F4EBDE" }}
              whileTap={{ scale: 0.95 }}
              className="absolute top-4 right-4 z-[60] flex items-center justify-center w-8 h-8 rounded-full bg-[#F4EBDE] text-[#5F3023] border border-[#C28654]/30 shadow-md"
              onClick={onClose}
              aria-label="Close dialog"
            >
              <X className="h-4 w-4" />
            </motion.button>

            <div className="bg-gradient-to-br from-[#F4EBDE] to-[#DAB49D] overflow-hidden flex flex-col md:flex-row">
              {/* Left column - Image */}
              <div className="relative h-[300px] md:h-auto md:w-1/2">
                <div className="absolute inset-0 bg-[#5F3023]/20 mix-blend-overlay z-10"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-[#5F3023]/30 via-transparent to-[#5F3023]/10 z-10" />

                {!imageError && isImageValid && recipe.image_url ? (
                  <Image
                    src={recipe.image_url}
                    alt={recipe.name}
                    fill
                    className="object-cover"
                    priority
                    onError={() => {
                      // Remember failed URL so we don't retry and spam 404s
                      if (recipe.image_url) {
                        failedImageUrls.add(recipe.image_url);
                      }
                      setImageError(true);
                      setIsImageValid(false);
                    }}
                    onLoad={() => {
                      // Image loaded successfully
                      if (imageError) setImageError(false);
                    }}
                    // For Cloudinary URLs, use unoptimized to prevent Next.js optimization issues
                    unoptimized={recipe.image_url.includes('cloudinary.com')}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#C28654]/20 to-[#8A5738]/20">
                    <Coffee className="h-16 w-16 text-[#8A5738]/40" />
                  </div>
                )}
              </div>

              {/* Right column - Content */}
              <div className="relative md:w-1/2 p-6 md:p-8 flex flex-col">
                {/* Decorative elements */}
                <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-[#C28654]/10 -z-10"></div>
                <div className="absolute right-1/2 top-1/3 w-12 h-12 rounded-full bg-[#8A5738]/5 -z-10"></div>

                {/* Recipe name */}
                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
                  className="text-3xl font-bold text-[#5F3023] tracking-tight"
                >
                  {recipe.name}
                </motion.h2>

                {/* Quote */}
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="mt-2 italic text-[#8A5738] border-l-2 border-[#C28654]/40 pl-3 text-sm"
                >
                  &ldquo;{randomQuote}&rdquo;
                </motion.div>

                {/* Description */}
                <motion.p
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="mt-5 text-[#5F3023]/90"
                >
                  {recipe.description ||
                    "A premium coffee creation crafted with care and precision."}
                </motion.p>

                {/* Quantity information */}
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="mt-4 flex flex-col gap-2"
                >
                  <div className="flex gap-x-4">
                    {coffeeIngredient && (
                      <div className="flex items-center gap-2 bg-[#C28654]/10 rounded-lg px-3 py-2">
                        <Coffee className="h-4 w-4 text-[#5F3023]" />
                        <span className="text-sm font-medium text-[#5F3023]">
                          {coffeeIngredient.quantity} ml
                        </span>
                      </div>
                    )}

                    {milkIngredient && (
                      <div className="flex items-center gap-2 bg-[#C28654]/10 rounded-lg px-3 py-2">
                        <span className="h-4 w-4 flex items-center justify-center text-[#5F3023] font-bold">
                          M
                        </span>
                        <span className="text-sm font-medium text-[#5F3023]">
                          {milkIngredient.quantity} ml
                        </span>
                      </div>
                    )}
                  </div>
                </motion.div>

                {/* Random benefit */}
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="mt-4 bg-[#F4EBDE] border border-[#C28654]/20 rounded-lg p-3"
                >
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full bg-[#C28654]/30 flex items-center justify-center">
                      <div className="h-1.5 w-1.5 rounded-full bg-[#5F3023]"></div>
                    </div>
                    <p className="text-sm text-[#8A5738]">{randomBenefit}</p>
                  </div>
                </motion.div>

                {/* Price and order section */}
                <div className="mt-auto pt-6">
                  {errorMessage && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-red-100 border border-red-300 text-red-800 px-3 py-2 rounded-lg mb-4 text-sm"
                    >
                      <p>{errorMessage}</p>
                    </motion.div>
                  )}

                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-[#5F3023]">
                      Price
                    </h3>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="bg-[#C28654]/90 px-4 py-2 rounded-full shadow-md"
                    >
                      <span className="text-lg font-bold text-[#F4EBDE]">
                        {formattedPrice}
                      </span>
                    </motion.div>
                  </div>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      className="w-full py-5 text-lg font-bold bg-[#5F3023] hover:bg-[#8A5738] text-[#F4EBDE] border-none shadow-md hover:shadow-lg transition-all duration-300"
                      onClick={handlePlaceOrder}
                      disabled={isOrdering || showOrderSuccess}
                    >
                      {isOrdering ? (
                        <motion.div
                          className="flex items-center justify-center"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        >
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Processing...
                        </motion.div>
                      ) : (
                        <motion.div
                          className="flex items-center justify-center"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        >
                          <ShoppingCart className="mr-2 h-5 w-5" />
                          Order Now
                        </motion.div>
                      )}
                    </Button>
                  </motion.div>
                </div>
              </div>
            </div>

            {/* Order success overlay */}
            <AnimatePresence>
              {showOrderSuccess && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0 z-[70] bg-[#5F3023]/90 backdrop-blur-md flex items-center justify-center"
                >
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 30,
                      delay: 0.1,
                    }}
                    className="bg-[#F4EBDE] rounded-xl p-8 max-w-md w-full border border-[#C28654]/30 shadow-2xl"
                  >
                    <motion.div
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{
                        scale: [0.5, 1.1, 1],
                        opacity: 1,
                      }}
                      transition={{ duration: 0.6, delay: 0.2 }}
                      className="w-16 h-16 rounded-full bg-[#C28654]/30 flex items-center justify-center mb-6 mx-auto shadow-inner"
                    >
                      <ThumbsUp className="h-7 w-7 text-[#5F3023]" />
                    </motion.div>
                    <motion.h3
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-2xl font-bold text-[#5F3023] text-center mb-2"
                    >
                      Order Successful!
                    </motion.h3>
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="text-[#8A5738] text-center mb-6"
                    >
                      Your {recipe.name} is being prepared.
                    </motion.p>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 2, ease: "easeInOut" }}
                      className="h-1.5 bg-[#C28654] rounded-full mb-4"
                    />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
