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

        // běž bez renderovacího UI
        if (eng.setRender) eng.setRender(false);

        // posluchač průběhu (užitečné pro debug / stavový text)
        eng.setListener?.((msg) => {
          if (msg?.slice?.end) setStatus('sliced');
          if (msg?.prepare?.done) setStatus('prepared');
          if (msg?.export?.done) setStatus('exported');
          // console.debug('kiri:', msg);
        });

        // režim FDM (3D tisk) – pro CNC/laser jsou jiné
        eng.setMode?.('FDM');

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
