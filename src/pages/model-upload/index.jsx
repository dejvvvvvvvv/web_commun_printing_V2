
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Header from '../../components/ui/Header';
import FileUploadZone from './components/FileUploadZone';
import ModelViewer from './components/ModelViewer';
import PrintConfiguration from './components/PrintConfiguration';
import PricingCalculator from './components/PricingCalculator';
import { initializeSlicer, processSlicingQueue } from './slicer_integration';

const ModelUpload = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [printConfigs, setPrintConfigs] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [isEngineReady, setEngineReady] = useState(false);

  // Initialize the slicer engine on component mount
  useEffect(() => {
    // A flag to prevent state updates if the component is unmounted
    let isMounted = true;

    initializeSlicer()
      .then(() => {
        if (isMounted) {
          setEngineReady(true);
        }
      })
      .catch(error => {
        console.error("Failed to initialize slicer engine:", error);
        // Optionally, show an error message to the user in the UI
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const updateModelStatus = useCallback((modelId, newProps) => {
    setUploadedFiles(prevFiles =>
      prevFiles.map(file =>
        file.id === modelId ? { ...file, ...newProps } : file
      )
    );
  }, []);

  // Effect to run the slicing queue processor
  useEffect(() => {
    if (isEngineReady) {
      processSlicingQueue(uploadedFiles, printConfigs, updateModelStatus);
    }
  }, [uploadedFiles, printConfigs, isEngineReady, updateModelStatus]);

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

  // Re-slicing logic on configuration change
  useEffect(() => {
    if (!selectedFile || !isEngineReady) return;
    const currentFile = uploadedFiles.find(f => f.id === selectedFile.id);
    // Re-queue for slicing if config changes and the model isn't already pending/processing
    if (currentFile && (currentFile.status === 'completed' || currentFile.status === 'failed') ) {
      updateModelStatus(selectedFile.id, { status: 'pending' });
    }
  }, [printConfigs, selectedFile, isEngineReady, updateModelStatus]);

  const handleFilesUploaded = (uploadedItem) => {
    const fileToProcess = uploadedItem.file instanceof File ? uploadedItem.file : uploadedItem;

    if (!(fileToProcess instanceof File)) {
        console.error("Attempted to upload an invalid file:", uploadedItem);
        return;
    }

    if (!uploadedFiles.some(file => file.name === fileToProcess.name)) {
        const modelObject = {
            id: Date.now() + Math.random(),
            name: fileToProcess.name,
            size: fileToProcess.size,
            type: fileToProcess.type,
            file: fileToProcess,
            fileData: null,
            uploadedAt: new Date(),
            status: 'pending', // Start as pending
            result: null,
            error: null,
        };

        const reader = new FileReader();
        reader.onload = (e) => {
            modelObject.fileData = e.target.result;
            setUploadedFiles(prev => [...prev, modelObject]);
        };
        reader.onerror = (err) => {
            console.error("File reading error:", err);
            updateModelStatus(modelObject.id, { status: 'failed', error: 'Chyba při čtení souboru.' });
        };
        
        reader.readAsArrayBuffer(fileToProcess);
    }
  };
  
  const handleAddModelClick = () => {
    fileInputRef.current.click();
  };

  const handleResetUpload = () => {
    setUploadedFiles([]);
    setSelectedFile(null);
    setPrintConfigs({});
    setCurrentStep(1);
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

  const handleConfigChange = (config) => {
    if (selectedFile) {
      setPrintConfigs(prev => ({ ...prev, [selectedFile.id]: config }));
    }
  };

  const handleNextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleProceedToCheckout = async () => {
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    navigate('/printer-catalog', {
      state: {
        uploadedFiles,
        printConfigs,
        fromUpload: true
      }
    });
  };
  
  const currentConfig = selectedFile ? printConfigs[selectedFile.id] : null;

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return uploadedFiles.length > 0;
      case 2:
        return currentConfig && selectedFile;
      case 3:
        return uploadedFiles.every(f => f.status === 'completed');
      default:
        return false;
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
        disabled={!isEngineReady}
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
              {!isEngineReady ? "Inicializuji výpočetní engine..." : "Nahrajte své 3D modely a nakonfigurujte parametry tisku."}
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
                  <FileUploadZone
                    onFilesUploaded={handleFilesUploaded}
                    disabled={!isEngineReady}
                  />
                )}
                
                {uploadedFiles.length > 0 && (
                    <> 
                      <div className={currentStep === 1 || (currentStep === 2 && selectedFile) ? 'block' : 'hidden'}>
                          <PrintConfiguration
                              key={selectedFile ? selectedFile.id : 'empty'}
                              selectedFile={selectedFile}
                              onConfigChange={handleConfigChange}
                              initialConfig={currentConfig}
                              disabled={!isEngineReady || (uploadedFiles.find(f => f.id === (selectedFile?.id))?.status === 'processing')}
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
                             <Button variant="ghost" size="icon" onClick={handleAddModelClick} disabled={!isEngineReady}>
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
                                    {file.status === 'pending' && <Icon name='Clock' size={14} className='flex-shrink-0' />}
                                    {file.status === 'processing' && <Icon name='Loader' size={14} className='animate-spin flex-shrink-0' />}
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
