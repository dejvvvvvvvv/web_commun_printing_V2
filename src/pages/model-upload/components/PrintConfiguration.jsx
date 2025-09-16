import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';

const PrintConfiguration = ({ onConfigChange, selectedFile }) => {
  const [config, setConfig] = useState({
    material: 'pla',
    quality: 'standard',
    infill: 20,
    quantity: 1,
    supports: false,
    postProcessing: [],
    expressDelivery: false,
    color: 'white'
  });

  const materials = [
    { value: 'pla', label: 'PLA', description: 'Základní materiál, snadný tisk' },
    { value: 'abs', label: 'ABS', description: 'Odolný, vhodný pro funkční díly' },
    { value: 'petg', label: 'PETG', description: 'Chemicky odolný, průhledný' },
    { value: 'tpu', label: 'TPU', description: 'Flexibilní, gumový materiál' },
    { value: 'wood', label: 'Wood Fill', description: 'PLA s dřevěnými vlákny' },
    { value: 'carbon', label: 'Carbon Fiber', description: 'Vysoce pevný kompozit' }
  ];

  const qualities = [
    { value: 'nozzle_08', label: 'Extra hrubý (0.8mm)', description: 'Extrémně rychlý tisk pro robustní díly.' },
    { value: 'nozzle_06', label: 'Hrubý (0.6mm)', description: 'Rychlý tisk ideální pro velké modely.' },
    { value: 'nozzle_04', label: 'Rychlý (0.4mm)', description: 'Urychlený tisk pro méně detailní objekty.' },
    { value: 'draft', label: 'Návrhový (0.3mm)', description: 'Nejrychlejší pro ověření konceptu, nízká kvalita.' },
    { value: 'standard', label: 'Standardní (0.2mm)', description: 'Vyvážený poměr kvality a rychlosti.' },
    { value: 'fine', label: 'Jemný (0.15mm)', description: 'Vysoká kvalita pro detailní modely.' },
    { value: 'ultra', label: 'Ultra jemný (0.1mm)', description: 'Nejvyšší možná kvalita, velmi pomalý tisk.' }
  ];

  const colors = [
    { value: 'white', label: 'Bílá', color: '#FFFFFF' },
    { value: 'black', label: 'Černá', color: '#000000' },
    { value: 'red', label: 'Červená', color: '#EF4444' },
    { value: 'blue', label: 'Modrá', color: '#3B82F6' },
    { value: 'green', label: 'Zelená', color: '#10B981' },
    { value: 'yellow', label: 'Žlutá', color: '#F59E0B' },
    { value: 'orange', label: 'Oranžová', color: '#F97316' },
    { value: 'purple', label: 'Fialová', color: '#8B5CF6' }
  ];

  const postProcessingOptions = [
    { id: 'sanding', label: 'Broušení', price: 50, description: 'Vyhlazení povrchu' },
    { id: 'painting', label: 'Lakování', price: 120, description: 'Barevná úprava povrchu' },
    { id: 'assembly', label: 'Montáž', price: 200, description: 'Sestavení více dílů' },
    { id: 'drilling', label: 'Vrtání otvorů', price: 80, description: 'Přesné otvory dle specifikace' }
  ];

  const handleConfigChange = (key, value) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    onConfigChange?.(newConfig);
  };

  const handlePostProcessingChange = (optionId, checked) => {
    const newPostProcessing = checked
      ? [...config?.postProcessing, optionId]
      : config?.postProcessing?.filter(id => id !== optionId);
    
    handleConfigChange('postProcessing', newPostProcessing);
  };

  const getEstimatedTime = () => {
    const baseTime = 4; // hours
    const qualityMultiplier = {
      draft: 0.7,
      standard: 1,
      fine: 1.5,
      ultra: 2.2,
      nozzle_04: 1.0,
      nozzle_06: 0.6,
      nozzle_08: 0.4
    };
    const infillMultiplier = 1 + (config?.infill / 100) * 0.5;
    
    return Math.round(baseTime * qualityMultiplier?.[config?.quality] * infillMultiplier * config?.quantity);
  };

  const getEstimatedWeight = () => {
    const baseWeight = 25; // grams
    const infillMultiplier = 0.3 + (config?.infill / 100) * 0.7;
    return Math.round(baseWeight * infillMultiplier * config?.quantity);
  };

  if (!selectedFile) {
    return (
      <div className="bg-card border border-border rounded-xl p-8 text-center">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon name="Settings" size={24} className="text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Konfigurace tisku</h3>
        <p className="text-sm text-muted-foreground">
          Nejprve nahrajte 3D model pro konfiguraci parametrů tisku
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Material Selection */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
          <Icon name="Package" size={20} className="mr-2" />
          Materiál a barva
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Materiál"
            options={materials}
            value={config?.material}
            onChange={(value) => handleConfigChange('material', value)}
            searchable
          />
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Barva</label>
            <div className="grid grid-cols-4 gap-2">
              {colors?.map((color) => (
                <button
                  key={color?.value}
                  onClick={() => handleConfigChange('color', color?.value)}
                  className={`flex items-center space-x-2 p-2 rounded-lg border transition-colors ${
                    config?.color === color?.value
                      ? 'border-primary bg-primary/5' :'border-border hover:border-primary/50'
                  }`}
                >
                  <div
                    className="w-4 h-4 rounded-full border border-border"
                    style={{ backgroundColor: color?.color }}
                  />
                  <span className="text-xs font-medium">{color?.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* Print Quality */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
          <Icon name="Layers" size={20} className="mr-2" />
          Kvalita tisku
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Kvalita vrstvy"
            options={qualities}
            value={config?.quality}
            onChange={(value) => handleConfigChange('quality', value)}
          />
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Výplň: {config?.infill}%
            </label>
            <input
              type="range"
              min="10"
              max="100"
              step="5"
              value={config?.infill}
              onChange={(e) => handleConfigChange('infill', parseInt(e?.target?.value))}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Rychlý (10%)</span>
              <span>Pevný (100%)</span>
            </div>
          </div>
        </div>
        
        <div className="mt-4">
          <Checkbox
            label="Podpěry"
            description="Automatické generování podpěr pro převislé části"
            checked={config?.supports}
            onChange={(e) => handleConfigChange('supports', e?.target?.checked)}
          />
        </div>
      </div>
      {/* Quantity and Express */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
          <Icon name="Package2" size={20} className="mr-2" />
          Množství a doručení
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Počet kusů"
            type="number"
            min="1"
            max="100"
            value={config?.quantity}
            onChange={(e) => handleConfigChange('quantity', parseInt(e?.target?.value) || 1)}
          />
          
          <div className="space-y-4">
            <Checkbox
              label="Expresní tisk"
              description="Prioritní zpracování do 24 hodin (+50% k ceně)"
              checked={config?.expressDelivery}
              onChange={(e) => handleConfigChange('expressDelivery', e?.target?.checked)}
            />
          </div>
        </div>
      </div>
      {/* Post Processing */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
          <Icon name="Wrench" size={20} className="mr-2" />
          Dodatečné služby
        </h3>
        
        <div className="space-y-3">
          {postProcessingOptions?.map((option) => (
            <div key={option?.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
              <div className="flex items-center space-x-3">
                <Checkbox
                  checked={config?.postProcessing?.includes(option?.id)}
                  onChange={(e) => handlePostProcessingChange(option?.id, e?.target?.checked)}
                />
                <div>
                  <p className="text-sm font-medium text-foreground">{option?.label}</p>
                  <p className="text-xs text-muted-foreground">{option?.description}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-foreground">+{option?.price} Kč</p>
                <p className="text-xs text-muted-foreground">za kus</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Estimated Results */}
      <div className="bg-muted/30 border border-border rounded-xl p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
          <Icon name="Clock" size={20} className="mr-2" />
          Odhad tisku
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
              <Icon name="Clock" size={20} className="text-primary" />
            </div>
            <p className="text-sm font-medium text-foreground">{getEstimatedTime()}h</p>
            <p className="text-xs text-muted-foreground">Doba tisku</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-2">
              <Icon name="Weight" size={20} className="text-success" />
            </div>
            <p className="text-sm font-medium text-foreground">{getEstimatedWeight()}g</p>
            <p className="text-xs text-muted-foreground">Hmotnost</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-warning/10 rounded-full flex items-center justify-center mx-auto mb-2">
              <Icon name="Layers" size={20} className="text-warning" />
            </div>
            <p className="text-sm font-medium text-foreground">
              {config?.quality === 'draft' ? '~850' : 
               config?.quality === 'standard' ? '~1200' :
               config?.quality === 'fine' ? '~1600' : '~2400'}
            </p>
            <p className="text-xs text-muted-foreground">Vrstvy</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-2">
              <Icon name="Thermometer" size={20} className="text-error" />
            </div>
            <p className="text-sm font-medium text-foreground">
              {config?.material === 'pla' ? '200°C' :
               config?.material === 'abs' ? '250°C' :
               config?.material === 'petg' ? '230°C' :
               config?.material === 'tpu' ? '220°C' : '210°C'}
            </p>
            <p className="text-xs text-muted-foreground">Teplota</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintConfiguration;