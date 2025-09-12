import React, { useState, useRef, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ModelViewer = ({ selectedFile, onClose }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState('solid'); // solid, wireframe, points
  const [showMeasurements, setShowMeasurements] = useState(false);
  const viewerRef = useRef(null);

  // Mock 3D model data
  const modelData = {
    dimensions: {
      x: 45.2,
      y: 32.8,
      z: 15.6
    },
    volume: 23.4, // cm³
    surfaceArea: 156.7, // cm²
    triangles: 2847,
    vertices: 1423
  };

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [selectedFile]);

  const viewModes = [
    { id: 'solid', label: 'Plný', icon: 'Box' },
    { id: 'wireframe', label: 'Drátový', icon: 'Grid3x3' },
    { id: 'points', label: 'Body', icon: 'Dot' }
  ];

  const handleDownload = () => {
    // Mock download functionality
    console.log('Downloading model:', selectedFile?.name);
  };

  const handleShare = () => {
    // Mock share functionality
    console.log('Sharing model:', selectedFile?.name);
  };

  if (!selectedFile) {
    return (
      <div className="bg-card border border-border rounded-xl p-8 text-center">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon name="Box" size={24} className="text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Žádný model vybrán</h3>
        <p className="text-sm text-muted-foreground">
          Nahrajte 3D model pro zobrazení náhledu
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
            <Icon name="Box" size={16} className="text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">{selectedFile?.name}</h3>
            <p className="text-xs text-muted-foreground">
              {(selectedFile?.size / (1024 * 1024))?.toFixed(2)} MB
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" onClick={handleShare}>
            <Icon name="Share2" size={16} />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleDownload}>
            <Icon name="Download" size={16} />
          </Button>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <Icon name="X" size={16} />
            </Button>
          )}
        </div>
      </div>
      {/* 3D Viewer */}
      <div className="relative">
        <div 
          ref={viewerRef}
          className="w-full h-80 bg-gradient-to-br from-muted/30 to-muted/60 flex items-center justify-center relative overflow-hidden"
        >
          {isLoading ? (
            <div className="flex flex-col items-center space-y-4">
              <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
              <p className="text-sm text-muted-foreground">Načítání 3D modelu...</p>
            </div>
          ) : (
            <>
              {/* Mock 3D Model Display */}
              <div className="relative">
                <div className={`w-32 h-32 transition-all duration-300 ${
                  viewMode === 'solid' ? 'bg-primary/20 border-4 border-primary/40' :
                  viewMode === 'wireframe'? 'border-4 border-primary bg-transparent' : 'bg-primary/10 border-2 border-dashed border-primary/60'
                } rounded-lg transform rotate-12 hover:rotate-6 transition-transform cursor-move`}>
                  <div className="absolute inset-2 bg-primary/10 rounded border-2 border-primary/30 transform -rotate-6" />
                  <div className="absolute inset-4 bg-primary/5 rounded border border-primary/20 transform rotate-3" />
                </div>
                
                {/* Measurements overlay */}
                {showMeasurements && (
                  <div className="absolute -top-8 -left-8 -right-8 -bottom-8 pointer-events-none">
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full">
                      <div className="bg-foreground text-background text-xs px-2 py-1 rounded">
                        {modelData?.dimensions?.x} mm
                      </div>
                    </div>
                    <div className="absolute left-0 top-1/2 transform -translate-x-full -translate-y-1/2 -rotate-90">
                      <div className="bg-foreground text-background text-xs px-2 py-1 rounded">
                        {modelData?.dimensions?.y} mm
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Grid background */}
              <div className="absolute inset-0 opacity-20">
                <div className="w-full h-full" style={{
                  backgroundImage: `
                    linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
                  `,
                  backgroundSize: '20px 20px'
                }} />
              </div>
            </>
          )}
        </div>

        {/* Controls Overlay */}
        {!isLoading && (
          <div className="absolute top-4 right-4 flex flex-col space-y-2">
            <Button variant="secondary" size="sm" onClick={() => setShowMeasurements(!showMeasurements)}>
              <Icon name="Ruler" size={16} />
            </Button>
            <Button variant="secondary" size="sm">
              <Icon name="RotateCcw" size={16} />
            </Button>
            <Button variant="secondary" size="sm">
              <Icon name="ZoomIn" size={16} />
            </Button>
          </div>
        )}
      </div>
      {/* View Mode Controls */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-medium text-foreground">Režim zobrazení</h4>
          <div className="flex items-center space-x-1 bg-muted rounded-lg p-1">
            {viewModes?.map((mode) => (
              <button
                key={mode?.id}
                onClick={() => setViewMode(mode?.id)}
                className={`flex items-center space-x-1 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                  viewMode === mode?.id
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon name={mode?.icon} size={14} />
                <span>{mode?.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Model Information */}
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Rozměry:</span>
              <span className="text-foreground font-medium">
                {modelData?.dimensions?.x} × {modelData?.dimensions?.y} × {modelData?.dimensions?.z} mm
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Objem:</span>
              <span className="text-foreground font-medium">{modelData?.volume} cm³</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Trojúhelníky:</span>
              <span className="text-foreground font-medium">{modelData?.triangles?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Vrcholy:</span>
              <span className="text-foreground font-medium">{modelData?.vertices?.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelViewer;