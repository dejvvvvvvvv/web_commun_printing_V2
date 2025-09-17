import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Header from '../../components/ui/Header';
import FileUploadZone from './components/FileUploadZone';
import ModelViewer from './components/ModelViewer';
import PrintConfiguration from './components/PrintConfiguration';
import PricingCalculator from './components/PricingCalculator';

const ModelUpload = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [printConfigs, setPrintConfigs] = useState({});
  const [pricings, setPricings] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);

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

  // Set default config for the selected file if it doesn't have one
  useEffect(() => {
    if (selectedFile && !printConfigs[selectedFile.name]) {
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

  const handleFilesUploaded = (newFile) => {
    // Prevent duplicates
    if (!uploadedFiles.some(file => file.name === newFile.name)) {
        setUploadedFiles(prev => [...prev, newFile]);
    }
  };
  
  const handleAddModelClick = () => {
    fileInputRef.current.click();
  };

  const handleResetUpload = () => {
    setUploadedFiles([]);
    setSelectedFile(null);
    setPrintConfigs({});
    setPricings({});
    setCurrentStep(1);
  };
  
  const handleFileDelete = (fileToDelete) => {
    const newUploadedFiles = uploadedFiles.filter(file => file.name !== fileToDelete.name);
    
    const newPrintConfigs = { ...printConfigs };
    delete newPrintConfigs[fileToDelete.name];
    
    const newPricings = { ...pricings };
    delete newPricings[fileToDelete.name];

    setUploadedFiles(newUploadedFiles);
    setPrintConfigs(newPrintConfigs);
    setPricings(newPricings);

    if (selectedFile && selectedFile.name === fileToDelete.name) {
      if (newUploadedFiles.length > 0) {
        setSelectedFile(newUploadedFiles[0]);
      } else {
        handleResetUpload();
      }
    }
  };

  const handleConfigChange = (config) => {
    if (selectedFile) {
      setPrintConfigs(prev => ({ ...prev, [selectedFile.name]: config }));
    }
  };

  const handlePriceChange = (newPricing) => {
    if (selectedFile) {
      setPricings(prev => ({ ...prev, [selectedFile.name]: newPricing }));
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
        pricings,
        fromUpload: true
      }
    });
  };
  
  const currentConfig = selectedFile ? printConfigs[selectedFile.name] : null;
  const currentPricing = selectedFile ? pricings[selectedFile.name] : null;

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return uploadedFiles.length > 0;
      case 2:
        return currentConfig && selectedFile;
      case 3:
        return currentPricing && currentPricing.total > 0 && currentConfig && selectedFile;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={(e) => {
            const files = Array.from(e.target.files);
            files.forEach(file => {
                handleFilesUploaded({
                    id: Date.now() + Math.random(),
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    file: file,
                    uploadedAt: new Date()
                });
            });
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
              Nahrajte své 3D modely a nakonfigurujte parametry tisku pro vytvoření objednávky
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
              {currentStep === 1 && (
                <div className="space-y-6">
                  <FileUploadZone
                    onFilesUploaded={handleFilesUploaded}
                    uploadedFiles={uploadedFiles}
                    onRemoveFile={handleFileDelete}
                  />
                </div>
              )}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <PrintConfiguration
                    key={selectedFile ? selectedFile.name : 'empty'}
                    selectedFile={selectedFile}
                    onConfigChange={handleConfigChange}
                    initialConfig={currentConfig}
                  />
                </div>
              )}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="bg-card border border-border rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                      <Icon name="CheckCircle" size={20} className="mr-2 text-success" />
                      Kontrola objednávky
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                            <Icon name="Box" size={20} className="text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">{selectedFile?.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {selectedFile && (selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => setCurrentStep(1)}>
                          <Icon name="Edit" size={16} />
                        </Button>
                      </div>
                      {currentConfig && (
                        <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
                          <div>
                            <p className="text-xs text-muted-foreground">Materiál</p>
                            <p className="text-sm font-medium text-foreground">{currentConfig.material.toUpperCase()}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Kvalita</p>
                            <p className="text-sm font-medium text-foreground">{currentConfig.quality}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Množství</p>
                            <p className="text-sm font-medium text-foreground">{currentConfig.quantity} ks</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Výplň</p>
                            <p className="text-sm font-medium text-foreground">{currentConfig.infill}%</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
               {currentStep !== 1 && (
                <PricingCalculator
                    config={currentConfig}
                    selectedFile={selectedFile}
                    onPriceChange={handlePriceChange}
                />
               )}
            </div>

            <div className="space-y-6">
                <ModelViewer selectedFile={selectedFile} onRemove={handleFileDelete} />
                {uploadedFiles.length > 0 && (
                    <div className="bg-card border border-border rounded-xl p-2">
                        <div className="flex items-center space-x-2">
                        <div className="flex-grow overflow-x-auto whitespace-nowrap space-x-2">
                            {uploadedFiles.map((file) => (
                            <Button
                                key={file.name}
                                variant={selectedFile && selectedFile.name === file.name ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setSelectedFile(file)}
                                className="inline-flex"
                            >
                                {file.name}
                            </Button>
                            ))}
                        </div>
                        <Button variant="ghost" size="icon" onClick={handleAddModelClick}>
                            <Icon name="Plus" size={16} />
                            <span className="sr-only">Přidání Modelu</span>
                        </Button>
                        </div>
                    </div>
                )}
              {currentPricing && currentPricing.total > 0 && (
                <div className="bg-card border border-border rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                    <Icon name="Cpu" size={20} className="mr-2" />
                    Odhad tisku pro {selectedFile.name}
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                      <p className="text-muted-foreground">Odhadovaná cena</p>
                      <p className="font-semibold text-primary text-lg">~ {new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK', minimumFractionDigits: 0 }).format(currentPricing.total)}</p>
                    </div>
                  </div>
                </div>
              )}
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Rychlé akce</h3>
                <div className="space-y-3">
                  <Button variant="outline" fullWidth iconName="Search" iconPosition="left" onClick={handleProceedToCheckout} disabled={!canProceed() || isProcessing}>
                    Najít tiskárny
                  </Button>
                  <Button variant="ghost" fullWidth iconName="Save" iconPosition="left">
                    Uložit konfiguraci
                  </Button>
                  <Button variant="ghost" fullWidth iconName="Share2" iconPosition="left">
                    Sdílet model
                  </Button>
                </div>
              </div>
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
