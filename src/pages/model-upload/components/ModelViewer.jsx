import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage } from '@react-three/drei';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const Model = () => {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#1E90FF" />
    </mesh>
  );
};

const ModelViewer = ({ selectedFile, onRemove }) => {
  return (
    <div className="relative bg-card border border-border rounded-xl aspect-square flex flex-col items-center justify-center p-2 text-center">
      {selectedFile ? (
        <>
          <div className="absolute top-2 right-2 z-10">
            <Button
              variant="ghost"
              size="icon"
              onClick={onRemove}
              aria-label="Odstranit model"
            >
              <Icon name="X" size={16} />
            </Button>
          </div>
          <Suspense fallback={
            <div className="flex flex-col items-center justify-center h-full">
              <Icon name="Loader" className="animate-spin text-primary" size={32} />
              <p className="text-sm text-muted-foreground mt-2">Načítám model...</p>
            </div>
          }>
            <Canvas shadows camera={{ position: [0, 2, 5], fov: 50 }}>
              <Stage environment="city" intensity={0.6}>
                <Model />
              </Stage>
              <OrbitControls autoRotate />
            </Canvas>
          </Suspense>
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
