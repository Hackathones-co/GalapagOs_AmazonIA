import { useState, useEffect, useCallback } from "react";
import StatusBar from "@/components/StatusBar";
import TortoiseSilhouette from "@/components/TortoiseSilhouette";
import BioluminescentParticles from "@/components/BioluminescentParticles";

const IDLE_TIMEOUT = 60000; // 60 seconds

const Index = () => {
  const [isIdle, setIsIdle] = useState(false);

  const resetIdle = useCallback(() => {
    setIsIdle(false);
  }, []);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    const startTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(() => setIsIdle(true), IDLE_TIMEOUT);
    };

    const handleActivity = () => {
      resetIdle();
      startTimer();
    };

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

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-background">
      <StatusBar />
      <BioluminescentParticles active={isIdle} />

      {/* Main content - Tortoise habitat interface */}
      <main
        className="relative z-20 w-full h-full flex flex-col items-center justify-center px-8 transition-opacity duration-[2000ms]"
        style={{ opacity: isIdle ? 0.15 : 1 }}
      >
        {/* Subtitle */}
        <div className="absolute top-20 left-8">
          <p className="font-body text-[10px] text-sand tracking-[0.2em] mb-1">
            SISTEMA INTELIGENTE DE ALERTA TEMPRANA
          </p>
          <p className="font-body text-[10px] text-sand/50 tracking-[0.15em]">
            GESTIÓN AMBIENTAL · ISLAS GALÁPAGOS
          </p>
        </div>

        {/* Tortoise interface */}
        <div className="w-full max-w-5xl h-[60vh]">
          <TortoiseSilhouette />
        </div>

        {/* Bottom instruction */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center">
          <p className="font-body text-[10px] text-sand/40 tracking-[0.3em]">
            EXPLORA LAS ZONAS PARA DESCUBRIR LOS HÁBITATS DEL SISTEMA
          </p>
        </div>

        {/* Station indicators */}
        <div className="absolute bottom-8 right-8 flex flex-col gap-1 items-end">
          {["Cerro Alto", "El Junco", "Merceditas", "El Mirador"].map((station) => (
            <div key={station} className="flex items-center gap-2">
              <span className="font-body text-[9px] text-sand/60 tracking-wider">
                {station.toUpperCase()}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-bioluminescent/60" />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Index;
