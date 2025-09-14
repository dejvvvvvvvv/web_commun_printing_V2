import React, { useState, useEffect } from 'react';
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
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [printConfig, setPrintConfig] = useState(null);
  const [pricing, setPricing] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const steps = [
    { id: 1, title: 'Nahrání souborů', icon: 'Upload', description: 'Nahrajte 3D modely' },
    { id: 2, title: 'Konfigurace', icon: 'Settings', description: 'Nastavte parametry tisku' },
    { id: 3, title: 'Kontrola a cena', icon: 'Calculator', description: 'Zkontrolujte objednávku' }
  ];

  // Auto-select first uploaded file
  useEffect(() => {
    if (uploadedFiles?.length > 0 && !selectedFile) {
      setSelectedFile(uploadedFiles?.[0]);
    }
  }, [uploadedFiles, selectedFile]);

  // Auto-advance to next step when file is uploaded
  useEffect(() => {
    if (uploadedFiles?.length > 0 && currentStep === 1) {
      setTimeout(() => setCurrentStep(2), 1000);
    }
  }, [uploadedFiles, currentStep]);

  const handleFilesUploaded = (newFile) => {
    setUploadedFiles(prev => [...prev, newFile]);
  };

  const handleRemoveFile = (fileId) => {
    const newUploadedFiles = uploadedFiles.filter(f => f.id !== fileId);
    setUploadedFiles(newUploadedFiles);

    if (selectedFile?.id === fileId) {
      const newSelectedFile = newUploadedFiles.length > 0 ? newUploadedFiles[0] : null;
      setSelectedFile(newSelectedFile);
      if (!newSelectedFile) {
        setCurrentStep(1);
      }
    }
  };

  const handleConfigChange = (config) => {
    setPrintConfig(config);
  };

  const handlePriceChange = (newPricing) => {
    setPricing(newPricing);
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
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Navigate to printer catalog or checkout
    navigate('/printer-catalog', {
      state: {
        uploadedFiles,
        printConfig,
        pricing,
        fromUpload: true
      }
    });
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return uploadedFiles?.length > 0;
      case 2:
        return printConfig && selectedFile;
      case 3:
        return pricing && printConfig && selectedFile;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Page Header */}
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

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between max-w-2xl">
              {steps?.map((step, index) => (
                <div key={step?.id} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-colors ${
                      currentStep >= step?.id
                        ? 'bg-primary border-primary text-primary-foreground'
                        : 'border-border text-muted-foreground'
                    }`}>
                      <Icon name={step?.icon} size={20} />
                    </div>
                    <div className="mt-2 text-center">
                      <p className={`text-sm font-medium ${
                        currentStep >= step?.id ? 'text-foreground' : 'text-muted-foreground'
                      }`}>
                        {step?.title}
                      </p>
                      <p className="text-xs text-muted-foreground">{step?.description}</p>
                    </div>
                  </div>
                  
                  {index < steps?.length - 1 && (
                    <div className={`w-24 h-0.5 mx-4 transition-colors ${
                      currentStep > step?.id ? 'bg-primary' : 'bg-border'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Step 1: File Upload */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <FileUploadZone
                    onFilesUploaded={handleFilesUploaded}
                    uploadedFiles={uploadedFiles}
                    onRemoveFile={handleRemoveFile}
                  />
                </div>
              )}

              {/* Step 2: Configuration */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <PrintConfiguration
                    selectedFile={selectedFile}
                    onConfigChange={handleConfigChange}
                  />
                </div>
              )}

              {/* Step 3: Review */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="bg-card border border-border rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                      <Icon name="CheckCircle" size={20} className="mr-2 text-success" />
                      Kontrola objednávky
                    </h3>
                    
                    <div className="space-y-4">
                      {/* File Summary */}
                      <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                            <Icon name="Box" size={20} className="text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">{selectedFile?.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {selectedFile && (selectedFile?.size / (1024 * 1024))?.toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => setCurrentStep(1)}>
                          <Icon name="Edit" size={16} />
                        </Button>
                      </div>

                      {/* Config Summary */}
                      {printConfig && (
                        <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
                          <div>
                            <p className="text-xs text-muted-foreground">Materiál</p>
                            <p className="text-sm font-medium text-foreground">{printConfig?.material?.toUpperCase()}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Kvalita</p>
                            <p className="text-sm font-medium text-foreground">{printConfig?.quality}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Množství</p>
                            <p className="text-sm font-medium text-foreground">{printConfig?.quantity} ks</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Výplň</p>
                            <p className="text-sm font-medium text-foreground">{printConfig?.infill}%</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <PricingCalculator
                    config={printConfig}
                    selectedFile={selectedFile}
                    onPriceChange={handlePriceChange}
                  />
                </div>
              )}
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6">
              {/* Model Viewer */}
              <ModelViewer selectedFile={selectedFile} />

              {/* Quick Actions */}
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Rychlé akce</h3>
                
                <div className="space-y-3">
                  <Button variant="outline" fullWidth iconName="Search" iconPosition="left">
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

              {/* Help & Tips */}
              <div className="bg-muted/30 border border-border rounded-xl p-6">
                <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center">
                  <Icon name="Lightbulb" size={16} className="mr-2" />
                  Tipy pro lepší tisk
                </h4>
                
                <ul className="text-xs text-muted-foreground space-y-2">
                  <li className="flex items-start space-x-2">
                    <Icon name="Check" size={12} className="text-success mt-0.5 flex-shrink-0" />
                    <span>Zkontrolujte orientaci modelu pro minimální podpěry</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <Icon name="Check" size={12} className="text-success mt-0.5 flex-shrink-0" />
                    <span>Zvolte vhodnou výplň podle účelu použití</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <Icon name="Check" size={12} className="text-success mt-0.5 flex-shrink-0" />
                    <span>Větší modely rozdělte na více částí</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <Icon name="Check" size={12} className="text-success mt-0.5 flex-shrink-0" />
                    <span>Použijte PLA pro první pokusy</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Bottom Navigation */}
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
                  {isProcessing ? 'Zpracovávám...' : 'Najít tiskárny'}
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