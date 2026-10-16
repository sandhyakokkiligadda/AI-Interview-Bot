import React, { useEffect, useRef } from 'react';

interface VoiceWaveformProps {
  isActive: boolean;
  amplitude?: number; // 0.0 to 1.0
  color?: string;
  barsCount?: number;
}

export const VoiceWaveform: React.FC<VoiceWaveformProps> = ({
  isActive,
  amplitude = 0.5,
  color = '#6366f1',
  barsCount = 28
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let step = 0;

    const render = () => {
      step += 0.08;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;
      const barWidth = width / barsCount;

      for (let i = 0; i < barsCount; i++) {
        const x = i * barWidth;
        const normalizedPos = i / barsCount;
        // Bell curve envelope so center bars are taller
        const bellCurve = Math.sin(normalizedPos * Math.PI);

        let barHeight = 4;
        if (isActive) {
          const wave1 = Math.sin(step * 2 + i * 0.4);
          const wave2 = Math.cos(step * 1.5 + i * 0.2);
          const dynamicAmp = (Math.abs(wave1 * 0.6 + wave2 * 0.4) * amplitude + 0.15) * (height * 0.45);
          barHeight = Math.max(4, dynamicAmp * bellCurve);
        } else {
          barHeight = 4 + Math.sin(step + i * 0.3) * 2;
        }

        const gradient = ctx.createLinearGradient(0, centerY - barHeight, 0, centerY + barHeight);
        gradient.addColorStop(0, color);
        gradient.addColorStop(0.5, '#a855f7');
        gradient.addColorStop(1, '#06b6d4');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x + 2, centerY - barHeight, Math.max(2, barWidth - 3), barHeight * 2, 4);
        ctx.fill();
      }

      animRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animRef.current) {
        cancelAnimationFrame(animRef.current);
      }
    };
  }, [isActive, amplitude, color, barsCount]);

  return (
    <div className="w-full flex items-center justify-center">
      <canvas
        ref={canvasRef}
        width={320}
        height={56}
        className="w-full max-w-sm h-14 rounded-lg"
      />
    </div>
  );
};
