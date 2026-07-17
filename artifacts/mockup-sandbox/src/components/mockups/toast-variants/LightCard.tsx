import React from "react";
import { CheckCircle2, X } from "lucide-react";

export default function LightCard() {
  return (
    <div className="flex flex-col gap-12 p-12 items-center bg-gray-50 min-h-screen font-sans">
      {/* Phone Frame 1: With Action */}
      <div className="relative w-[390px] h-[844px] bg-[#F4F5F7] rounded-[40px] shadow-2xl overflow-hidden border-[12px] border-gray-900 flex flex-col justify-end p-4 pb-8">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120px] h-[30px] bg-gray-900 rounded-b-3xl z-20"></div>
        
        {/* Toast With Action */}
        <Toast 
          title="Oferta aceita!" 
          subtitle="Acompanhe em Carteira" 
          action="Acompanhar" 
        />
      </div>

      {/* Phone Frame 2: Without Action */}
      <div className="relative w-[390px] h-[844px] bg-[#F4F5F7] rounded-[40px] shadow-2xl overflow-hidden border-[12px] border-gray-900 flex flex-col justify-end p-4 pb-8">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120px] h-[30px] bg-gray-900 rounded-b-3xl z-20"></div>
        
        {/* Toast Without Action */}
        <Toast 
          title="Oferta aceita!" 
          subtitle="Acompanhe em Carteira" 
        />
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes progress-drain {
          from { transform: scaleX(1); }
          to { transform: scaleX(0); }
        }
        .animate-progress {
          animation: progress-drain 6s linear forwards;
          transform-origin: left;
        }
      `}} />
    </div>
  );
}

function Toast({ title, subtitle, action }: { title: string, subtitle?: string, action?: string }) {
  return (
    <div className="relative bg-[#ffffff] rounded-[16px] shadow-md overflow-hidden flex z-10 w-full">
      {/* Progress Bar at the top */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-transparent w-full z-10 overflow-hidden">
        <div className="h-full w-full bg-[#16a34a] animate-progress"></div>
      </div>
      
      {/* Left Accent Bar */}
      <div className="w-[4px] bg-[#16a34a] shrink-0"></div>

      {/* Content Container */}
      <div className="flex-1 px-[14px] py-[12px] pt-[15px] flex flex-col">
        <div className="flex items-start gap-3">
          <div className="shrink-0 flex items-center justify-center pt-0.5">
            <CheckCircle2 className="w-[28px] h-[28px] text-[#16a34a]" strokeWidth={2} />
          </div>
          
          <div className="flex-1 pt-0.5">
            <h3 className="text-[#15151D] text-[14px] font-semibold leading-tight">{title}</h3>
            {subtitle && <p className="text-gray-500 text-[11px] mt-[3px] leading-tight">{subtitle}</p>}
          </div>

          <button className="shrink-0 text-gray-400 hover:text-gray-600 transition-colors p-0.5">
            <X className="w-[18px] h-[18px]" strokeWidth={2} />
          </button>
        </div>

        {action && (
          <div className="flex justify-end mt-1">
            <button className="text-[#16a34a] text-[12px] font-medium hover:text-green-700 transition-colors">
              {action} &rarr;
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
