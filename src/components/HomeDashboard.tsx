const HomeDashboard = ({ onStationClick }: { onStationClick?: (station: string) => void }) => {
  return (
    <div className="w-full h-full bg-background overflow-y-auto flex items-center justify-center p-4 sm:p-8">
      <div className="max-w-2xl text-center pt-8 md:pt-0">
        <h1 className="font-display text-2xl sm:text-4xl text-foreground mb-4 sm:mb-6 tracking-[0.1em]">
          GALÁPAGOS
        </h1>

        <p className="font-display text-lg sm:text-2xl text-bioluminescent mb-6 sm:mb-8 leading-relaxed">
          Sistema Inteligente de Alerta Temprana
        </p>

        <div className="space-y-4 sm:space-y-6 text-left text-sand/80 leading-loose">
          <p className="font-body text-xs sm:text-sm">
            Las Islas Galápagos enfrentan desafíos climáticos sin precedentes. Los eventos de precipitación extrema pueden devastar ecosistemas únicos y amenazar la biodiversidad endémica que ha evolucionado durante millones de años.
          </p>

          <p className="font-body text-xs sm:text-sm">
            <span className="text-bioluminescent font-semibold">GalapagOs</span> utiliza inteligencia artificial para predecir patrones de precipitación con precisión nunca antes alcanzada en el archipiélago. Nuestro modelo, entrenado con datos meteorológicos de alta resolución, permite a las autoridades ambientales tomar decisiones proactivas.
          </p>
        </div>

        <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-border/30">
          <p className="font-body text-[10px] sm:text-xs text-sand/50 tracking-[0.15em] uppercase mb-4 sm:mb-6">
            Acceso rápido
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <a
              href="#rainfall"
              onClick={(e) => {
                e.preventDefault();
                window.dispatchEvent(new CustomEvent('navigate', { detail: 'rainfall' }));
              }}
              className="group relative px-6 py-3 sm:px-8 sm:py-4 bg-bioluminescent/10 border border-bioluminescent/30 hover:bg-bioluminescent/20 transition-all duration-300 overflow-hidden"
            >
              <div className="absolute inset-0 bg-bioluminescent/5 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <div className="relative flex items-center justify-center gap-3">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-bioluminescent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                </svg>
                <span className="font-display text-xs sm:text-sm text-bioluminescent tracking-[0.15em]">
                  PREDICCIÓN DE LLUVIAS
                </span>
              </div>
            </a>
            <a
              href="#map"
              onClick={(e) => {
                e.preventDefault();
                window.dispatchEvent(new CustomEvent('navigate', { detail: 'map' }));
              }}
              className="group relative px-6 py-3 sm:px-8 sm:py-4 bg-sand/10 border border-sand/30 hover:bg-sand/20 transition-all duration-300 overflow-hidden"
            >
              <div className="absolute inset-0 bg-sand/5 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <div className="relative flex items-center justify-center gap-3">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-sand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                <span className="font-display text-xs sm:text-sm text-sand tracking-[0.15em]">
                  MAPA INTERACTIVO
                </span>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeDashboard;
