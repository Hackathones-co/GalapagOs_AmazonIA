import { Wifi, Battery, Signal } from "lucide-react";
import { useEffect, useState } from "react";

const StatusBar = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const formatted = time.toLocaleTimeString("es-EC", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const date = time.toLocaleDateString("es-EC", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 sm:px-8 py-2 sm:py-4 pointer-events-none">
      {/* Left - Location */}
      <div className="hidden md:flex flex-1 items-center gap-2 pointer-events-auto ml-16">
        <span className="w-1.5 h-1.5 rounded-full bg-bioluminescent animate-pulse-glow" />
        <span className="font-body text-[10px] text-sand tracking-[0.15em]">
          SAN CRISTÓBAL · GALÁPAGOS · ECUADOR
        </span>
      </div>

      {/* Center - Brand */}
      <div className="flex flex-1 justify-center items-center gap-2 sm:gap-3 pointer-events-auto">
        <h1 className="font-display text-xs sm:text-sm font-semibold tracking-[0.15em] text-foreground whitespace-nowrap">
          GALAPAG<span className="text-bioluminescent">OS</span>
        </h1>
        <span className="font-body text-[8px] sm:text-[10px] text-sand tracking-widest leading-none translate-y-px whitespace-nowrap">
          AMAZON<span className="text-bioluminescent">IA</span>
        </span>
      </div>

      {/* Right - System (Time only) */}
      <div className="flex flex-1 justify-end items-center gap-2 sm:gap-4 pointer-events-auto">
        <span className="font-body text-[10px] sm:text-xs text-sand hidden sm:inline-block">{date}</span>
        <span className="font-display text-xs sm:text-sm text-foreground">{formatted}</span>
      </div>
    </header>
  );
};

export default StatusBar;
