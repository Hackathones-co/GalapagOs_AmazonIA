import { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const EXAMPLE_RESPONSES: Record<string, string> = {
  default: "Hola, soy el asistente de GalápagOS. Puedo ayudarte con información meteorológica, predicciones y recomendaciones para pescadores, agricultores, conservacionistas y turistas. ¿En qué puedo ayudarte?",
  pescar: "Compa, mañana sale bueno para salir entre 5AM y 10AM. El viento está del norte a 8 km/h con oleaje bajo. Después del mediodía se viene viento del sur a 18 km/h — mejor regresa antes. Índice de Pesca: 78/100 🟢. Llévate agua y protector.",
  llover: "Para las próximas 6 horas: probabilidad de lluvia en El Junco es del 45%, con acumulado estimado de 3-5mm. En la zona costera (El Mirador) la probabilidad baja al 20%. Recomiendo llevar impermeable si vas a la zona alta.",
  sembrar: "Don José, esta semana no riegue el tomate — el suelo ya tiene buena humedad (42% VW) y hay pronóstico de 8mm para el jueves. El modelo indica que las condiciones son óptimas para sembrar café en Cerro Alto esta quincena.",
  tortuga: "Alerta: Precipitación acumulada prevista de 35mm en 24h para zona costera. Se recomienda revisión de nidos de tortuga marina en playa Lobería. La temporada de anidación está activa (Dic-Abr). 3 nidos identificados en zona de riesgo.",
  riesgo: "El modelo predice 28mm en las próximas 6 horas con suelo ya al 65% de saturación en zona media. Nivel de alerta: VIGILANCIA (nivel 2/4). Comparable al evento del 15 de marzo 2023. Recomendación: monitorear quebradas en la zona baja de Puerto Baquerizo.",
};

const getResponse = (input: string): string => {
  const lower = input.toLowerCase();
  if (lower.includes("pesc") || lower.includes("mar") || lower.includes("jurel")) return EXAMPLE_RESPONSES.pescar;
  if (lower.includes("lluv") || lower.includes("llover") || lower.includes("clima")) return EXAMPLE_RESPONSES.llover;
  if (lower.includes("siembr") || lower.includes("rieg") || lower.includes("agr") || lower.includes("cultiv")) return EXAMPLE_RESPONSES.sembrar;
  if (lower.includes("tortug") || lower.includes("nido") || lower.includes("conserv") || lower.includes("fauna")) return EXAMPLE_RESPONSES.tortuga;
  if (lower.includes("riesgo") || lower.includes("inund") || lower.includes("alert") || lower.includes("emergencia")) return EXAMPLE_RESPONSES.riesgo;
  return EXAMPLE_RESPONSES.default;
};

const ChatAssistant = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: EXAMPLE_RESPONSES.default },
  ]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    // Simulate response delay
    setTimeout(() => {
      setMessages((prev) => [...prev, { role: "assistant", content: getResponse(input) }]);
    }, 800);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h3 className="font-display text-[11px] text-foreground tracking-[0.15em]">
          ASISTENTE GALAPAG<span className="text-bioluminescent">OS</span>
        </h3>
        <p className="font-body text-[9px] text-sand mt-1">
          IA CONVERSACIONAL · RAG + PREDICCIONES EN TIEMPO REAL
        </p>
      </div>

      {/* Suggested queries */}
      <div className="px-4 py-2 flex flex-wrap gap-1.5">
        {["¿Puedo ir a pescar mañana?", "¿Va a llover?", "Estado de nidos de tortuga", "Nivel de riesgo actual"].map((q) => (
          <button
            key={q}
            onClick={() => { setInput(q); }}
            className="font-body text-[9px] text-sand px-2 py-1 border border-border hover:border-bioluminescent hover:text-bioluminescent transition-colors"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] p-3 ${
              msg.role === "user"
                ? "bg-bioluminescent/10 border border-bioluminescent/20"
                : "bg-muted/30"
            }`}>
              {msg.role === "assistant" && (
                <span className="font-display text-[8px] text-bioluminescent tracking-widest block mb-1">
                  GALÁPAGOS AI
                </span>
              )}
              <p className="font-body text-xs text-foreground/90 leading-relaxed">{msg.content}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Pregunta sobre clima, pesca, agricultura..."
            className="flex-1 bg-muted/30 px-3 py-2 font-body text-xs text-foreground placeholder:text-sand/50 border border-border focus:border-bioluminescent focus:outline-none transition-colors"
          />
          <button
            onClick={handleSend}
            className="p-2 bg-bioluminescent text-primary-foreground hover:bg-bioluminescent/80 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatAssistant;
