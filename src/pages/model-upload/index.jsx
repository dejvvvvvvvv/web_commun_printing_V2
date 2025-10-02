
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Header from '../../components/ui/Header';
import FileUploadZone from './components/FileUploadZone';
import ModelViewer from './components/ModelViewer';
import PrintConfiguration from './components/PrintConfiguration';
import PricingCalculator from './components/PricingCalculator';
import KiriBackgroundPanel from './components/KiriBackgroundPanel.jsx';

// Definice tiskových profilů pro Kiri:Moto
const createDeviceProfile = () => ({
  info: "Prusa i3 MK3",
  max_x: 250,
  max_y: 210,
  max_z: 210,
  origin_center: false,
  nozzle_size: 0.4,
  filament_diameter: 1.75,
});

const createProcessProfile = (config) => ({
  process_name: "Default",
  slice_height: config.quality === 'fast' ? 0.3 : (config.quality === 'fine' ? 0.1 : 0.2),
  slice_shell_count: 2,
  slice_fill_sparse: config.infill / 100,
  slice_fill_type: "grid",
  slice_support_enable: config.postProcessing.includes('supports'),
});


const ModelUpload = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [printConfigs, setPrintConfigs] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Tento stav určí, který soubor se má právě "slicovat"
  const [fileToSlice, setFileToSlice] = useState(null);

  const updateModelStatus = useCallback((modelId, newProps) => {
    setUploadedFiles(prevFiles =>
      prevFiles.map(file =>
        file.id === modelId ? { ...file, ...newProps } : file
      )
    );
  }, []);

  // Callback, který se zavolá po dokončení slicingu
  const handleSliceComplete = useCallback((results) => {
    if (!fileToSlice) return;

    const newProps = results.error
      ? { status: 'failed', error: results.error, result: null }
      : { status: 'completed', result: results, error: null };
      
    updateModelStatus(fileToSlice.id, newProps);
    setFileToSlice(null); // Uvolníme "slicer" pro další soubor
  }, [fileToSlice, updateModelStatus]);

  // Efekt, který hledá další soubor k "slicování"
  useEffect(() => {
    if (fileToSlice) return; // Pokud se již něco zpracovává, neděláme nic

    const nextFileToProcess = uploadedFiles.find(f => f.status === 'pending');
    if (nextFileToProcess) {
      setFileToSlice(nextFileToProcess);
    }
  }, [uploadedFiles, fileToSlice]);

  const steps = [
    { id: 1, title: 'Nahrání souborů', icon: 'Upload', description: 'Nahrajte 3D modely' },
    { id: 2, title: 'Konfigurace', icon: 'Settings', description: 'Nastavte parametry tisku' },
    { id: 3, title: 'Kontrola a cena', icon: 'Calculator', description: 'Zkontrolujte objednávku' }
  ];

  useEffect(() => {
    if (uploadedFiles.length > 0 && !selectedFile) {
      setSelectedFile(uploadedFiles[0]);
    }
  }, [uploadedFiles, selectedFile]);

  useEffect(() => {
    if (selectedFile && !printConfigs[selectedFile.id]) {
      const defaultConfig = {
        material: 'pla',
        quality: 'standard',
        infill: 20,
        quantity: 1,
        postProcessing: [],
        expressDelivery: false,
      };
      handleConfigChange(defaultConfig);
    }
  }, [selectedFile, printConfigs]);

  useEffect(() => {
    if (uploadedFiles.length > 0 && currentStep === 1) {
      setTimeout(() => setCurrentStep(2), 1000);
    }
  }, [uploadedFiles, currentStep]);

  // Logika pro znovuspuštění slicingu při změně konfigurace
  const handleConfigChange = (config) => {
    if (selectedFile) {
      setPrintConfigs(prev => ({ ...prev, [selectedFile.id]: config }));
      // Pokud se změní konfigurace, přepneme stav na 'pending', aby se spustil nový slicing
      const currentFile = uploadedFiles.find(f => f.id === selectedFile.id);
      if (currentFile && currentFile.status !== 'processing') {
        updateModelStatus(selectedFile.id, { status: 'pending' });
      }
    }
  };

  const handleFilesUploaded = (uploadedItem) => {
    const fileToProcess = uploadedItem.file instanceof File ? uploadedItem.file : uploadedItem;
    if (!(fileToProcess instanceof File)) return;

    if (!uploadedFiles.some(file => file.name === fileToProcess.name)) {
        const modelObject = {
            id: Date.now() + Math.random(),
            name: fileToProcess.name,
            size: fileToProcess.size,
            type: fileToProcess.type,
            file: fileToProcess, // Uchováme objekt File pro KiriPanel
            uploadedAt: new Date(),
            status: 'pending', // Nový soubor vždy začíná jako 'pending'
            result: null,
            error: null,
        };
        setUploadedFiles(prev => [...prev, modelObject]);
    }
  };
  
  const handleAddModelClick = () => fileInputRef.current.click();

  const handleResetUpload = () => {
    setUploadedFiles([]);
    setSelectedFile(null);
    setPrintConfigs({});
    setCurrentStep(1);
    setFileToSlice(null);
  };
  
  const handleFileDelete = (fileToDelete) => {
    const newUploadedFiles = uploadedFiles.filter(file => file.id !== fileToDelete.id);
    const newPrintConfigs = { ...printConfigs };
    delete newPrintConfigs[fileToDelete.id];
    
    setUploadedFiles(newUploadedFiles);
    setPrintConfigs(newPrintConfigs);

    if (selectedFile && selectedFile.id === fileToDelete.id) {
      setSelectedFile(newUploadedFiles.length > 0 ? newUploadedFiles[0] : null);
    }
    if (newUploadedFiles.length === 0) {
        handleResetUpload();
    }
  };

  const handleNextStep = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const handlePrevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleProceedToCheckout = async () => {
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    navigate('/printer-catalog', {
      state: { uploadedFiles, printConfigs, fromUpload: true }
    });
  };
  
  const currentConfig = selectedFile ? printConfigs[selectedFile.id] : {};
  
  const canProceed = () => {
    switch (currentStep) {
      case 1: return uploadedFiles.length > 0;
      case 2: return !!currentConfig && !!selectedFile;
      case 3: return uploadedFiles.every(f => f.status === 'completed');
      default: return false;
    }
  };

  const statusTooltips = {
      pending: "Čeká ve frontě na zpracování",
      processing: "Zpracovávám...",
      completed: "Hotovo",
      failed: "Zpracování se nezdařilo"
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      {/* Skrytý panel, který se stará o slicing na pozadí */}
      {fileToSlice && currentConfig && (
        <KiriBackgroundPanel
          fileToSlice={fileToSlice.file}
          onSliceComplete={handleSliceComplete}
          device={createDeviceProfile()}
          process={createProcessProfile(currentConfig)}
        />
      )}

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={(e) => {
            const files = Array.from(e.target.files);
            files.forEach(file => handleFilesUploaded({ file }));
        }}
        style={{ display: 'none' }} 
        multiple 
        accept=".stl,.obj,.3mf"
      />
      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="mb-8">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-2">
              <button onClick={() => navigate('/customer-dashboard')} className="hover:text-foreground transition-colors">
                Dashboard
              </button>
              <Icon name="ChevronRight" size={16} />
              <span className="text-foreground">Nahrání modelu</span>
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Nahrání 3D modelu</h1>
            <p className="text-muted-foreground">
              Nahrajte své 3D modely a nakonfigurujte parametry tisku.
            </p>
          </div>

          <div className="mb-8">
            <div className="flex items-center justify-between max-w-2xl">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-colors ${
                      currentStep >= step.id
                        ? 'bg-primary border-primary text-primary-foreground'
                        : 'border-border text-muted-foreground'
                    }`}>
                      <Icon name={step.icon} size={20} />
                    </div>
                    <div className="mt-2 text-center">
                      <p className={`text-sm font-medium ${
                        currentStep >= step.id ? 'text-foreground' : 'text-muted-foreground'
                      }`}>
                        {step.title}
                      </p>
                      <p className="text-xs text-muted-foreground">{step.description}</p>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-24 h-0.5 mx-4 transition-colors ${
                      currentStep > step.id ? 'bg-primary' : 'bg-border'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
                {uploadedFiles.length === 0 && currentStep === 1 && (
                  <FileUploadZone onFilesUploaded={handleFilesUploaded} />
                )}
                
                {uploadedFiles.length > 0 && (
                    <> 
                      <div className={currentStep === 1 || (currentStep === 2 && selectedFile) ? 'block' : 'hidden'}>
                          <PrintConfiguration
                              key={selectedFile ? selectedFile.id : 'empty'}
                              selectedFile={selectedFile}
                              onConfigChange={handleConfigChange}
                              initialConfig={currentConfig}
                              disabled={fileToSlice?.id === selectedFile?.id}
                          />
                      </div>
                      {currentStep === 3 && (
                          <PricingCalculator 
                            files={uploadedFiles}
                            configs={printConfigs}
                          />
                      )}
                    </>
                )}
            </div>

            <div className="space-y-6">
                <ModelViewer selectedFile={selectedFile} onRemove={handleFileDelete} />
                {uploadedFiles.length > 0 && (
                    <div className="bg-card border border-border rounded-xl p-4 flex flex-col gap-4">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="font-semibold">Nahrané modely</h3>
                             <Button variant="ghost" size="icon" onClick={handleAddModelClick}>
                                <Icon name="Plus" size={16} />
                                <span className="sr-only">Přidání Modelu</span>
                            </Button>
                        </div>
                        <div className="flex flex-col gap-2">
                            {uploadedFiles.map((file) => (
                                <Button
                                    key={file.id}
                                    variant={selectedFile && selectedFile.id === file.id ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setSelectedFile(file)}
                                    className="w-full justify-start text-left h-auto py-2 px-3"
                                    title={statusTooltips[file.status] || 'Neznámý stav'}
                                >
                                  <div className="flex items-center gap-2 w-full">
                                    {fileToSlice?.id === file.id && <Icon name='Loader' size={14} className='animate-spin flex-shrink-0' />}
                                    {file.status === 'pending' && fileToSlice?.id !== file.id && <Icon name='Clock' size={14} className='flex-shrink-0' />}
                                    {file.status === 'completed' && <Icon name='CheckCircle' size={14} className='text-green-500 flex-shrink-0' />}
                                    {file.status === 'failed' && <Icon name='XCircle' size={14} className='text-red-500 flex-shrink-0' />}
                                    <span className="truncate flex-grow text-left">{file.name}</span>
                                  </div>
                                </Button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
          </div>

          <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
            <Button
              variant="outline"
              onClick={handlePrevStep}
              disabled={currentStep === 1}
              iconName="ChevronLeft"
              iconPosition="left"
            >
              Zpět
            </Button>
            <div className="flex items-center space-x-4">
              {currentStep < 3 ? (
                <Button
                  variant="default"
                  onClick={handleNextStep}
                  disabled={!canProceed()}
                  iconName="ChevronRight"
                  iconPosition="right"
                >
                  Pokračovat
                </Button>
              ) : (
                <Button
                  variant="default"
                  onClick={handleProceedToCheckout}
                  disabled={!canProceed() || isProcessing}
                  loading={isProcessing}
                  iconName="ArrowRight"
                  iconPosition="right"
                >
                  {isProcessing ? 'Zpracovávám...' : 'Přejít k výběru tiskárny'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelUpload;
