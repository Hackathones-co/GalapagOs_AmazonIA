import { useEffect, useRef, useState, useCallback } from "react";

interface Particle {
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  wobble: number;
  wobbleSpeed: number;
}

const PARTICLE_COUNT = 60;

const BioluminescentParticles = ({ active }: { active: boolean }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: -1, y: -1 });
  const animFrameRef = useRef<number>(0);

  const initParticles = useCallback((width: number, height: number) => {
    particlesRef.current = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random() * width,
      y: height + Math.random() * height,
      size: Math.random() * 3 + 1,
      speed: Math.random() * 0.5 + 0.2,
      opacity: Math.random() * 0.8 + 0.2,
      wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: Math.random() * 0.02 + 0.005,
    }));
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      if (particlesRef.current.length === 0) {
        initParticles(canvas.width, canvas.height);
      }
    };
    resize();
    window.addEventListener("resize", resize);

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", handleMouseMove);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (!active) {
        animFrameRef.current = requestAnimationFrame(animate);
        return;
      }

      particlesRef.current.forEach((p) => {
        p.y -= p.speed;
        p.wobble += p.wobbleSpeed;
        const wobbleX = Math.sin(p.wobble) * 30;

        // Mouse repulsion
        const dx = p.x + wobbleX - mouseRef.current.x;
        const dy = p.y - mouseRef.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        let pushX = 0, pushY = 0;
        if (dist < 120 && dist > 0) {
          const force = (120 - dist) / 120;
          pushX = (dx / dist) * force * 3;
          pushY = (dy / dist) * force * 3;
        }

        if (p.y < -20) {
          p.y = canvas.height + 20;
          p.x = Math.random() * canvas.width;
        }

        const drawX = p.x + wobbleX + pushX;
        const drawY = p.y + pushY;

        // Glow
        const gradient = ctx.createRadialGradient(drawX, drawY, 0, drawX, drawY, p.size * 4);
        gradient.addColorStop(0, `hsla(165, 100%, 47%, ${p.opacity})`);
        gradient.addColorStop(0.4, `hsla(165, 100%, 47%, ${p.opacity * 0.3})`);
        gradient.addColorStop(1, `hsla(165, 100%, 47%, 0)`);

        ctx.beginPath();
        ctx.arc(drawX, drawY, p.size * 4, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Core
        ctx.beginPath();
        ctx.arc(drawX, drawY, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(165, 100%, 70%, ${p.opacity})`;
        ctx.fill();
      });

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [active, initParticles]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-10"
      style={{ opacity: active ? 1 : 0, transition: "opacity 2s ease-in-out" }}
    />
  );
};

export default BioluminescentParticles;
