import React from 'react';
import { DocumentChartBarIcon, DocumentTextIcon, PaperAirplaneIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';

const ReportsFeatureShowcase = () => {
  return (
    <div className="bg-gradient-to-br from-gray-900 to-black rounded-xl border border-purple-900/30 overflow-hidden">
      <div className="p-6 md:p-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left side: Feature description */}
          <div className="lg:w-2/5">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-indigo-500 mb-6">
              <DocumentChartBarIcon className="h-6 w-6 text-white" />
            </div>
            
            <h3 className="text-2xl md:text-3xl font-bold mb-4 text-purple-300">
              Comprehensive Reports
            </h3>
            
            <p className="text-gray-300 text-lg mb-6">
              Generate detailed productivity reports, export timesheets, and simplify client billing with our powerful reporting tools.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="bg-purple-900/30 p-2 rounded-lg mr-3 mt-1">
                  <DocumentTextIcon className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <h4 className="font-medium text-white">Versatile Export Options</h4>
                  <p className="text-gray-400 text-sm">Download as PDF or CSV for your records or client billing</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-purple-900/30 p-2 rounded-lg mr-3 mt-1">
                  <PaperAirplaneIcon className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <h4 className="font-medium text-white">Email Reports</h4>
                  <p className="text-gray-400 text-sm">Schedule and send reports automatically to clients or team members</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-purple-900/30 p-2 rounded-lg mr-3 mt-1">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5 text-purple-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium text-white">Productivity Analytics</h4>
                  <p className="text-gray-400 text-sm">Track trends and identify your most productive days and times</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right side: Reports mockup image */}
          <div className="lg:w-3/5 flex items-center justify-center">
            <div className="relative w-full max-w-lg">
              {/* Reports mockup frame */}
              <div className="shadow-2xl rounded-xl overflow-hidden border border-gray-800">
                {/* Reports header */}
                <div className="bg-gray-800 text-white p-3 flex justify-between items-center">
                  <div className="text-sm font-medium">Productivity Reports</div>
                  <div className="flex space-x-2">
                    <div className="h-3 w-3 rounded-full bg-red-500"></div>
                    <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                    <div className="h-3 w-3 rounded-full bg-green-500"></div>
                  </div>
                </div>
                
                {/* Reports content */}
                <div className="bg-white p-4 flex flex-col gap-3">
                  {/* Reports tabs */}
                  <div className="flex border-b border-gray-200">
                    <div className="px-3 py-2 text-xs bg-blue-50 border-b-2 border-blue-500 text-blue-700 font-medium">Productivity</div>
                    <div className="px-3 py-2 text-xs text-gray-500">Time Reports</div>
                    <div className="px-3 py-2 text-xs text-gray-500">Invoices</div>
                  </div>
                  
                  {/* Chart area */}
                  <div className="pt-2 pb-4">
                    <div className="w-full h-20 bg-gray-100 rounded flex items-end p-1">
                      <div className="w-1/7 h-8 bg-green-500 mx-0.5"></div>
                      <div className="w-1/7 h-12 bg-green-500 mx-0.5"></div>
                      <div className="w-1/7 h-6 bg-green-500 mx-0.5"></div>
                      <div className="w-1/7 h-16 bg-green-500 mx-0.5"></div>
                      <div className="w-1/7 h-10 bg-green-500 mx-0.5"></div>
                      <div className="w-1/7 h-14 bg-green-500 mx-0.5"></div>
                      <div className="w-1/7 h-7 bg-green-500 mx-0.5"></div>
                    </div>
                  </div>
                  
                  {/* Summary boxes */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-2 bg-blue-50 rounded border border-blue-100">
                      <div className="text-xs text-gray-500">Productive</div>
                      <div className="font-bold text-sm">05h 30m</div>
                    </div>
                    <div className="p-2 bg-red-50 rounded border border-red-100">
                      <div className="text-xs text-gray-500">Distractions</div>
                      <div className="font-bold text-sm">01h 15m</div>
                    </div>
                    <div className="p-2 bg-purple-50 rounded border border-purple-100">
                      <div className="text-xs text-gray-500">Score</div>
                      <div className="font-bold text-sm">78%</div>
                    </div>
                  </div>
                  
                  {/* Download buttons */}
                  <div className="flex justify-end space-x-2 mt-2 pt-2 border-t border-gray-100">
                    <button className="px-2 py-1 flex items-center text-xs bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100">
                      <ArrowDownTrayIcon className="h-3 w-3 mr-1" />
                      PDF
                    </button>
                    <button className="px-2 py-1 flex items-center text-xs bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100">
                      <PaperAirplaneIcon className="h-3 w-3 mr-1" />
                      Email
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Purple glow effect */}
              <div className="absolute -inset-2 bg-purple-500/20 rounded-2xl blur-xl -z-10"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsFeatureShowcase;