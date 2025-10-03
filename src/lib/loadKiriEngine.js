export async function loadKiriEngine() {
  if (typeof window === 'undefined') throw new Error('Engine must run in browser');
  const w = window;
  if (w.__kiriEnginePromise) return w.__kiriEnginePromise;

  const tryLoad = (src) =>
    new Promise((resolve, reject) => {
      // Pokud je engine již dostupný globálně, okamžitě ho vrátíme.
      if (w.Engine || w.kiri?.Engine) return resolve(w.Engine || w.kiri?.Engine);

      const s = document.createElement('script');
      s.src = src;
      s.async = true;
      s.crossOrigin = 'anonymous'; // Důležité pro COEP a chybové hlášky
      s.onload = () => {
        const Engine = w.Engine || w.kiri?.Engine;
        if (!Engine) {
          return reject(new Error(`Kiri Engine script loaded from ${src}, but 'Engine' not found on window object.`));
        }
        resolve(Engine);
      };
      s.onerror = () => reject(new Error(`Failed to load script: ${src}`));
      document.head.appendChild(s);
    });

  // Promise se uloží na window objekt, aby se předešlo vícenásobnému spuštění.
  w.__kiriEnginePromise = (async () => {
    const candidates = [
      'https://grid.space/code/engine.js', // Primární zdroj z CDN
      '/kiri/engine.js',                   // Lokální záloha pro dev prostředí a offline
    ];
    
    let lastError;
    for (const src of candidates) {
      try {
        console.log(`Attempting to load Kiri Engine from: ${src}`);
        const engine = await tryLoad(src);
        console.log(`Kiri Engine successfully loaded from: ${src}`);
        return engine;
      } catch (error) {
        console.warn(`Failed to load Kiri Engine from ${src}:`, error);
        lastError = error;
      }
    }

    // Pokud selžou všechny zdroje, vyhodíme finální chybu.
    console.error("Fatal: Could not load Kiri Engine from any source.");
    throw lastError || new Error('Unable to load Kiri Engine. Check network and security policies (COEP/CORS).');
  })();

  return w.__kiriEnginePromise;
}
