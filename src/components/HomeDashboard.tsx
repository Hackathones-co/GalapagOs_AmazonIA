const HomeDashboard = ({ onStationClick }: { onStationClick?: (station: string) => void }) => {
  return (
    <div className="w-full h-full bg-background overflow-hidden flex items-center justify-center p-8">
      <div className="max-w-2xl text-center">
        <h1 className="font-display text-4xl text-foreground mb-6 tracking-[0.1em]">
          GALÁPAGOS
        </h1>
        
        <p className="font-display text-2xl text-bioluminescent mb-8 leading-relaxed">
          Sistema Inteligente de Alerta Temprana
        </p>

        <div className="space-y-6 text-left text-sand/80 leading-loose">
          <p className="font-body text-sm">
            Las Islas Galápagos enfrentan desafíos climáticos sin precedentes. Los eventos de precipitación extrema pueden devastar ecosistemas únicos y amenazar la biodiversidad endémica que ha evolucionado durante millones de años.
          </p>

          <p className="font-body text-sm">
            <span className="text-bioluminescent font-semibold">GalapagOs</span> utiliza inteligencia artificial para predecir patrones de precipitación con precisión nunca antes alcanzada en el archipiélago. Nuestro modelo, entrenado con datos meteorológicos de alta resolución, permite a las autoridades ambientales tomar decisiones proactivas.
          </p>
        </div>

        <div className="mt-12 pt-8 border-t border-border/30">
          <p className="font-body text-xs text-sand/50 tracking-[0.15em] uppercase">
            Explora los módulos especializados en la navegación
          </p>
        </div>
      </div>
    </div>
  );
};

export default HomeDashboard;
