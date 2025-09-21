
// Tento soubor bude obsahovat veskerou logiku pro integraci Kiri:Moto sliceru.

// Globalni promenna pro sledovani, zda prave probiha slicing.
// Zabrani se tim paralelnimu zpracovani vice modelu najednou.
let isSlicingInProgress = false;

/**
 * Simuluje zpracovani jednoho modelu.
 * V dalsich sekcich zde bude skutecna logika pro Kiri:Moto.
 * @param {object} model - Objekt modelu k zpracovani.
 * @param {function} updateModelStatus - Callback pro aktualizaci stavu modelu.
 */
const processModel = async (model, updateModelStatus) => {
  console.log(`[Queue Manager] Zacinam zpracovavat model: ${model.name}`);
  updateModelStatus(model.id, { status: 'processing' });

  // Simulace prace sliceru (napr. 2-5 sekund)
  const processingTime = 2000 + Math.random() * 3000;
  await new Promise(resolve => setTimeout(resolve, processingTime));

  console.log(`[Queue Manager] Dokonceno zpracovani modelu: ${model.name}`);
  
  // V dalsich krocich zde budou realna data ze sliceru
  const mockResult = {
    printTimeInSeconds: 1800 + Math.random() * 1800,
    filamentLengthInMm: 5000 + Math.random() * 5000,
  };

  updateModelStatus(model.id, { status: 'completed', result: mockResult });
};

/**
 * Spravce fronty (Queue Manager).
 * Prochazi frontu modelu a spousti zpracovani pro prvni model ve stavu 'pending'.
 * @param {array} queue - Aktualni fronta modelu.
 * @param {function} updateModelStatus - Callback pro aktualizaci stavu modelu.
 */
export const processSlicingQueue = async (queue, updateModelStatus) => {
  // Pokud uz neco bezi, pockame.
  if (isSlicingInProgress) {
    console.log("[Queue Manager] Slicing jiz probiha, cekam na dokonceni.");
    return;
  }

  // Najdeme prvni model cekajici na zpracovani.
  const modelToProcess = queue.find(model => model.status === 'pending');

  if (modelToProcess) {
    isSlicingInProgress = true;
    try {
      await processModel(modelToProcess, updateModelStatus);
    } catch (error) {
      console.error(`[Queue Manager] Chyba pri zpracovani modelu ${modelToProcess.name}:`, error);
      updateModelStatus(modelToProcess.id, { status: 'failed', error: error.message });
    } finally {
      isSlicingInProgress = false;
      // Po dokonceni jednoho modelu se okamzite pokusime zpracovat dalsi.
      // Toto vytvori asynchronni smycku.
      processSlicingQueue(queue, updateModelStatus);
    }
  } else {
    console.log("[Queue Manager] Zadny model k zpracovani.");
  }
};
