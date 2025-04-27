"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function RecipeDetailPage() {
  const router = useRouter();
  
  // Redirect to recipes page since we don't need standalone recipe detail pages anymore
  useEffect(() => {
    router.push("/product/pages/recipes");
  }, [router]);

  // Show loading while redirecting
  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
      <div className="flex flex-col items-center">
        <Loader2 className="h-10 w-10 animate-spin text-amber-500 mb-4" />
        <p className="text-white/70">Redirecting to Recipes...</p>
      </div>
    </div>
  );
}
