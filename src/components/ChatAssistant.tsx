import { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";
import { api } from "@/lib/api";
import { Conversation } from "@elevenlabs/client";

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

const ChatAssistant = ({ onClose }: { onClose?: () => void }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: EXAMPLE_RESPONSES.default },
  ]);
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<"chat" | "call">("chat");
  const [isLoading, setIsLoading] = useState(false);
  const [callState, setCallState] = useState<"idle" | "connecting" | "active">("idle");
  const [conversation, setConversation] = useState<any>(null); // holds the active SDK session
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mode === "chat") {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [messages, mode]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (conversation) {
        conversation.endSession().catch(console.error);
      }
    };
  }, [conversation]);

  // Detect the right module from the user input
  const detectModule = (text: string): string => {
    const lower = text.toLowerCase();
    if (lower.includes("pesc") || lower.includes("mar") || lower.includes("jurel")) return "pesca";
    if (lower.includes("siembr") || lower.includes("rieg") || lower.includes("agro") || lower.includes("cultiv")) return "agro";
    if (lower.includes("tortug") || lower.includes("nido") || lower.includes("conserv") || lower.includes("fauna")) return "bio";
    if (lower.includes("riesgo") || lower.includes("inund") || lower.includes("alert") || lower.includes("emergencia")) return "risk";
    if (lower.includes("visita") || lower.includes("turis") || lower.includes("activi")) return "visit";
    return "pesca";
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg: Message = { role: "user", content: input };
    const sentInput = input;
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const module = detectModule(sentInput);
      const data = await api.chat(sentInput, module);
      setMessages((prev) => [...prev, { role: "assistant", content: data.response }]);
    } catch {
      // Fallback to local responses if API is unavailable
      setMessages((prev) => [...prev, { role: "assistant", content: getResponse(sentInput) }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartCall = async () => {
    setCallState("connecting");
    try {
      // 1. Request mic access early so the browser prompts the user immediately
      await navigator.mediaDevices.getUserMedia({ audio: true });

      // 2. Fetch signed WSS URL and live snapshot from our backend
      const data = await api.voiceSignedUrl();

      console.info("[Voice] Using signed URL from backend.");

      // 3. Start native ElevenLabs SDK session, injecting live data as dynamicVariables
      const conv = await Conversation.startSession({
        signedUrl: data.url,
        dynamicVariables: data.dynamic_variables,
        onConnect: () => {
          console.info("[Voice] Connected to agent directly.");
          setCallState("active");
        },
        onDisconnect: () => {
          console.info("[Voice] Disconnected.");
          setCallState("idle");
          setConversation(null);
        },
        onError: (err) => {
          console.error("[Voice] Error:", err);
          setCallState("idle");
          setConversation(null);
        }
      });

      setConversation(conv);
    } catch (err) {
      console.error("Failed to start call:", err);
      setCallState("idle");
    }
  };

  const handleEndCall = async () => {
    if (conversation) {
      try {
        await conversation.endSession();
      } catch (e) {
        console.error(e);
      }
      setConversation(null);
    }
    setCallState("idle");
    setMode("chat");
  };


  return (
    <div className="flex flex-col h-full bg-card">
      {/* Header */}
      <div className="p-3 border-b border-border bg-muted/20 flex flex-col gap-3 relative">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-sand hover:text-foreground transition-colors p-1"
            aria-label="Cerrar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        )}

        <div>
          <h3 className="font-display text-[11px] text-foreground tracking-[0.15em]">
            ASISTENTE GALAPAG<span className="text-bioluminescent">OS</span>
          </h3>
          <p className="font-body text-[9px] text-sand mt-0.5">
            IA CONVERSACIONAL · EN TIEMPO REAL
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="flex bg-background border border-border rounded-lg p-0.5 mt-1">
          <button
            onClick={() => setMode("chat")}
            className={`flex-1 py-1.5 text-[10px] font-display font-medium rounded-md transition-all ${mode === "chat" ? "bg-primary text-primary-foreground shadow-sm" : "text-sand hover:text-foreground"
              }`}
          >
            CHAT
          </button>
          <button
            onClick={() => setMode("call")}
            className={`flex-1 py-1.5 text-[10px] font-display font-medium rounded-md transition-all ${mode === "call" ? "bg-primary text-primary-foreground shadow-sm" : "text-sand hover:text-foreground"
              }`}
          >
            LLAMADA
          </button>
        </div>
      </div>

      {mode === "chat" ? (
        <>
          {/* Suggested queries */}
          <div className="px-3 py-2 flex flex-wrap gap-1.5 bg-muted/10 border-b border-border">
            {["¿Marea hoy?", "Clima actual", "Nidos"].map((q) => (
              <button
                key={q}
                onClick={() => { setInput(q); }}
                className="font-body text-[9px] text-sand px-2 py-1 bg-background border border-border rounded-full hover:border-bioluminescent hover:text-bioluminescent transition-colors"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl ${msg.role === "user"
                  ? "bg-primary/10 border border-primary/20 rounded-tr-sm"
                  : "bg-muted/50 border border-border rounded-tl-sm"
                  }`}>
                  {msg.role === "assistant" && (
                    <span className="font-display text-[8px] text-primary tracking-widest block mb-1">
                      GALÁPAGOS AI
                    </span>
                  )}
                  <p className="font-body text-xs text-foreground/90 leading-relaxed">{msg.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted/50 border border-border rounded-2xl rounded-tl-sm p-3">
                  <span className="font-display text-[8px] text-primary tracking-widest block mb-1">GALÁPAGOS AI</span>
                  <div className="flex gap-1 items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-3 border-t border-border bg-background">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Escribe un mensaje..."
                className="flex-1 bg-muted/50 px-3 py-2 rounded-full font-body text-xs text-foreground placeholder:text-sand/50 border border-border focus:border-primary focus:outline-none transition-colors"
              />
              <button
                onClick={handleSend}
                className="p-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/80 transition-transform hover:scale-105"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </>
      ) : (
        /* Call Mode */
        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gradient-to-b from-card to-background relative overflow-hidden">
          {/* Pulsing rings background */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-32 h-32 rounded-full border border-primary/20 animate-ping" style={{ animationDuration: '3s' }} />
            <div className="absolute w-48 h-48 rounded-full border border-primary/10 animate-ping" style={{ animationDuration: '3s', animationDelay: '1s' }} />
            <div className="absolute w-64 h-64 rounded-full border border-primary/5 animate-ping" style={{ animationDuration: '3s', animationDelay: '2s' }} />
          </div>

          <div className="relative z-10 flex flex-col items-center">
            <div className="w-24 h-24 rounded-full bg-primary/10 border-4 border-card shadow-xl mb-6 flex items-center justify-center">
              <span className="font-display text-2xl font-bold text-primary">AI</span>
            </div>

            <h4 className="font-display text-sm text-foreground tracking-widest mb-2">GALÁPAGOS AI</h4>
            <p className="font-body text-xs text-sand animate-pulse">
              {callState === "connecting" ? "Conectando..." : callState === "active" ? "Escuchando..." : "Iniciar llamada"}
            </p>

            {/* Call Controls */}
            <div className="mt-12 flex items-center gap-6">
              {callState === "idle" ? (
                <button
                  onClick={handleStartCall}
                  className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-lg hover:scale-105 transition-all"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                </button>
              ) : (
                <>
                  <button className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-foreground hover:bg-muted/80 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" x2="12" y1="19" y2="22"></line></svg>
                  </button>
                  <button
                    onClick={handleEndCall}
                    className="w-14 h-14 rounded-full bg-destructive flex items-center justify-center text-destructive-foreground shadow-lg hover:bg-destructive/90 hover:scale-105 transition-all"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'rotate(135deg)' }}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatAssistant;
