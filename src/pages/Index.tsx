import { useState, useEffect, useCallback } from "react";
import StatusBar from "@/components/StatusBar";
import TortoiseSilhouette from "@/components/TortoiseSilhouette";
import BioluminescentParticles from "@/components/BioluminescentParticles";
import NavigationBar, { type View } from "@/components/NavigationBar";
import SanCristobalMap from "@/components/SanCristobalMap";
import WeatherDashboard from "@/components/WeatherDashboard";
import ChatAssistant from "@/components/ChatAssistant";
import { verticals, VerticalCard, VerticalDetail } from "@/components/Verticals";
import { motion, AnimatePresence } from "framer-motion";

const IDLE_TIMEOUT = 60000;

const Index = () => {
  const [isIdle, setIsIdle] = useState(false);
  const [currentView, setCurrentView] = useState<View>("home");
  const [selectedStation, setSelectedStation] = useState<string | undefined>();
  const [activeVertical, setActiveVertical] = useState(verticals[0].id);

  const resetIdle = useCallback(() => setIsIdle(false), []);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const startTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(() => setIsIdle(true), IDLE_TIMEOUT);
    };
    const handleActivity = () => { resetIdle(); startTimer(); };
    window.addEventListener("mousemove", handleActivity);
    window.addEventListener("keydown", handleActivity);
    window.addEventListener("touchstart", handleActivity);
    startTimer();
    return () => {
      clearTimeout(timer);
      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("keydown", handleActivity);
      window.removeEventListener("touchstart", handleActivity);
    };
  }, [resetIdle]);

  const handleStationClick = (station: string) => {
    setSelectedStation(station);
    setCurrentView("dashboard");
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-background">
      <StatusBar />
      <BioluminescentParticles active={isIdle && currentView === "home"} />
      <NavigationBar currentView={currentView} onViewChange={setCurrentView} />

      {/* Content area - offset for nav */}
      <div className="md:ml-16 h-full pb-14 md:pb-0">
        <AnimatePresence mode="wait">
          {/* HOME */}
          {currentView === "home" && (
            <motion.main
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: isIdle ? 0.15 : 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="relative z-20 w-full h-full flex flex-col items-center justify-center px-8"
            >
              <div className="absolute top-20 left-8">
                <p className="font-body text-[10px] text-sand tracking-[0.2em] mb-1">
                  SISTEMA INTELIGENTE DE ALERTA TEMPRANA
                </p>
                <p className="font-body text-[10px] text-sand/50 tracking-[0.15em]">
                  GESTIÓN AMBIENTAL · ISLAS GALÁPAGOS
                </p>
              </div>

              <div className="w-full max-w-5xl h-[60vh]">
                <TortoiseSilhouette />
              </div>

              <div className="absolute bottom-20 md:bottom-8 left-1/2 -translate-x-1/2 text-center">
                <p className="font-body text-[10px] text-sand/40 tracking-[0.3em]">
                  EXPLORA LAS ZONAS PARA DESCUBRIR LOS HÁBITATS DEL SISTEMA
                </p>
              </div>

              <div className="absolute bottom-20 md:bottom-8 right-8 flex flex-col gap-1 items-end">
                {["Cerro Alto", "El Junco", "Merceditas", "El Mirador"].map((station) => (
                  <div key={station} className="flex items-center gap-2">
                    <span className="font-body text-[9px] text-sand/60 tracking-wider">
                      {station.toUpperCase()}
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-bioluminescent/60" />
                  </div>
                ))}
              </div>
            </motion.main>
          )}

          {/* MAP */}
          {currentView === "map" && (
            <motion.div
              key="map"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full h-full pt-14"
            >
              <SanCristobalMap onStationClick={handleStationClick} />
            </motion.div>
          )}

          {/* DASHBOARD */}
          {currentView === "dashboard" && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full h-full pt-14 overflow-y-auto"
            >
              <WeatherDashboard station={selectedStation} />
            </motion.div>
          )}

          {/* VERTICALS */}
          {currentView === "verticals" && (
            <motion.div
              key="verticals"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full h-full pt-14 flex flex-col md:flex-row"
            >
              {/* Sidebar list */}
              <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-border overflow-x-auto md:overflow-y-auto flex md:flex-col">
                <div className="hidden md:block p-4">
                  <h2 className="font-display text-[10px] text-foreground tracking-[0.15em]">
                    MÓDULOS VERTICALES
                  </h2>
                  <p className="font-body text-[9px] text-sand mt-1">5 APLICACIONES ESPECIALIZADAS</p>
                </div>
                {verticals.map((v) => (
                  <VerticalCard
                    key={v.id}
                    vertical={v}
                    isActive={activeVertical === v.id}
                    onClick={() => setActiveVertical(v.id)}
                  />
                ))}
              </div>
              {/* Detail */}
              <div className="flex-1 overflow-y-auto">
                <VerticalDetail vertical={verticals.find((v) => v.id === activeVertical)!} />
              </div>
            </motion.div>
          )}

          {/* CHAT */}
          {currentView === "chat" && (
            <motion.div
              key="chat"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full h-full pt-14 max-w-2xl mx-auto"
            >
              <ChatAssistant />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Index;
