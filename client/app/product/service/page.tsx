"use client";

import { useRouter } from "next/navigation";
import { Sprout, Droplet, Wrench, Settings } from "lucide-react";

export default function ServicePage() {
  const router = useRouter();

  const serviceOptions = [
    {
      title: "Refill Ingredients",
      description: "Check and replenish ingredient levels",
      icon: <Sprout size={24} className="text-amber-500" />,
      route: "/product/service/refill-ingredients",
      color: "bg-amber-900/20",
      buttonColor: "bg-amber-600 hover:bg-amber-700"
    },
    {
      title: "Clean Water Refilling",
      description: "Maintain clean water for the machine",
      icon: <Droplet size={24} className="text-blue-500" />,
      route: "/product/service/clean-water",
      color: "bg-blue-900/20",
      buttonColor: "bg-blue-600 hover:bg-blue-700"
    },
    {
      title: "Cleaning",
      description: "Maintain optimal machine cleanliness",
      icon: <Wrench size={24} className="text-purple-500" />,
      route: "/product/service/cleaning",
      color: "bg-purple-900/20",
      buttonColor: "bg-purple-600 hover:bg-purple-700"
    },
    {
      title: "Controls",
      description: "Advanced machine controls (coming soon)",
      icon: <Settings size={24} className="text-green-500" />,
      route: "/product/service/controls",
      color: "bg-green-900/20",
      buttonColor: "bg-green-600 hover:bg-green-700"
    }
  ];

  return (
    <div className="h-full">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Service Menu</h1>
        <p className="text-gray-400">
          Perform maintenance tasks and adjust machine settings
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {serviceOptions.map((option, index) => (
          <div 
            key={index}
            className="bg-[#141414] border border-gray-800 rounded-lg p-6 shadow-md hover:border-gray-700 transition-colors"
          >
            <div className="flex items-center mb-4">
              <div className={`mr-4 p-3 rounded-full ${option.color}`}>
                {option.icon}
              </div>
              <div>
                <h3 className="font-medium text-white text-lg">{option.title}</h3>
                <p className="text-gray-400 text-sm">{option.description}</p>
              </div>
            </div>
            
            <button
              onClick={() => router.push(option.route)}
              className={`w-full py-3 text-center text-white ${option.buttonColor} rounded transition-colors mt-4`}
            >
              Open
            </button>
          </div>
        ))}
      </div>
    </div>
  );
} 