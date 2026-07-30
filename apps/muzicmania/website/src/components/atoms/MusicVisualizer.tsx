'use client';

import React, { useEffect, useRef } from 'react';
import { useAppStore } from '@/store';

interface MusicVisualizerProps {
  className?: string;
  barColor?: string;
  barWidth?: number;
  gap?: number;
  sensitivity?: number;
}

export const MusicVisualizer: React.FC<MusicVisualizerProps> = ({
  className = '',
  barColor = '#00d4ff',
  barWidth = 4,
  gap = 2,
  sensitivity = 1.2
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null!);
  const { analyser, isMusicPlaying } = useAppStore();
  const animationRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!analyser || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      
      if (!isMusicPlaying) {
        // Subtle idle animation or clear
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
      }

      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const totalBarWidth = barWidth + gap;
      const bars = Math.floor(canvas.width / totalBarWidth);

      for (let i = 0; i < bars; i++) {
        // Map bar index to frequency range
        const freqIndex = Math.floor((i / bars) * bufferLength * 0.6); // Focus on lower/mid frequencies
        const barHeight = (dataArray[freqIndex] / 255) * canvas.height * sensitivity;

        const x = i * totalBarWidth;
        const y = canvas.height - barHeight;

        // Gradient for bars
        const gradient = ctx.createLinearGradient(0, y, 0, canvas.height);
        gradient.addColorStop(0, barColor);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = gradient;
        ctx.shadowBlur = 10;
        ctx.shadowColor = barColor;
        
        // Draw rounded bars
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, [2, 2, 0, 0]);
        ctx.fill();
      }
    };

    draw();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [analyser, isMusicPlaying, barColor, barWidth, gap, sensitivity]);

  return (
    <canvas 
      ref={canvasRef} 
      className={`w-full h-full ${className}`}
      width={800}
      height={200}
    />
  );
};
