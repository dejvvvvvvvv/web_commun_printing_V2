import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';

import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';

const PrintConfiguration = ({ onConfigChange, selectedFile, initialConfig, disabled }) => {
  const [config, setConfig] = useState(initialConfig || {
    material: 'pla',
    quality: 'standard',
    infill: 20,
    quantity: 1,
    postProcessing: [],
    expressDelivery: false,
    color: 'white'
  });

  useEffect(() => {
    if (initialConfig) {
      setConfig(initialConfig);
    }
  }, [initialConfig]);

  const materials = [
    { value: 'pla', label: 'PLA', description: 'Základní, snadno tisknutelný' },
    { value: 'petg', label: 'PETG', description: 'Odolný a flexibilní' },
    { value: 'abs', label: 'ABS', description: 'Pevný, pro technické díly' },
    { value: 'tpu', label: 'TPU', description: 'Flexibilní, gumový' },
  ];

  const qualities = [
    { value: 'fast', label: 'Rychlá (0.3mm)', description: 'Pro prototypy' },
    { value: 'standard', label: 'Standardní (0.2mm)', description: 'Vyvážená kvalita' },
    { value: 'fine', label: 'Jemná (0.1mm)', description: 'Pro detailní modely' },
  ];

  const colors = [
    { value: 'white', label: 'Bílá', color: '#FFFFFF' },
    { value: 'black', label: 'Černá', color: '#000000' },
    { value: 'red', label: 'Červená', color: '#EF4444' },
    { value: 'blue', label: 'Modrá', color: '#3B82F6' },
  ];
  
  const postProcessingOptions = [
    { id: 'supports', label: 'Odstranění podpor', description: 'Nutné pro modely s převisy.' },
    { id: 'sanding', label: 'Broušení', description: 'Vyhlazení viditelných vrstev.' },
    { id: 'painting', label: 'Lakování', description: 'Jedna barva dle výběru.' },
  ];


  const handleConfigChange = (key, value) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    onConfigChange?.(newConfig);
  };
  
  const handlePostProcessingChange = (optionId, checked) => {
    const currentPostProcessing = config.postProcessing || [];
    const newPostProcessing = checked
      ? [...currentPostProcessing, optionId]
      : currentPostProcessing.filter(id => id !== optionId);
    handleConfigChange('postProcessing', newPostProcessing);
  };

  if (!selectedFile) {
    return (
      <div className="bg-card border border-border rounded-xl p-8 text-center">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon name="Settings" size={24} className="text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Konfigurace tisku</h3>
        <p className="text-sm text-muted-foreground">
          Nejprve nahrajte 3D model a vyberte ho ze seznamu.
        </p>
      </div>
    );
  }

  return (
    <fieldset disabled={disabled} className="space-y-6 group">
      <div className="bg-card border border-border rounded-xl p-6 transition-opacity group-disabled:opacity-50">
        <h3 className="text-lg font-semibold text-foreground mb-4">Parametry tisku</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Select
            label="Materiál"
            options={materials}
            value={config.material ?? 'pla'}
            onChange={(value) => handleConfigChange('material', value)}
          />
          <Select
            label="Kvalita"
            options={qualities}
            value={config.quality ?? 'standard'}
            onChange={(value) => handleConfigChange('quality', value)}
          />
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Výplň: {config.infill ?? 20}%</label>
            <input
              type="range" min="10" max="100" step="5"
              value={config.infill ?? 20}
              onChange={(e) => handleConfigChange('infill', parseInt(e.target.value))}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer slider"
            />
          </div>
          <Input
            label="Počet kusů"
            type="number" min="1" max="100"
            value={config.quantity ?? 1}
            onChange={(e) => handleConfigChange('quantity', parseInt(e.target.value) || 1)}
          />
        </div>
      </div>
      <div className="bg-card border border-border rounded-xl p-6 transition-opacity group-disabled:opacity-50">
        <h3 className="text-lg font-semibold text-foreground mb-4">Dokončovací práce</h3>
        <div className="space-y-3">
          {postProcessingOptions.map((option) => (
            <div key={option.id} className="flex items-center justify-between p-3 border border-border rounded-lg bg-background/50">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id={`post-${option.id}`}
                  checked={config.postProcessing?.includes(option.id) ?? false}
                  onChange={(e) => handlePostProcessingChange(option.id, e.target.checked)}
                />
                <div>
                  <p className="text-sm font-medium text-foreground">{option.label}</p>
                  <p className="text-xs text-muted-foreground">{option.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </fieldset>
  );
};

export default PrintConfiguration;