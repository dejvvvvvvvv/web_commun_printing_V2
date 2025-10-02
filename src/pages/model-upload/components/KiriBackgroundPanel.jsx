// src/pages/model-upload/components/KiriBackgroundPanel.jsx
'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useKiriEngine } from '../../../hooks/useKiriEngine';

// Funkce pro parsování G-kódu a extrakci metadat
function parseGcode(gcode) {
  if (!gcode) return { time: 0, material: 0, layers: 0 };

  const timeMatch = gcode.match(/; estimated printing time \(normal mode\) = (?:(\d+)h )?(?:(\d+)m )?(\d+)s/);
  const materialMatch = gcode.match(/; filament used \(mm\) = (\d+\.\d+)/);
  const layerMatch = gcode.match(/; LAYER_COUNT:(\d+)/);
  
  let totalSeconds = 0;
  if (timeMatch) {
    totalSeconds += timeMatch[1] ? parseInt(timeMatch[1], 10) * 3600 : 0; // hours
    totalSeconds += timeMatch[2] ? parseInt(timeMatch[2], 10) * 60 : 0;   // minutes
    totalSeconds += timeMatch[3] ? parseInt(timeMatch[3], 10) : 0;        // seconds
  }

  const materialMM = materialMatch ? parseFloat(materialMatch[1]) : 0;
  
  // Převod délky filamentu (mm) na hmotnost (g)
  // hustota PLA = ~1.24 g/cm^3, průměr filamentu 1.75mm
  const filamentDiameter = 1.75; // mm
  const filamentRadius = filamentDiameter / 2;
  const volumeCubicMM = Math.PI * Math.pow(filamentRadius, 2) * materialMM;
  const volumeCubicCM = volumeCubicMM / 1000;
  const weightGrams = volumeCubicCM * 1.24;

  return {
    time: totalSeconds, // in seconds
    material: weightGrams, // in grams
    layers: layerMatch ? parseInt(layerMatch[1], 10) : 0,
  };
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
