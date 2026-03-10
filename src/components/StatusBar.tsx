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
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4">
      {/* Left - Brand */}
      <div className="flex items-center gap-3">
        <h1 className="font-display text-sm font-semibold tracking-[0.15em] text-foreground">
          GALAPAG<span className="text-bioluminescent">OS</span>
        </h1>
        <span className="font-body text-[10px] text-sand tracking-widest">
          AMAZON<span className="text-bioluminescent">IA</span>
        </span>
      </div>

      {/* Center - Location */}
      <div className="hidden md:flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-bioluminescent animate-pulse-glow" />
        <span className="font-body text-[10px] text-sand tracking-[0.15em]">
          SAN CRISTÓBAL · GALÁPAGOS · ECUADOR
        </span>
      </div>

      {/* Right - System */}
      <div className="flex items-center gap-4">
        <span className="font-body text-xs text-sand">{date}</span>
        <span className="font-display text-sm text-foreground">{formatted}</span>
        <div className="flex items-center gap-2 text-sand">
          <Signal className="w-3 h-3" />
          <Wifi className="w-3 h-3" />
          <Battery className="w-3 h-3" />
        </div>
      </div>
    </header>
  );
};

export default StatusBar;
