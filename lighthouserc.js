/** @type {import('@lhci/cli').LHCIConfig} */
module.exports = {
  ci: {
    collect: {
      urls: [
        'https://ciszunetwork.vercel.app',
        'https://cizukoantony.vercel.app',
        'https://muzicmania.vercel.app',
        'https://ciszubot.vercel.app'
      ],
      numberOfRuns: 1,
      settings: {
        preset: 'desktop',
        chromeFlags: '--no-sandbox --disable-setuid-sandbox --headless'
      }
    },
    assert: {
      assertions: {
        'categories:performance': ['warn', { minScore: 0.5 }],
        'categories:accessibility': ['warn', { minScore: 0.9 }],
        'categories:best-practices': ['warn', { minScore: 0.9 }],
        'categories:seo': ['warn', { minScore: 0.7 }],
        'largest-contentful-paint': ['warn', { maxNumericValue: 4000 }],
        'cumulative-layout-shift': ['warn', { maxNumericValue: 0.25 }],
        'interaction-to-next-paint': ['warn', { maxNumericValue: 500 }]
      }
    },
    upload: {
      target: 'temporary-public-storage'
    }
  }
};