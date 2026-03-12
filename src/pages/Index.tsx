import { useState, useEffect, useCallback } from "react";
import StatusBar from "@/components/StatusBar";
import HomeDashboard from "@/components/HomeDashboard";
import BioluminescentParticles from "@/components/BioluminescentParticles";
import NavigationBar, { type View } from "@/components/NavigationBar";
import SanCristobalMap from "@/components/SanCristobalMap";
import WeatherDashboard from "@/components/WeatherDashboard";
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
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="relative z-20 w-full h-full"
            >
              <HomeDashboard onStationClick={handleStationClick} />
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
              className="w-full h-full pt-14"
            >
              <VerticalsGrid onStationClick={handleStationClick} />
            </motion.div>
          )}

          {/* HISTORICAL */}
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

      {/* Floating Chatbot Button */}
      <button
        onClick={() => setIsChatOpen(!isChatOpen)}
        className="fixed bottom-20 md:bottom-8 right-8 z-50 p-0 rounded-full bg-primary text-primary-foreground shadow-bioluminescent hover:scale-110 transition-transform overflow-hidden"
      >
        <img src={assistantIcon} alt="Assistant" className="w-20 h-20" />
      </button>

      {/* Floating Chatbot Popup */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-36 md:bottom-24 right-8 z-50 w-[350px] h-[500px] bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          >
            <ChatAssistant onClose={() => setIsChatOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Index;
