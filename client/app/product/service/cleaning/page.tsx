"use client";

import { useState } from "react";
import { Wrench, CheckCircle2, Clock, AlertTriangle } from "lucide-react";

export default function CleaningPage() {
  const [showMessage, setShowMessage] = useState(false);

  const handleStartCleaning = () => {
    setShowMessage(true);
    setTimeout(() => setShowMessage(false), 3000);
  };

  return (
    <div className="h-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">Machine Cleaning</h1>
        <p className="text-gray-400">
          Regular cleaning maintains optimal performance and ensures high-quality beverages.
        </p>
      </div>

      {showMessage && (
        <div className="mb-4 p-3 bg-amber-900/30 border border-amber-800 text-amber-400 rounded-md">
          This feature will be implemented in a future update.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#141414] border border-gray-800 rounded-lg p-6 shadow-md">
          <div className="flex items-center mb-4">
            <div className="mr-4 p-3 bg-amber-900/20 rounded-full">
              <Wrench size={24} className="text-amber-500" />
            </div>
            <div>
              <h3 className="font-medium text-white text-lg">Regular Cleaning</h3>
              <p className="text-gray-400 text-sm">Recommended daily</p>
            </div>
          </div>
          
          <ul className="space-y-3 mb-6">
            <li className="flex items-start">
              <CheckCircle2 size={18} className="text-green-500 mr-2 mt-0.5 flex-shrink-0" />
              <span className="text-gray-300">Cleans brewing chamber and dispenser valves</span>
            </li>
            <li className="flex items-start">
              <CheckCircle2 size={18} className="text-green-500 mr-2 mt-0.5 flex-shrink-0" />
              <span className="text-gray-300">Flushes internal piping with hot water</span>
            </li>
            <li className="flex items-start">
              <Clock size={18} className="text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
              <span className="text-gray-300">Takes approximately 5 minutes</span>
            </li>
          </ul>
          
          <button
            onClick={handleStartCleaning}
            className="w-full py-3 text-center text-white bg-amber-600 hover:bg-amber-700 rounded transition-colors"
          >
            Start Regular Cleaning
          </button>
        </div>
        
        <div className="bg-[#141414] border border-gray-800 rounded-lg p-6 shadow-md">
          <div className="flex items-center mb-4">
            <div className="mr-4 p-3 bg-blue-900/20 rounded-full">
              <Wrench size={24} className="text-blue-500" />
            </div>
            <div>
              <h3 className="font-medium text-white text-lg">Deep Cleaning</h3>
              <p className="text-gray-400 text-sm">Recommended weekly</p>
            </div>
          </div>
          
          <ul className="space-y-3 mb-6">
            <li className="flex items-start">
              <CheckCircle2 size={18} className="text-green-500 mr-2 mt-0.5 flex-shrink-0" />
              <span className="text-gray-300">Uses cleaning solution to remove coffee oils and residue</span>
            </li>
            <li className="flex items-start">
              <CheckCircle2 size={18} className="text-green-500 mr-2 mt-0.5 flex-shrink-0" />
              <span className="text-gray-300">Descales heating elements and water pathways</span>
            </li>
            <li className="flex items-start">
              <AlertTriangle size={18} className="text-red-500 mr-2 mt-0.5 flex-shrink-0" />
              <span className="text-gray-300">Machine will be unavailable for 20-30 minutes</span>
            </li>
          </ul>
          
          <button
            onClick={handleStartCleaning}
            className="w-full py-3 text-center text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors"
          >
            Start Deep Cleaning
          </button>
        </div>
      </div>
      
      <div className="mt-6 p-4 bg-[#141414] border border-gray-800 rounded-lg">
        <h3 className="font-medium text-white mb-2">Cleaning History</h3>
        <div className="overflow-hidden rounded-md border border-gray-800">
          <table className="min-w-full divide-y divide-gray-800">
            <thead className="bg-[#1A1A1A]">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Type
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Performed By
                </th>
              </tr>
            </thead>
            <tbody className="bg-[#121212] divide-y divide-gray-800">
              <tr>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                  Coming soon
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                  -
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                  -
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                  -
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Cleaning history will be available in a future update.
        </p>
      </div>
    </div>
  );
} 