
import React, { useEffect, useState, useRef } from 'react';
import { useKiriEngine } from '../../../hooks/useKiriEngine';

const KiriBackgroundPanel = ({ fileToSlice, onSliceComplete, device, process }) => {
  const { isReady, sliceFile, error: engineError } = useKiriEngine();
  const [internalStatus, setInternalStatus] = useState('idle');
  const [processingError, setProcessingError] = useState(null);

  // Ref pro sledování, zda již byl pro daný soubor spuštěn slicing
  const slicedFileRef = useRef(null);

  useEffect(() => {
    // Pokud engine není připraven, nebo pokud neexistuje soubor k slicování, nic neděláme.
    if (!isReady || !fileToSlice) {
      return;
    }

    // Zabráníme znovuspuštění pro stejný soubor, pokud se komponenta překreslí
    if (slicedFileRef.current === fileToSlice.name) {
      return;
    }

    const performSlice = async () => {
      setInternalStatus('processing');
      setProcessingError(null);
      slicedFileRef.current = fileToSlice.name; // Označíme soubor jako zpracovávaný
      
      console.log("Slicing started for:", fileToSlice.name);

      try {
        const gcode = await sliceFile(fileToSlice, { device, process });
        console.log(`G-code generated, length: ${gcode.length}`);

        // Parsování G-kódu pro odhadované hodnoty
        const parseGcode = (gcode) => {
            const lines = gcode.split('\n');
            let time = 0;
            let material = 0;
            let layers = 0;
            const filamentDiameter = device.filament_diameter || 1.75;
            const density = 1.24; // g/cm^3 pro PLA
            
            lines.forEach(line => {
                if (line.startsWith('; estimated printing time (normal mode)')) {
                    const timeMatch = line.match(/(\d+h)?\s*(\d+m)?\s*(\d+s)?/);
                    if (timeMatch) {
                        const hours = parseInt(timeMatch[1] || '0', 10);
                        const minutes = parseInt(timeMatch[2] || '0', 10);
                        const seconds = parseInt(timeMatch[3] || '0', 10);
                        time = hours * 3600 + minutes * 60 + seconds;
                    }
                } else if (line.startsWith('; filament used [mm]')) {
                    const materialMatch = line.match(/([\d.]+)/);
                    if (materialMatch) {
                        const lengthInMm = parseFloat(materialMatch[1]);
                        const radius = filamentDiameter / 2;
                        const volumeCm3 = (Math.PI * radius * radius * lengthInMm) / 1000;
                        material = volumeCm3 * density; // v gramech
                    }
                } else if (line.startsWith(';LAYER_COUNT:')) {
                    const layerMatch = line.match(/(\d+)/);
                    if (layerMatch) {
                        layers = parseInt(layerMatch[1], 10);
                    }
                }
            });

            return { time, material, layers, gcode };
        };

        const results = parseGcode(gcode);
        console.log("Parsed results:", results);
        (onSliceComplete || (() => {}))(results);
        setInternalStatus('completed');

      } catch (err) {
        console.error("Slicing failed:", err);
        const errorMessage = err.message || 'An unknown error occurred during slicing.';
        setProcessingError(errorMessage);
        (onSliceComplete || (() => {}))({ error: errorMessage });
        setInternalStatus('failed');
      }
    };

    performSlice();

  }, [isReady, fileToSlice, sliceFile, onSliceComplete, device, process]);

  const error = engineError || processingError;

  return (
    <> 
      {/* Zobrazí chybu v rohu obrazovky pro snadné ladění */}
      {error && (
        <div style={{
          position: 'fixed',
          bottom: '8px',
          left: '8px',
          background: '#fee',
          padding: '8px 12px',
          border: '1px solid #f99',
          borderRadius: '8px',
          zIndex: 9999,
          fontSize: '12px',
          maxWidth: '300px'
        }}>
          <b>Kiri Engine Error:</b> {String(error)}
        </div>
      )}
    </>
  );
};

export default KiriBackgroundPanel;
