import { useState } from "react";
import { Map, BarChart3, MessageCircle, Layers, Home } from "lucide-react";

type View = "home" | "map" | "dashboard" | "verticals" | "chat";

const NavigationBar = ({
  currentView,
  onViewChange,
}: {
  currentView: View;
  onViewChange: (view: View) => void;
}) => {
  const items: { id: View; label: string; icon: React.ReactNode }[] = [
    { id: "home", label: "INICIO", icon: <Home className="w-4 h-4" /> },
    { id: "map", label: "MAPA", icon: <Map className="w-4 h-4" /> },
    { id: "dashboard", label: "DATOS", icon: <BarChart3 className="w-4 h-4" /> },
    { id: "verticals", label: "MÓDULOS", icon: <Layers className="w-4 h-4" /> },
    { id: "chat", label: "ASISTENTE", icon: <MessageCircle className="w-4 h-4" /> },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-sm border-t border-border md:top-0 md:bottom-auto md:left-auto md:right-auto md:w-16 md:h-screen md:border-t-0 md:border-r">
      <div className="flex md:flex-col items-center justify-around md:justify-start md:pt-20 md:gap-2 h-14 md:h-auto">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`flex flex-col items-center gap-0.5 p-2 transition-colors ${
              currentView === item.id
                ? "text-bioluminescent"
                : "text-sand hover:text-foreground"
            }`}
          >
            {item.icon}
            <span className="font-display text-[7px] tracking-[0.1em]">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default NavigationBar;
export type { View };
