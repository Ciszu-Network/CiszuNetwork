'use client';

import { useEffect, useRef } from 'react';

export default function PhaserPrototype() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let game: any;
    let mounted = true;

    const init = async () => {
      const Phaser = (await import('phaser')).default;
      if (!mounted || !containerRef.current) return;

      const scene: any = {
        key: 'RhythmPrototype',
        create() {
          this.add.text(100, 100, 'Phaser prototype ready', { color: '#00ffa3', fontSize: '24px' });
        },
        update() {
          // Prototype loop placeholder
        },
      };

      game = new Phaser.Game({
        type: Phaser.AUTO,
        width: 640,
        height: 480,
        parent: containerRef.current,
        backgroundColor: '#000a1a',
        scene,
      });
    };

    init();

    return () => {
      mounted = false;
      if (game) {
        game.destroy(true);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full"
    />
  );
}
