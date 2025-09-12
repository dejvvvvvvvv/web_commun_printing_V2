import React, { Suspense, useState, useEffect, useLayoutEffect, useRef } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls, useGLTF, Bounds, Html } from '@react-three/drei';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import * as THREE from 'three';
import Icon from '../../../components/AppIcon';

const Model = ({ url, extension, onDimensionsChange }) => {
    const modelRef = useRef();
    
    const modelObject = extension === 'stl' 
        ? useLoader(STLLoader, url)
        : useGLTF(url).scene;

    useLayoutEffect(() => {
        if (!modelRef.current) return;

        modelRef.current.traverse(child => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });

        const box = new THREE.Box3().setFromObject(modelRef.current);
        const size = box.getSize(new THREE.Vector3());
        onDimensionsChange(size);
    }, [modelObject, onDimensionsChange]);

    if (extension === 'stl') {
        return (
            <mesh ref={modelRef} castShadow receiveShadow geometry={modelObject}>
                <meshStandardMaterial color={'#E5E7EB'} />
            </mesh>
        );
    }
    
    return <primitive ref={modelRef} object={modelObject} />;
};

const ModelViewer = ({ selectedFile }) => {
    const [dimensions, setDimensions] = useState(null);
    const [modelKey, setModelKey] = useState(0);
    const [fileUrl, setFileUrl] = useState(null);
    const [fileExtension, setFileExtension] = useState('');
    const [error, setError] = useState(null);

    useEffect(() => {
        if (selectedFile && selectedFile.file) {
            const extension = selectedFile.file.name.split('.').pop().toLowerCase();
            
            if (!['stl', 'gltf', 'glb'].includes(extension)) {
                setError(`Soubory typu ".${extension}" nejsou podporovány.`);
                setFileUrl(null);
                setDimensions(null);
                return;
            }

            const url = URL.createObjectURL(selectedFile.file);
            setFileUrl(url);
            setFileExtension(extension);
            setModelKey(prevKey => prevKey + 1);
            setDimensions(null);
            setError(null);

            return () => URL.revokeObjectURL(url);
        } else {
            setFileUrl(null);
            setFileExtension('');
            setDimensions(null);
            setError(null);
        }
    }, [selectedFile]);
    
    const handleDimensions = (size) => {
        setTimeout(() => setDimensions(size), 0);
    };

    return (
        <div className="bg-card border border-border rounded-xl flex flex-col">
            <div className="p-4 border-b border-border flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">Náhled modelu</h3>
                <button className="p-1 text-muted-foreground hover:text-foreground">
                    <Icon name="Expand" size={16} />
                </button>
            </div>

            <div className="flex-grow flex items-center justify-center p-4 min-h-[450px]">
                {fileUrl ? (
                    <Canvas key={modelKey} camera={{ fov: 50 }} shadows>
                        <ambientLight intensity={0.6} />
                        
                        {/* Main light (Key Light) */}
                        <directionalLight
                            position={[10, 10, 5]}
                            intensity={1.5}
                            castShadow
                            shadow-mapSize-width={2048}
                            shadow-mapSize-height={2048}
                            shadow-bias={-0.001}
                        />

                        {/* Fill light */}
                        <directionalLight
                            position={[-10, 10, -5]}
                            intensity={0.4}
                        />

                        {/* Back light */}
                        <directionalLight
                            position={[0, -10, -10]}
                            intensity={0.6}
                        />
                        
                        <Suspense fallback={<Html center><p className="text-foreground">Načítání...</p></Html>}> 
                            <Bounds fit clip observe margin={1.1}>
                                <Model 
                                    url={fileUrl} 
                                    extension={fileExtension} 
                                    onDimensionsChange={handleDimensions} 
                                />
                            </Bounds>
                        </Suspense>
                        
                        <OrbitControls makeDefault />
                    </Canvas>
                ) : (
                    <div className="text-center">
                        {error ? (
                             <p className="text-sm text-destructive">{error}</p>
                        ) : (
                            <>
                                <Icon name="Box" size={48} className="text-muted-foreground mx-auto mb-4" />
                                <p className="text-sm text-muted-foreground">Pro náhled nahrajte soubor</p>
                            </>
                        )}
                    </div>
                )}
            </div>

            {dimensions && (
                <div className="p-4 border-t border-border">
                    <h4 className="text-sm font-semibold text-foreground mb-2">Přibližné rozměry modelu</h4>
                    <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="bg-muted/50 p-2 rounded-md">
                            <p className="text-xs text-muted-foreground">Šířka (X)</p>
                            <p className="text-sm font-mono font-medium text-foreground">{dimensions.x.toFixed(2)} mm</p>
                        </div>
                        <div className="bg-muted/50 p-2 rounded-md">
                            <p className="text-xs text-muted-foreground">Výška (Y)</p>
                            <p className="text-sm font-mono font-medium text-foreground">{dimensions.y.toFixed(2)} mm</p>
                        </div>
                        <div className="bg-muted/50 p-2 rounded-md">
                            <p className="text-xs text-muted-foreground">Hloubka (Z)</p>
                            <p className="text-sm font-mono font-medium text-foreground">{dimensions.z.toFixed(2)} mm</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ModelViewer;
