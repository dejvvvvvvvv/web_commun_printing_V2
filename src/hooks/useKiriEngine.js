// src/hooks/useKiriEngine.js
import { useEffect, useMemo, useRef, useState } from 'react';
import { loadKiriEngine } from '../lib/loadKiriEngine';

/**
 * @typedef {'idle' | 'loading' | 'sliced' | 'prepared' | 'exported' | 'error'} KiriStatus
 */

export function useKiriEngine() {
  const [ready, setReady] = useState(false);
  /** @type {[KiriStatus, React.Dispatch<React.SetStateAction<KiriStatus>>]} */
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);
  const engineRef = useRef(null);

  useEffect(() => {
    let canceled = false;
    (async () => {
      try {
        const Engine = await loadKiriEngine();
        if (canceled) return;
        const eng = new Engine();

        // Krok 5: Přidání viditelného debug výstupu listeneru
        eng.setListener?.((msg) => {
          if (msg?.slice)   console.log('[kiri] slice:', msg.slice);
          if (msg?.prepare) console.log('[kiri] prepare:', msg.prepare);
          if (msg?.export)  console.log('[kiri] export:', msg.export);
          if (msg?.slice?.end) setStatus('sliced');
          if (msg?.prepare?.done) setStatus('prepared');
          if (msg?.export?.done) setStatus('exported');
        });
        
        // běž bez renderovacího UI
        if (eng.setRender) eng.setRender(false);

        // Krok 3: Nastavení rozumného FDM process & device
        eng.setMode?.('FDM');
        
        // Krok 1: Přimíchej makra do G-code footeru
        try {
          const dev = eng.getDevice?.() || {};
          const gcode = dev.gcode || {};
          const footer = [
            '; time={time}',          // v sekundách
            '; material={material}',  // v mm (délka filamentu)
            '; layers={layers}'       // počet vrstev
          ].join('\n');
          dev.gcode = { ...gcode, post: footer, footer };
          eng.setDevice?.(dev);
        } catch (e) {
          console.warn('Kiri device/footer setup failed:', e);
        }

        eng.setDevice?.({
          extruders: 1,
          bed: { shape: 'rect', x: 220, y: 220, z: 250 },
          gcode: eng.getDevice?.().gcode, 
        });
        eng.setProcess?.({
          slice: { height: 0.2 },
          output: { nozzle: 0.4 },
          firstLayer: { height: 0.2 },
          device: { filamentDiameter: 1.75, density: 1.24 },
        });

        engineRef.current = eng;
        setReady(true);
      } catch (e) {
        setError(e?.message || String(e));
        setStatus('error');
      }
    })();
    return () => { canceled = true; };
  }, []);

  // API, které předáme komponentám
  const api = useMemo(() => ({
    isReady: ready && !!engineRef.current,
    status,
    error,

    async sliceFile(file, opts) {
      const eng = engineRef.current;
      if (!eng) throw new Error('Engine not ready');

      setStatus('loading');

      // Optional profily printeru a procesu
      if (opts?.device) eng.setDevice?.(opts.device);
      if (opts?.process) eng.setProcess?.(opts.process);

      // parse binárních dat (není nutné mít URL)
      const buf = await file.arrayBuffer();
      await eng.parse(buf);

      await eng.slice();
      await eng.prepare();
      const gcode = await eng.export(); // výstup
      setStatus('exported');
      return gcode;
    }
  }), [ready, status, error]);

  return api;
}
