"use client";

import { Settings, AlertCircle, Workflow, Thermometer, Cpu, Power } from "lucide-react";

export default function ControlsPage() {
  return (
    <div className="h-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">Machine Controls</h1>
        <p className="text-gray-400">
          Advanced machine controls and configuration settings.
        </p>
      </div>

      <div className="bg-amber-900/30 border border-amber-800 text-amber-400 rounded-md p-4 mb-6 flex items-center">
        <AlertCircle size={20} className="mr-2 flex-shrink-0" />
        <p>
          Machine controls will be implemented in the next iteration. This page is a placeholder.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#141414] border border-gray-800 rounded-lg p-6 shadow-md">
          <div className="flex items-center mb-4">
            <div className="mr-4 p-3 bg-purple-900/20 rounded-full">
              <Thermometer size={24} className="text-purple-500" />
            </div>
            <div>
              <h3 className="font-medium text-white text-lg">Temperature Controls</h3>
              <p className="text-gray-400 text-sm">Adjust brewing and milk steaming temperatures</p>
            </div>
          </div>
          
          <div className="opacity-60 pointer-events-none">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-400 mb-1">Brewing Temperature</label>
              <div className="flex items-center">
                <input 
                  type="range" 
                  className="flex-1 appearance-none h-2 bg-[#1A1A1A] rounded-full" 
                  min="85" 
                  max="95" 
                  disabled={true}
                />
                <span className="ml-3 text-gray-300 w-12 text-center">92°C</span>
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-400 mb-1">Milk Steaming Temperature</label>
              <div className="flex items-center">
                <input 
                  type="range" 
                  className="flex-1 appearance-none h-2 bg-[#1A1A1A] rounded-full" 
                  min="60" 
                  max="80" 
                  disabled={true}
                />
                <span className="ml-3 text-gray-300 w-12 text-center">65°C</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-[#141414] border border-gray-800 rounded-lg p-6 shadow-md">
          <div className="flex items-center mb-4">
            <div className="mr-4 p-3 bg-cyan-900/20 rounded-full">
              <Workflow size={24} className="text-cyan-500" />
            </div>
            <div>
              <h3 className="font-medium text-white text-lg">Brewing Parameters</h3>
              <p className="text-gray-400 text-sm">Adjust brewing pressure and flow rate</p>
            </div>
          </div>
          
          <div className="opacity-60 pointer-events-none">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-400 mb-1">Brewing Pressure</label>
              <div className="flex items-center">
                <input 
                  type="range" 
                  className="flex-1 appearance-none h-2 bg-[#1A1A1A] rounded-full" 
                  min="7" 
                  max="10" 
                  disabled={true}
                />
                <span className="ml-3 text-gray-300 w-12 text-center">9 bar</span>
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-400 mb-1">Flow Rate</label>
              <div className="flex items-center">
                <input 
                  type="range" 
                  className="flex-1 appearance-none h-2 bg-[#1A1A1A] rounded-full" 
                  min="1" 
                  max="5" 
                  disabled={true}
                />
                <span className="ml-3 text-gray-300 w-12 text-center">3 g/s</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#141414] border border-gray-800 rounded-lg p-6 shadow-md">
          <div className="flex items-center mb-4">
            <div className="mr-4 p-3 bg-green-900/20 rounded-full">
              <Cpu size={24} className="text-green-500" />
            </div>
            <div>
              <h3 className="font-medium text-white text-lg">System Status</h3>
              <p className="text-gray-400 text-sm">View system diagnostics and stats</p>
            </div>
          </div>
          
          <div className="space-y-3 text-gray-400 opacity-60">
            <div className="flex justify-between items-center py-2 border-b border-gray-800">
              <span>System Uptime</span>
              <span className="text-gray-300">152 hrs</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-800">
              <span>Software Version</span>
              <span className="text-gray-300">v2.3.1</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-800">
              <span>Beverages Prepared</span>
              <span className="text-gray-300">1,245</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span>Machine Status</span>
              <span className="px-2 py-1 text-xs bg-green-900/30 text-green-400 rounded">Operational</span>
            </div>
          </div>
        </div>
        
        <div className="bg-[#141414] border border-gray-800 rounded-lg p-6 shadow-md">
          <div className="flex items-center mb-4">
            <div className="mr-4 p-3 bg-red-900/20 rounded-full">
              <Power size={24} className="text-red-500" />
            </div>
            <div>
              <h3 className="font-medium text-white text-lg">Power Management</h3>
              <p className="text-gray-400 text-sm">Configure auto sleep and power options</p>
            </div>
          </div>
          
          <div className="opacity-60 pointer-events-none">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-400 mb-2">Auto-Sleep Timer</label>
              <select 
                className="w-full bg-[#1A1A1A] border border-gray-800 text-gray-300 rounded-md p-2"
                disabled={true}
              >
                <option>30 minutes</option>
                <option>1 hour</option>
                <option>2 hours</option>
                <option>Never</option>
              </select>
            </div>
            
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm text-gray-400">Eco Mode</span>
              <div className="relative inline-block w-12 align-middle select-none">
                <input 
                  type="checkbox" 
                  disabled={true}
                  className="absolute block w-6 h-6 rounded-full bg-gray-700 appearance-none cursor-not-allowed"
                />
                <label 
                  className="block overflow-hidden h-6 rounded-full bg-gray-800 cursor-not-allowed"
                ></label>
              </div>
            </div>
            
            <button
              disabled={true}
              className="w-full py-3 text-center text-white bg-red-600 opacity-50 rounded cursor-not-allowed"
            >
              Reboot Machine
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 