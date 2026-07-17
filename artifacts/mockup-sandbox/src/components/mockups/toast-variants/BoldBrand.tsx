import React, { useEffect, useState } from 'react';
import { Check, X } from 'lucide-react';

const Toast = ({ hasAction = true }: { hasAction?: boolean }) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    // animate progress from 100 to 0 over 6 seconds
    const duration = 6000;
    const interval = 50;
    const step = 100 / (duration / interval);

    const timer = setInterval(() => {
      setProgress((p) => {
        if (p - step <= 0) {
          clearInterval(timer);
          return 0;
        }
        return p - step;
      });
    }, interval);

    return () => clearInterval(timer);
  }, []);

  const circleRadius = 14;
  const circumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative flex w-full max-w-[350px] overflow-hidden rounded-[20px] bg-[#15151D] font-sans shadow-none antialiased">
      {/* Left accent column */}
      <div className="flex w-[44px] shrink-0 items-center justify-center bg-[#0f2318]">
        <Check size={20} className="text-white" strokeWidth={2.5} />
      </div>

      {/* Right content area */}
      <div className="relative flex flex-1 flex-row items-center py-[14px] pl-[14px] pr-10">
        {/* Text and Action */}
        <div className="flex-1 pr-3">
          <h3 className="font-['Space_Grotesk',sans-serif] text-[14px] font-bold tracking-tight text-white">
            Oferta aceita!
          </h3>
          <p className="mt-0.5 text-[11px] font-medium leading-[1.4] text-white/55">
            Acompanhe em Carteira
          </p>

          {hasAction && (
            <button className="mt-[8px] rounded-full bg-[#16a34a] px-[12px] py-[4px] text-[11px] font-semibold text-white transition-colors hover:bg-[#15803d]">
              Acompanhar
            </button>
          )}
        </div>

        {/* Timer / Progress */}
        <div className="relative flex h-8 w-8 shrink-0 items-center justify-center">
          <svg className="h-8 w-8 -rotate-90 transform" viewBox="0 0 36 36">
            <circle
              cx="18"
              cy="18"
              r={circleRadius}
              fill="none"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="2.5"
            />
            <circle
              cx="18"
              cy="18"
              r={circleRadius}
              fill="none"
              stroke="#16a34a"
              strokeWidth="2.5"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-[50ms] ease-linear"
            />
          </svg>
        </div>
      </div>

      {/* Dismiss Button */}
      <button className="absolute right-2.5 top-2.5 flex h-6 w-6 items-center justify-center rounded-full text-white/40 transition-colors hover:bg-white/10 hover:text-white">
        <X size={14} strokeWidth={2.5} />
      </button>
    </div>
  );
};

export default function BoldBrandMockup() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-zinc-950 p-8 font-sans">
      <div className="relative flex h-[844px] w-[390px] flex-col overflow-hidden rounded-[40px] border-[8px] border-zinc-900 bg-gradient-to-b from-[#0f0f17] to-[#15151D] shadow-2xl">
        {/* Mock App Header */}
        <div className="flex items-center justify-between px-6 pb-4 pt-12">
          <div className="h-4 w-16 rounded-full bg-white/10" />
          <div className="flex gap-2">
            <div className="h-6 w-6 rounded-full bg-white/10" />
            <div className="h-6 w-6 rounded-full bg-white/10" />
          </div>
        </div>

        {/* Mock App Content */}
        <div className="flex-1 px-6 pt-4">
          <div className="h-32 w-full rounded-2xl bg-white/5" />
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="h-24 rounded-2xl bg-white/5" />
            <div className="h-24 rounded-2xl bg-white/5" />
          </div>
          <div className="mt-4 h-48 w-full rounded-2xl bg-white/5" />
        </div>

        {/* Toast Container - Bottom Positioned */}
        <div className="absolute bottom-10 left-0 right-0 flex flex-col items-center gap-4 px-5">
          <Toast hasAction={true} />
          <Toast hasAction={false} />
        </div>

        {/* Home Indicator */}
        <div className="absolute bottom-2 left-1/2 h-1 w-1/3 -translate-x-1/2 rounded-full bg-white/20" />
      </div>
    </div>
  );
}
