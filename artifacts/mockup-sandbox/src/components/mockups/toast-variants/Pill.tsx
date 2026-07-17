import React from 'react';
import { X } from 'lucide-react';

const ToastPill = ({ title, subtitle, action, delay = 0 }: { title: string, subtitle: string, action?: string, delay?: number }) => {
  return (
    <div 
      className="flex flex-col items-center w-full max-w-[340px] mx-auto opacity-0"
      style={{ animation: `toast-enter 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s forwards` }}
    >
      {/* Pill */}
      <div className="flex items-center w-full bg-white rounded-full p-2 pr-3 shadow-[0_16px_32px_-12px_rgba(0,0,0,0.1),0_4px_16px_-4px_rgba(0,0,0,0.04)] ring-1 ring-black/[0.04]">
        <div className="flex-shrink-0 mr-3.5 flex items-center justify-center pl-0.5">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="14" cy="14" r="14" fill="#16a34a" />
            <path d="M19.5 10L11.5 18L8.5 15" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        
        <div className="flex flex-col justify-center text-left flex-1 py-1 gap-1">
          <div className="text-[14px] text-gray-900 font-display font-bold leading-none tracking-tight">
            {title}
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] text-gray-500 font-medium leading-none">{subtitle}</span>
            {action && (
              <button className="text-[11px] font-bold text-[#16a34a] leading-none hover:text-green-700 transition-colors">
                {action}
              </button>
            )}
          </div>
        </div>
        
        <button className="flex-shrink-0 text-gray-400 hover:text-gray-600 ml-2 p-1.5 rounded-full transition-colors flex items-center justify-center bg-gray-50/50 hover:bg-gray-100">
          <X size={16} strokeWidth={2.5} />
        </button>
      </div>
      
      {/* Progress Line */}
      <div className="w-full h-[2px] mt-[6px] bg-black/[0.04] rounded-full overflow-hidden relative">
        <div 
          className="absolute top-0 left-0 h-full bg-[#16a34a] rounded-full w-full origin-left"
          style={{ animation: `drain 6s linear ${delay + 0.3}s forwards` }}
        />
      </div>
    </div>
  );
};

export default function PillMockup() {
  return (
    <div className="min-h-screen bg-[#15151D] flex items-center justify-center p-8 font-sans">
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@700&display=swap');
        
        .font-sans { font-family: 'Inter', sans-serif; }
        .font-display { font-family: 'Space Grotesk', sans-serif; }
        
        @keyframes drain {
          from { transform: scaleX(1); }
          to { transform: scaleX(0); }
        }
        @keyframes toast-enter {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}} />
      
      <div className="w-[390px] h-[844px] bg-[#F4F5F7] rounded-[44px] shadow-[0_0_0_12px_#1E1E28] ring-1 ring-white/10 relative overflow-hidden flex flex-col justify-end pb-12 gap-7">
        
        {/* Hardware details */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[32px] w-[120px] bg-[#1E1E28] rounded-b-[24px] z-20"></div>

        {/* Mockup content background */}
        <div className="absolute inset-0 z-0 p-6 flex flex-col pt-20">
          <div className="w-1/2 h-8 bg-gray-200/60 rounded-xl mb-8" />
          <div className="w-full h-32 bg-white rounded-3xl shadow-[0_2px_12px_rgba(0,0,0,0.02)] mb-4 border border-gray-100" />
          <div className="w-full h-32 bg-white rounded-3xl shadow-[0_2px_12px_rgba(0,0,0,0.02)] mb-4 border border-gray-100" />
          <div className="w-full h-32 bg-white rounded-3xl shadow-[0_2px_12px_rgba(0,0,0,0.02)] mb-4 border border-gray-100" />
        </div>

        <div className="z-10 relative flex flex-col gap-8 w-full px-5">
          <ToastPill 
            title="Oferta aceita!"
            subtitle="Acompanhe em Carteira"
            action="Acompanhar &rarr;"
            delay={0}
          />
          
          <ToastPill 
            title="Oferta aceita!"
            subtitle="Acompanhe em Carteira"
            delay={0.2}
          />
        </div>

      </div>
    </div>
  );
}
