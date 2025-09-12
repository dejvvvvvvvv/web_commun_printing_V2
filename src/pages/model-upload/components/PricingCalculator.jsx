import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const PricingCalculator = ({ config, selectedFile, onPriceChange }) => {
  const [pricing, setPricing] = useState({
    materialCost: 0,
    printingCost: 0,
    postProcessingCost: 0,
    expressCost: 0,
    serviceFee: 0,
    total: 0
  });

  const [showBreakdown, setShowBreakdown] = useState(false);

  // Material pricing per gram
  const materialPrices = {
    pla: 2.5,
    abs: 3.0,
    petg: 3.5,
    tpu: 8.0,
    wood: 6.0,
    carbon: 12.0
  };

  // Quality pricing multipliers
  const qualityMultipliers = {
    draft: 0.8,
    standard: 1.0,
    fine: 1.3,
    ultra: 1.8
  };

  // Post-processing prices
  const postProcessingPrices = {
    sanding: 50,
    painting: 120,
    assembly: 200,
    drilling: 80
  };

  useEffect(() => {
    if (!config || !selectedFile) return;

    // Calculate estimated weight (mock calculation)
    const baseWeight = 25; // grams
    const infillMultiplier = 0.3 + (config?.infill / 100) * 0.7;
    const estimatedWeight = baseWeight * infillMultiplier * config?.quantity;

    // Material cost
    const materialCost = estimatedWeight * materialPrices?.[config?.material];

    // Printing cost (base rate per hour)
    const baseHourlyRate = 80; // CZK per hour
    const estimatedHours = 4 * qualityMultipliers?.[config?.quality] * (1 + config?.infill / 200) * config?.quantity;
    const printingCost = estimatedHours * baseHourlyRate;

    // Post-processing cost
    const postProcessingCost = config?.postProcessing?.reduce((total, serviceId) => {
      return total + (postProcessingPrices?.[serviceId] || 0) * config?.quantity;
    }, 0);

    // Express delivery cost
    const expressCost = config?.expressDelivery ? (materialCost + printingCost) * 0.5 : 0;

    // Service fee (platform fee)
    const serviceFee = (materialCost + printingCost + postProcessingCost) * 0.15;

    // Total
    const total = materialCost + printingCost + postProcessingCost + expressCost + serviceFee;

    const newPricing = {
      materialCost: Math.round(materialCost),
      printingCost: Math.round(printingCost),
      postProcessingCost: Math.round(postProcessingCost),
      expressCost: Math.round(expressCost),
      serviceFee: Math.round(serviceFee),
      total: Math.round(total)
    };

    setPricing(newPricing);
    onPriceChange?.(newPricing);
  }, [config, selectedFile, onPriceChange]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('cs-CZ', {
      style: 'currency',
      currency: 'CZK',
      minimumFractionDigits: 0
    })?.format(price);
  };

  const getDeliveryEstimate = () => {
    if (config?.expressDelivery) {
      return "Zítra do 18:00";
    }
    
    const baseDeliveryDays = 3;
    const qualityDelay = {
      draft: 0,
      standard: 1,
      fine: 2,
      ultra: 3
    };
    
    const totalDays = baseDeliveryDays + (qualityDelay?.[config?.quality] || 1);
    const deliveryDate = new Date();
    deliveryDate?.setDate(deliveryDate?.getDate() + totalDays);
    
    return deliveryDate?.toLocaleDateString('cs-CZ', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
  };

  if (!config || !selectedFile) {
    return (
      <div className="bg-card border border-border rounded-xl p-8 text-center">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon name="Calculator" size={24} className="text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Kalkulace ceny</h3>
        <p className="text-sm text-muted-foreground">
          Nahrajte model a nakonfigurujte parametry pro výpočet ceny
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Price Summary */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-foreground flex items-center">
            <Icon name="Calculator" size={20} className="mr-2" />
            Celková cena
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowBreakdown(!showBreakdown)}
          >
            <Icon name={showBreakdown ? "ChevronUp" : "ChevronDown"} size={16} className="mr-1" />
            Detail
          </Button>
        </div>

        <div className="text-center mb-6">
          <div className="text-4xl font-bold text-foreground mb-2">
            {formatPrice(pricing?.total)}
          </div>
          <p className="text-sm text-muted-foreground">
            za {config?.quantity} {config?.quantity === 1 ? 'kus' : config?.quantity < 5 ? 'kusy' : 'kusů'}
          </p>
          {config?.quantity > 1 && (
            <p className="text-xs text-muted-foreground mt-1">
              {formatPrice(pricing?.total / config?.quantity)} za kus
            </p>
          )}
        </div>

        {/* Express Badge */}
        {config?.expressDelivery && (
          <div className="bg-warning/10 border border-warning/20 rounded-lg p-3 mb-4">
            <div className="flex items-center space-x-2">
              <Icon name="Zap" size={16} className="text-warning" />
              <span className="text-sm font-medium text-warning">Expresní tisk</span>
              <span className="text-xs text-muted-foreground">+50% k základní ceně</span>
            </div>
          </div>
        )}

        {/* Delivery Estimate */}
        <div className="bg-muted/30 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Icon name="Truck" size={16} className="text-primary" />
              <span className="text-sm font-medium text-foreground">Doručení</span>
            </div>
            <span className="text-sm font-semibold text-foreground">
              {getDeliveryEstimate()}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Zdarma v Ostravě • Ostatní města +99 Kč
          </p>
        </div>

        {/* Price Breakdown */}
        {showBreakdown && (
          <div className="space-y-3 pt-4 border-t border-border">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Materiál ({config?.material?.toUpperCase()})</span>
              <span className="text-foreground">{formatPrice(pricing?.materialCost)}</span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tisk ({config?.quality})</span>
              <span className="text-foreground">{formatPrice(pricing?.printingCost)}</span>
            </div>
            
            {pricing?.postProcessingCost > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Dodatečné služby</span>
                <span className="text-foreground">{formatPrice(pricing?.postProcessingCost)}</span>
              </div>
            )}
            
            {pricing?.expressCost > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Expresní příplatek</span>
                <span className="text-warning">{formatPrice(pricing?.expressCost)}</span>
              </div>
            )}
            
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Servisní poplatek</span>
              <span className="text-foreground">{formatPrice(pricing?.serviceFee)}</span>
            </div>
            
            <div className="border-t border-border pt-2">
              <div className="flex justify-between font-semibold">
                <span className="text-foreground">Celkem</span>
                <span className="text-foreground">{formatPrice(pricing?.total)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Savings Opportunities */}
      <div className="bg-success/5 border border-success/20 rounded-xl p-4">
        <div className="flex items-start space-x-3">
          <Icon name="Lightbulb" size={16} className="text-success mt-0.5" />
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-success">Tipy pro úsporu</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Snižte výplň na 15% pro úsporu až 20%</li>
              <li>• Zvolte rychlou kvalitu pro úsporu času i peněz</li>
              <li>• Objednejte více kusů najednou pro lepší cenu za kus</li>
              {config?.expressDelivery && (
                <li>• Zrušte expresní doručení a ušetřete {formatPrice(pricing?.expressCost)}</li>
              )}
            </ul>
          </div>
        </div>
      </div>
      {/* Material Info */}
      <div className="bg-card border border-border rounded-xl p-4">
        <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center">
          <Icon name="Info" size={16} className="mr-2" />
          Informace o materiálu
        </h4>
        
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <p className="text-muted-foreground mb-1">Vlastnosti:</p>
            <ul className="text-foreground space-y-0.5">
              {config?.material === 'pla' && (
                <>
                  <li>• Snadný tisk</li>
                  <li>• Biologicky rozložitelný</li>
                  <li>• Nízká teplota tisku</li>
                </>
              )}
              {config?.material === 'abs' && (
                <>
                  <li>• Vysoká pevnost</li>
                  <li>• Odolný proti teplu</li>
                  <li>• Vhodný pro funkční díly</li>
                </>
              )}
              {config?.material === 'petg' && (
                <>
                  <li>• Chemicky odolný</li>
                  <li>• Průhledný</li>
                  <li>• Potravinářsky bezpečný</li>
                </>
              )}
            </ul>
          </div>
          
          <div>
            <p className="text-muted-foreground mb-1">Použití:</p>
            <ul className="text-foreground space-y-0.5">
              {config?.material === 'pla' && (
                <>
                  <li>• Prototypy</li>
                  <li>• Dekorativní předměty</li>
                  <li>• Hračky</li>
                </>
              )}
              {config?.material === 'abs' && (
                <>
                  <li>• Automobilové díly</li>
                  <li>• Elektronické kryty</li>
                  <li>• Nástroje</li>
                </>
              )}
              {config?.material === 'petg' && (
                <>
                  <li>• Lahve a nádoby</li>
                  <li>• Ochranné kryty</li>
                  <li>• Průhledné díly</li>
                </>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingCalculator;