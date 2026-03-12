import { useState, useEffect, useCallback } from "react";
import StatusBar from "@/components/StatusBar";
import HomeDashboard from "@/components/HomeDashboard";
import BioluminescentParticles from "@/components/BioluminescentParticles";
import NavigationBar, { type View } from "@/components/NavigationBar";
import SanCristobalMap from "@/components/SanCristobalMap";
import RainfallDashboard from "@/components/RainfallDashboard";
import ChatAssistant from "@/components/ChatAssistant";
import assistantIcon from "@/assets/assistant.png";
import { VerticalsGrid } from "@/components/Verticals";
import HistoricalDashboard from "@/components/HistoricalDashboard";
import { motion, AnimatePresence } from "framer-motion";

const IDLE_TIMEOUT = 60000;

const Index = () => {
  const [isIdle, setIsIdle] = useState(false);
  const [currentView, setCurrentView] = useState<View>("home");
  const [selectedStation, setSelectedStation] = useState<string | undefined>();
  const [isChatOpen, setIsChatOpen] = useState(false);

  const resetIdle = useCallback(() => setIsIdle(false), []);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const startTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(() => setIsIdle(true), IDLE_TIMEOUT);
    };
    const handleActivity = () => { resetIdle(); startTimer(); };

    const handleNavigate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        setCurrentView(customEvent.detail as View);
      }
    };

    window.addEventListener("mousemove", handleActivity);
    window.addEventListener("keydown", handleActivity);
    window.addEventListener("touchstart", handleActivity);
    window.addEventListener("navigate", handleNavigate);
    startTimer();
    return () => {
      clearTimeout(timer);
      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("keydown", handleActivity);
      window.removeEventListener("touchstart", handleActivity);
      window.removeEventListener("navigate", handleNavigate);
    };
  }, [resetIdle]);

  const handleStationClick = (station: string) => {
    setSelectedStation(station);
    setCurrentView("rainfall");
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-background">
      <StatusBar />
      <BioluminescentParticles active={isIdle && currentView === "home"} />
      <NavigationBar currentView={currentView} onViewChange={setCurrentView} />

      <div className="md:ml-16 h-full pb-14 md:pb-0">
        <AnimatePresence mode="wait">
          {currentView === "home" && (
            <motion.main
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="relative z-20 w-full h-full"
            >
              <HomeDashboard onStationClick={handleStationClick} />
            </motion.main>
          )}

          {currentView === "rainfall" && (
            <motion.div
              key="rainfall"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full h-full pt-14 overflow-y-auto"
            >
              <RainfallDashboard />
            </motion.div>
          )}

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

          {currentView === "verticals" && (
            <motion.div
              key="verticals"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full h-full pt-14"
            >
              <VerticalsGrid onStationClick={handleStationClick} />
            </motion.div>
          )}

          {currentView === "historical" && (
            <motion.div
              key="historical"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full h-full pt-14 overflow-y-auto"
            >
              <HistoricalDashboard />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <button
        onClick={() => setIsChatOpen(!isChatOpen)}
        className="fixed bottom-20 md:bottom-8 right-8 z-50 p-0 rounded-full bg-primary text-primary-foreground shadow-bioluminescent hover:scale-110 transition-transform overflow-hidden"
      >
        <img src={assistantIcon} alt="Assistant" className="w-20 h-20" />
      </button>

      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 md:inset-auto md:bottom-24 md:right-8 z-50 w-full h-full md:w-[350px] md:h-[500px] bg-card border-none md:border md:border-border md:rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          >
            <ChatAssistant onClose={() => setIsChatOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Index;
