import React, { Suspense, useMemo, useState, useEffect } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls, Stage, Center } from '@react-three/drei';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import * as THREE from 'three';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

// Component to load and display the 3D model
const Model = ({ url }) => {
  const geom = useLoader(STLLoader, url);
  
  const mesh = useMemo(() => {
    geom.computeVertexNormals();
    return new THREE.Mesh(geom, new THREE.MeshStandardMaterial({
      color: '#1E90FF',
      metalness: 0.1,
      roughness: 0.5,
    }));
  }, [geom]);
  
  return <primitive object={mesh} />;
};

// Component to calculate and display model info
const ModelInfo = ({ file }) => {
    const [dimensions, setDimensions] = useState(null);
    const [volume, setVolume] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (file && file.file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const loader = new STLLoader();
                    const geometry = loader.parse(event.target.result);
                    
                    if (!geometry.hasAttribute('position') || geometry.getAttribute('position').count === 0) {
                        setError("Nelze analyzovat model. Soubor může být poškozený nebo prázdný.");
                        return;
                    }
                    
                    geometry.computeBoundingBox();
                    const box = geometry.boundingBox;
                    const size = new THREE.Vector3();
                    box.getSize(size);
                    setDimensions(size);

                    let vol = 0;
                    const pos = geometry.getAttribute('position');
                    const p1 = new THREE.Vector3(), p2 = new THREE.Vector3(), p3 = new THREE.Vector3();
                    for (let i = 0; i < pos.count; i += 3) {
                        p1.fromBufferAttribute(pos, i);
                        p2.fromBufferAttribute(pos, i + 1);
                        p3.fromBufferAttribute(pos, i + 2);
                        vol += p1.dot(p2.cross(p3));
                    }
                    setVolume(Math.abs(vol / 6.0));
                    setError(null);
                } catch (e) {
                    console.error("Chyba při parsování STL: ", e);
                    setError("Chyba při čtení souboru modelu.");
                }
            };
            reader.onerror = () => {
                setError("Nepodařilo se přečíst soubor.");
            };
            reader.readAsArrayBuffer(file.file);
        }
    }, [file]);

    if (error) {
        return <p className="text-xs text-destructive">{error}</p>;
    }

    if (!dimensions || volume === null) {
        return <p className="text-xs text-muted-foreground">Analyzuji model...</p>;
    }

    return (
        <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="text-center p-2 bg-muted/50 rounded-md">
                <p className="font-bold text-foreground">{(dimensions.x).toFixed(1)}</p>
                <p className="text-muted-foreground">X (mm)</p>
            </div>
            <div className="text-center p-2 bg-muted/50 rounded-md">
                <p className="font-bold text-foreground">{(dimensions.y).toFixed(1)}</p>
                <p className="text-muted-foreground">Y (mm)</p>
            </div>
            <div className="text-center p-2 bg-muted/50 rounded-md">
                <p className="font-bold text-foreground">{(dimensions.z).toFixed(1)}</p>
                <p className="text-muted-foreground">Z (mm)</p>
            </div>
             <div className="col-span-3 text-center p-2 bg-muted/50 rounded-md">
                <p className="font-bold text-foreground">{(volume / 1000).toFixed(2)} cm³</p>
                <p className="text-muted-foreground">Objem</p>
            </div>
        </div>
    );
};


const ModelViewer = ({ selectedFile, onRemove }) => {
  const [fileUrl, setFileUrl] = useState(null);
  const [isFullScreen, setIsFullScreen] = useState(false);

  useEffect(() => {
    if (selectedFile && selectedFile.file) {
      const url = URL.createObjectURL(selectedFile.file);
      setFileUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [selectedFile]);

  const toggleFullScreen = () => setIsFullScreen(!isFullScreen);

  const viewerContent = (
    <div className={`relative bg-card border border-border rounded-xl aspect-square flex flex-col items-center justify-center text-center ${isFullScreen ? 'fixed inset-0 z-50 p-4' : 'p-2'}`}>
      {selectedFile ? (
        <>
          <div className="absolute top-2 right-2 z-10 flex space-x-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleFullScreen}
              aria-label={isFullScreen ? "Zavřít celé okno" : "Celá obrazovka"}
            >
              <Icon name={isFullScreen ? "Minimize" : "Expand"} size={16} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                if (isFullScreen) setIsFullScreen(false);
                onRemove();
              }}
              aria-label="Odstranit model"
            >
              <Icon name="X" size={16} />
            </Button>
          </div>
          
          <div className="w-full h-full">
            <Suspense fallback={
              <div className="flex flex-col items-center justify-center h-full">
                <Icon name="Loader" className="animate-spin text-primary" size={32} />
                <p className="text-sm text-muted-foreground mt-2">Načítám model...</p>
              </div>
            }>
              {fileUrl && (
                <Canvas shadows camera={{ position: [0, 0, 150], fov: 50 }}>
                  <Stage environment="city" intensity={0.6} adjustCamera={1.2}>
                    <Center>
                        <Model url={fileUrl} />
                    </Center>
                  </Stage>
                  <OrbitControls autoRotate autoRotateSpeed={1.0} />
                </Canvas>
              )}
            </Suspense>
          </div>
          
          {!isFullScreen && (
            <div className="absolute bottom-0 left-0 right-0 p-3 bg-card/80 backdrop-blur-sm rounded-b-xl border-t border-border">
                 <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-foreground truncate" title={selectedFile.name}>{selectedFile.name}</p>
                    <p className="text-xs text-muted-foreground whitespace-nowrap pl-2">{selectedFile.size > 0 ? (selectedFile.size / (1024 * 1024)).toFixed(2) + " MB" : ""}</p>
                </div>
                <ModelInfo file={selectedFile} />
            </div>
          )}
        </>
      ) : (
        <div className="space-y-4 p-4">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto">
            <Icon name="Scan" size={40} className="text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-foreground">Náhled modelu</h3>
          <p className="text-sm text-muted-foreground">
            Po nahrání souboru se zde zobrazí náhled vašeho 3D modelu a jeho parametry.
          </p>
        </div>
      )}
    </div>
  );

  return isFullScreen ? <>{viewerContent}</> : viewerContent;
};

export default ModelViewer;