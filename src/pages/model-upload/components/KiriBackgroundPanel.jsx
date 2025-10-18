// src/pages/model-upload/components/KiriBackgroundPanel.jsx
'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useKiriEngine } from '../../../hooks/useKiriEngine';

function parseGcode(gcode) {
  if (!gcode) return { time: 0, material: 0, layers: 0 };

  // Kiri footer po naší úpravě:
  // ; time=1234.56
  // ; material=789.01
  // ; layers=321

  const timeMatch = gcode.match(/^[;\s]*time\s*=\s*([\d.]+)/mi);
  const matMatch  = gcode.match(/^[;\s]*material\s*=\s*([\d.]+)/mi);
  const layMatch  = gcode.match(/^[;\s]*layers\s*=\s*(\d+)/mi);

  const seconds = timeMatch ? parseFloat(timeMatch[1]) : 0;
  const materialMM = matMatch ? parseFloat(matMatch[1]) : 0;
  const layers = layMatch ? parseInt(layMatch[1], 10) : 0;

  // přepočet mm → g (1.75mm filament, PLA ~1.24 g/cm^3)
  const filamentDiameter = 1.75; // mm
  const r = filamentDiameter / 2;
  const volumeCubicMM = Math.PI * r * r * materialMM;   // mm^3
  const volumeCubicCM = volumeCubicMM / 1000;           // cm^3
  const weightGrams = volumeCubicCM * 1.24;             // g

  return { time: seconds, material: weightGrams, layers };
}

export default function KiriBackgroundPanel({ fileToSlice, onSliceComplete, device, process }) {
  const { isReady, status, error, sliceFile } = useKiriEngine();
  const [isSlicing, setIsSlicing] = useState(false);

  const handleSlice = useCallback(async (file) => {
    if (!file || !isReady || isSlicing) return;

    try {
      setIsSlicing(true);
      console.log("Slicing started for:", file.name);
      
      const gcode = await sliceFile(file, { device, process });
      
      console.log("Slicing finished. G-code length:", gcode.length);
      const results = parseGcode(gcode);
      
      console.log("Parsed results:", results);
      onSliceComplete(results);

    } catch (err) {
      console.error("Slicing failed:", err);
      onSliceComplete({ error: err.message || 'Slicing failed' });
    } finally {
      setIsSlicing(false);
    }
  }, [isReady, isSlicing, sliceFile, onSliceComplete, device, process]);

  useEffect(() => {
    if (fileToSlice) {
      handleSlice(fileToSlice);
    }
  }, [fileToSlice, handleSlice]);

  return (
    <div style={{ display: 'none' }}>
      {/* Tento element je skrytý, engine běží na pozadí */}
      <div data-kiri-status={status} />
      {error && <div data-kiri-error>{error}</div>}
      {isSlicing && <div data-kiri-busy>Slicing...</div>}
    </div>
  );
}
