import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ModelViewer = ({ selectedFile, onRemove }) => {
  return (
    <div className="relative bg-card border border-border rounded-xl aspect-square flex flex-col items-center justify-center p-6 text-center">
      {selectedFile ? (
        <>
          <div className="absolute top-2 right-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onRemove}
              aria-label="Odstranit model"
            >
              <Icon name="X" size={16} />
            </Button>
          </div>
          <div className="flex-grow flex flex-col items-center justify-center w-full">
            <Icon name="Box" size={64} className="text-primary mb-4" />
            <p className="text-sm font-medium text-foreground">{selectedFile.name}</p>
            <p className="text-xs text-muted-foreground">
              {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
            </p>
          </div>
        </>
      ) : (
        <div className="space-y-4">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
            <Icon name="Scan" size={40} className="text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-foreground">Náhled modelu</h3>
          <p className="text-sm text-muted-foreground">
            Po nahrání souboru se zde zobrazí náhled vašeho 3D modelu.
          </p>
        </div>
      )}
    </div>
  );
};

export default ModelViewer;
