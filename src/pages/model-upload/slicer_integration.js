// This file is responsible for interfacing with the Kiri:Moto slicing engine.

// --- START: Vite-Compatible Inline Script Execution ---
import kiriCode from '../../lib/kiri/kiri.js?raw';
import engineCode from '../../lib/kiri/engine.js?raw';
import workerCode from '../../lib/kiri/kiri_work.js?raw';
// --- END: Vite-Compatible Inline Script Execution ---

let kiriInstance = null;
let kiriPromise = null;

/**
 * Executes a script by injecting its content into a <script> tag.
 * @param {string} content The raw JavaScript code to execute.
 */
const executeScript = (content) => {
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.textContent = content;
  document.body.appendChild(script);
};

/**
 * Initializes the Kiri:Moto engine using the "Frankenstein" + "Monkey Patching" method.
 * This is the definitive, multi-layered solution to prevent all unwanted network requests.
 * @returns {Promise<object>} A promise that resolves with the Kiri:Moto client instance.
 */
export const initializeSlicer = () => {
  if (kiriInstance) {
    return Promise.resolve(kiriInstance);
  }

  if (!kiriPromise) {
    kiriPromise = new Promise((resolve, reject) => {
      // --- START: MONKEY PATCHING (Layer 1 Defense) ---
      const originalFetch = window.fetch;
      let patchIsActive = true;

      const patchedFetch = (url, options) => {
        if (patchIsActive && typeof url === 'string' && url.endsWith('.json')) {
          console.warn(`[Monkey Patch] Intercepted and blocked a fetch request to: ${url}`);
          return Promise.resolve(new Response('{}', {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          }));
        }
        return originalFetch(url, options);
      };

      window.fetch = patchedFetch;
      console.log("[Monkey Patch] Global fetch has been temporarily overridden.");
      // --- END: MONKEY PATCHING ---

      try {
        // Step 1: Execute scripts on the main thread so window.kiri.init exists.
        executeScript(kiriCode);
        executeScript(engineCode);

        // --- START: FRANKENSTEIN METHOD (Layer 2 Defense) ---
        // Step 2a: Surgically remove the problematic importScripts call from the worker code.
        const modifiedWorkerCode = workerCode.replace(
          "importScripts.apply(self, [ app.code.base ]);",
          "// importScripts.apply(self, [ app.code.base ]); // Patched out by Frankenstein method"
        );

        // Step 2b: Stitch all scripts together into one self-contained monster script for the worker.
        const frankensteinCode = kiriCode + '\n' + engineCode + '\n' + modifiedWorkerCode;

        // Step 2c: Create a Blob URL from the new, all-powerful script.
        const workerBlob = new Blob([frankensteinCode], { type: 'application/javascript' });
        const workerUrl = URL.createObjectURL(workerBlob);
        console.log("[Frankenstein] Created a self-contained worker from a Blob URL.");
        // --- END: FRANKENSTEIN METHOD ---

        // Step 3: Initialize the engine, pointing to our new super-worker.
        if (window.kiri && window.kiri.init) {
          const config = {
            workerURL: workerUrl,
            noFetch: true,
          };

          window.kiri.init(config).then((client) => {
            // --- FINAL VALIDATION ---
            if (!client || typeof client.setMode !== 'function') {
                console.error("FATAL: Kiri:Moto client is invalid or incomplete after init.", client);
                throw new Error("Kiri:Moto client initialization failed, client is non-functional.");
            }
            // --- /FINAL VALIDATION ---

            console.log("SUCCESS: Kiri:Moto engine is ready (initialized via Frankenstein + Monkey Patch).");
            kiriInstance = client;

            window.fetch = originalFetch;
            patchIsActive = false;
            console.log("[Monkey Patch] Global fetch has been restored.");

            resolve(kiriInstance);
          }).catch(error => {
            window.fetch = originalFetch;
            patchIsActive = false;
            console.error("[Monkey Patch] Global fetch restored after error.");
            console.error("FATAL: window.kiri.init() failed.", error);
            reject(error);
          });
        } else {
          throw new Error("FATAL: window.kiri object not found after executing scripts.");
        }
      } catch (error) {
        window.fetch = originalFetch;
        patchIsActive = false;
        console.error("[Monkey Patch] Global fetch restored after catastrophic error.");
        console.error("FATAL: Slicer initialization failed.", error);
        kiriPromise = null;
        reject(error);
      }
    });
  }

  return kiriPromise;
};

let slicingInProgress = false;

const createKiriMotoProfiles = (config) => {
  const deviceProfile = {
      info: "Prusa i3 MK3",
      max_x: 250,
      max_y: 210,
      max_z: 210,
      origin_center: false,
      nozzle_size: 0.4,
      filament_diameter: 1.75,
      gcode_header: "G28 ; home all axes\nM107 ; fan off\nG90 ; use absolute coordinates\nM82 ; use absolute distances for extrusion",
      gcode_footer: "M104 S0 ; turn off temperature\nM140 S0 ; turn off heatbed\nM107 ; fan off\nG1 X0 Y200 ; park\nM84 ; disable motors\n; METADATA-START\nGCODE-TIME: {time}\nGCODE-MATL: {material}\n; METADATA-END",
  };

  const processProfile = {
      process_name: "Default",
      slice_height: config.quality === 'fast' ? 0.3 : (config.quality === 'fine' ? 0.1 : 0.2),
      slice_shell_count: 2,
      slice_fill_sparse: config.infill / 100,
      slice_fill_type: "grid",
      slice_support_enable: config.postProcessing.includes('supports'),
  };

  return { deviceProfile, processProfile };
};

const parseGcodeResults = (gcode) => {
  const timeMatch = gcode.match(/GCODE-TIME: (\d+\.?\d*)/);
  const materialMatch = gcode.match(/GCODE-MATL: (\d+\.?\d*)/);

  return {
    time: timeMatch ? parseFloat(timeMatch[1]) : 0, // in seconds
    material: materialMatch ? parseFloat(materialMatch[1]) : 0, // in millimeters
  };
};

const processModel = async (model, config, updateStatus) => {
  try {
    const client = await initializeSlicer();
    const { deviceProfile, processProfile } = createKiriMotoProfiles(config);

    await client.setMode('FDM');
    await client.setDevice(deviceProfile);
    await client.setProcess(processProfile);
    await client.parse(model.fileData);
    await client.slice();
    await client.prepare();
    const gcode = await client.export();
    
    const results = parseGcodeResults(gcode);

    updateStatus(model.id, { 
      status: 'completed', 
      result: results,
      error: null 
    });

  } catch (error) {
    console.error("Slicing failed:", error);
    updateStatus(model.id, { status: 'failed', error: error.message || 'Neznámá chyba při slicingu.' });
  }
};

export const processSlicingQueue = async (uploadedFiles, printConfigs, updateModelStatus) => {
  if (slicingInProgress) {
    return;
  }

  const modelToProcess = uploadedFiles.find(file => file.status === 'pending');

  if (modelToProcess) {
    slicingInProgress = true;
    const config = printConfigs[modelToProcess.id];
    if (!config) {
        slicingInProgress = false;
        return;
    }
    
    updateModelStatus(modelToProcess.id, { status: 'processing' });
    await processModel(modelToProcess, config, updateModelStatus);
    slicingInProgress = false;
    
    // Check for next item in queue without causing a tight loop on failure
    if (uploadedFiles.some(f => f.status === 'pending')) {
        setTimeout(() => processSlicingQueue(uploadedFiles, printConfigs, updateModelStatus), 500);
    }
  }
};
