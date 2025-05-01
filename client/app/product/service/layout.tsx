"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, Coffee, Wrench, Droplet, Sprout, Settings } from "lucide-react";

interface ServiceLayoutProps {
  children: ReactNode;
}

export default function ServiceLayout({ children }: ServiceLayoutProps) {
  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col">
      {/* Header */}
      <header className="p-4 border-b border-gray-800 bg-[#121212] flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/product" className="text-gray-400 hover:text-amber-500 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div className="ml-4 flex items-center">
            <Coffee size={20} className="text-amber-500 mr-2" />
            <h1 className="text-xl font-bold text-white">Service Menu</h1>
          </div>
        </div>
      </header>

      {/* Sidebar and Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <nav className="w-64 bg-[#121212] border-r border-gray-800 p-4">
          <div className="mb-6">
            <h2 className="text-xs uppercase text-gray-500 font-semibold mb-3">Maintenance</h2>
            <ul className="space-y-1">
              <li>
                <Link 
                  href="/product/service/refill-ingredients"
                  className="flex items-center py-2 px-3 rounded-md text-gray-300 hover:bg-[#1A1A1A] hover:text-amber-500 transition-colors"
                >
                  <Sprout size={18} className="mr-2" />
                  <span>Refill Ingredients</span>
                </Link>
              </li>
              <li>
                <Link 
                  href="/product/service/clean-water"
                  className="flex items-center py-2 px-3 rounded-md text-gray-300 hover:bg-[#1A1A1A] hover:text-amber-500 transition-colors"
                >
                  <Droplet size={18} className="mr-2" />
                  <span>Clean Water Refilling</span>
                </Link>
              </li>
              <li>
                <Link 
                  href="/product/service/cleaning"
                  className="flex items-center py-2 px-3 rounded-md text-gray-300 hover:bg-[#1A1A1A] hover:text-amber-500 transition-colors"
                >
                  <Wrench size={18} className="mr-2" />
                  <span>Cleaning</span>
                </Link>
              </li>
              <li>
                <Link 
                  href="/product/service/controls"
                  className="flex items-center py-2 px-3 rounded-md text-gray-300 hover:bg-[#1A1A1A] hover:text-amber-500 transition-colors"
                >
                  <Settings size={18} className="mr-2" />
                  <span>Controls</span>
                </Link>
              </li>
            </ul>
          </div>
        </nav>

        {/* Main content */}
        <main className="flex-1 overflow-auto p-6 bg-[#0A0A0A]">
          {children}
        </main>
      </div>
    </div>
  );
} 