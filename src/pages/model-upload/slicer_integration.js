
// This file is responsible for interfacing with the Kiri:Moto slicing engine.

let slicingInProgress = false;

/**
 * Creates the necessary device and process profiles for Kiri:Moto.
 * @param {object} config - The print configuration from the UI.
 * @returns {{deviceProfile: object, processProfile: object}}
 */
const createKiriMotoProfiles = (config) => {
  // Define a standard device profile (e.g., based on a Prusa i3 MK3)
  const deviceProfile = {
      // Basic settings
      info: "Prusa i3 MK3",
      max_x: 250,
      max_y: 210,
      max_z: 210,
      origin_center: false,
      nozzle_size: 0.4,
      filament_diameter: 1.75,

      // G-code customization
      gcode_header: "G28 ; home all axes\nM107 ; fan off\nG90 ; use absolute coordinates\nM82 ; use absolute distances for extrusion",
      gcode_footer: "M104 S0 ; turn off temperature\nM140 S0 ; turn off heatbed\nM107 ; fan off\nG1 X0 Y200 ; park\nM84 ; disable motors\n; METADATA-START\nGCODE-TIME: {time}\nGCODE-MATL: {material}\n; METADATA-END",
  };

  // Map UI configuration to Kiri:Moto process parameters
  const processProfile = {
      process_name: "Default",
      slice_height: config.quality === 'fast' ? 0.3 : (config.quality === 'fine' ? 0.1 : 0.2),
      slice_shell_count: 2,
      slice_fill_sparse: config.infill / 100,
      slice_fill_type: "grid",
      slice_support_enable: config.postProcessing.includes('supports'),
      // Add more mappings as needed
  };

  return { deviceProfile, processProfile };
};

/**
 * Parses the G-code output to extract metadata (time, material).
 * @param {string} gcode - The full G-code as a string.
 * @returns {{time: number, material: number}}
 */
const parseGcodeResults = (gcode) => {
  const timeMatch = gcode.match(/GCODE-TIME: (\d+\.?\d*)/);
  const materialMatch = gcode.match(/GCODE-MATL: (\d+\.?\d*)/);

  return {
    time: timeMatch ? parseFloat(timeMatch[1]) : 0, // in seconds
    material: materialMatch ? parseFloat(materialMatch[1]) : 0, // in millimeters
  };
};

/**
 * Processes a single model file using the Kiri:Moto engine.
 * @param {object} model - The model file object.
 * @param {object} config - The print configuration for this model.
 * @param {function} updateStatus - Callback to update the model's status.
 */
const processModel = async (model, config, updateStatus) => {
  if (!window.kiri || !window.kiri.client) {
    updateStatus(model.id, { status: 'failed', error: 'Slicing engine není připraven.' });
    return;
  }

  try {
    const { deviceProfile, processProfile } = createKiriMotoProfiles(config);
    const { client } = window.kiri;

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

/**
 * Manages the queue of models to be sliced.
 * @param {Array<object>} uploadedFiles - The list of all uploaded files.
 * @param {object} printConfigs - A map of print configurations by model ID.
 * @param {function} updateModelStatus - Callback to update model status in the UI.
 */
export const processSlicingQueue = async (uploadedFiles, printConfigs, updateModelStatus) => {
  if (slicingInProgress) {
    return;
  }

  const modelToProcess = uploadedFiles.find(file => file.status === 'pending');

  if (modelToProcess) {
    slicingInProgress = true;
    const config = printConfigs[modelToProcess.id];
    if (!config) {
        // Config might not be ready yet, wait for the next cycle
        slicingInProgress = false;
        return;
    }
    
    updateModelStatus(modelToProcess.id, { status: 'processing' });
    await processModel(modelToProcess, config, updateModelStatus);
    slicingInProgress = false;
    
    // Immediately check for the next model in the queue
    processSlicingQueue(uploadedFiles, printConfigs, updateModelStatus);
  }
};
