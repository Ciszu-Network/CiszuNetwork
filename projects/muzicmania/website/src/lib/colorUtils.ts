export function extractAccentColor(imageUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) { resolve('#ffffff'); return; }

      const size = 64;
      canvas.width = size;
      canvas.height = size;
      ctx.drawImage(img, 0, 0, size, size);

      const imageData = ctx.getImageData(0, 0, size, size);
      const data = imageData.data;

      const colorMap = new Map<string, { count: number; sat: number }>();

      for (let i = 0; i < data.length; i += 16) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3];

        if (a < 128) continue;
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const saturation = max === 0 ? 0 : (max - min) / max;
        if (saturation < 0.15) continue;

        const key = `${Math.round(r / 24) * 24},${Math.round(g / 24) * 24},${Math.round(b / 24) * 24}`;
        const entry = colorMap.get(key);
        if (entry) entry.count++;
        else colorMap.set(key, { count: 1, sat: saturation });
      }

      if (colorMap.size === 0) { resolve('#ffffff'); return; }

      const sorted = [...colorMap.entries()].sort((a, b) => (b[1].count * b[1].sat) - (a[1].count * a[1].sat));
      const [r, g, b] = sorted[0][0].split(',').map(Number);
      resolve(`#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`);
    };
    img.onerror = () => resolve('#ffffff');
    img.src = imageUrl;
  });
}
