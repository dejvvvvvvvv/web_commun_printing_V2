
// This file is responsible for interfacing with the Kiri:Moto slicing engine.

let kiriInstance = null;
let kiriPromise = null;

/**
 * Loads a script dynamically and returns a promise that resolves when it's loaded.
 * @param {string} src The source URL of the script.
 * @returns {Promise<void>}
 */
const loadScript = (src) => {
  return new Promise((resolve, reject) => {
    // Avoid re-injecting the same script
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    script.async = true;
    document.body.appendChild(script);
  });
};

/**
 * Initializes and returns a singleton instance of the Kiri:Moto client.
 * This function ensures that the Kiri:Moto scripts are loaded only once.
 * @returns {Promise<object>} A promise that resolves with the Kiri:Moto client instance.
 */
export const initializeSlicer = () => {
  if (kiriInstance) {
    return Promise.resolve(kiriInstance);
  }

  if (!kiriPromise) {
    kiriPromise = new Promise(async (resolve, reject) => {
      try {
        // Construct absolute paths from the root
        const baseUrl = import.meta.env.BASE_URL || '/';
        await loadScript(`${baseUrl}kiri/kiri.js`);
        await loadScript(`${baseUrl}kiri/engine.js`);

        if (window.kiri && window.kiri.init) {
          // Kiri:Moto is available, now initialize it
          window.kiri.init().then((client) => {
            console.log("Kiri:Moto engine is ready.");
            kiriInstance = client;
            resolve(kiriInstance);
          });
        } else {
          throw new Error("kiri object not found on window after loading scripts.");
        }
      } catch (error) {
        console.error("Failed to load or initialize Kiri:Moto:", error);
        kiriPromise = null; // Reset promise on failure to allow retry
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
    const client = await initializeSlicer(); // <-- Changed to initializeSlicer
    const { deviceProfile, processProfile } = createKiriMotoProfiles(config);

    await client.setMode('FDM');
    await client.setDevice(deviceProfile);
    await client.setProcess(processProfile);
    await client.parse(model.fileData); // Pass the ArrayBuffer
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
    
    // Use a brief timeout to allow the UI to update before processing the next model.
    setTimeout(() => processSlicingQueue(uploadedFiles, printConfigs, updateModelStatus), 100);
  }
};
