import { useEffect, useRef } from 'react';

interface Piece {
  x: number;
  y: number;
  size: number;
  color: string;
  speedX: number;
  speedY: number;
  rotation: number;
  rotSpeed: number;
  opacity: number;
}

const COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e',
  '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4',
];

export default function Confetti() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pieces = useRef<Piece[]>([]);
  const raf = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Spawn 160 pieces
    pieces.current = Array.from({ length: 160 }, () => ({
      x:        Math.random() * window.innerWidth,
      y:        Math.random() * -window.innerHeight * 0.5,
      size:     6 + Math.random() * 8,
      color:    COLORS[Math.floor(Math.random() * COLORS.length)],
      speedX:   (Math.random() - 0.5) * 4,
      speedY:   3 + Math.random() * 5,
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 8,
      opacity:  1,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;

      pieces.current.forEach(p => {
        p.x        += p.speedX;
        p.y        += p.speedY;
        p.rotation += p.rotSpeed;

        if (p.y > canvas.height * 0.7) {
          p.opacity -= 0.02;
        }
        if (p.opacity <= 0) return;
        alive = true;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        ctx.restore();
      });

      if (alive) {
        raf.current = requestAnimationFrame(draw);
      }
    };

    raf.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
    />
  );
}
