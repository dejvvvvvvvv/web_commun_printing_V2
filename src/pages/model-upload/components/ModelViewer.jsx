import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Icon from 'components/AppIcon';
import Button from 'components/ui/Button';

const ModelViewer = ({ selectedFile, onAnalysisChange }) => {
  const mountRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [modelInfo, setModelInfo] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  useEffect(() => {
    const currentMount = mountRef.current;

    if (!selectedFile || !selectedFile.file) {
      setIsLoading(false);
      setError(null);
      setModelInfo(null);
      if (onAnalysisChange) onAnalysisChange(null);
      // The cleanup function from the previous effect will handle DOM clearing
      return;
    }

    setIsLoading(true);
    setError(null);
    setModelInfo(null);

    let animationFrameId;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, currentMount.clientWidth / currentMount.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    const controls = new OrbitControls(camera, renderer.domElement);

    scene.background = isFullscreen ? null : new THREE.Color(0xf0f0f0);
    camera.position.z = 100;
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    controls.enableDamping = true;

    // Clear the mount point and append the new renderer
    currentMount.innerHTML = '';
    currentMount.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.9);
    directionalLight.position.set(50, 50, 50);
    scene.add(directionalLight);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const fileContent = event.target.result;
        const loader = selectedFile.name.toLowerCase().endsWith('.stl') ? new STLLoader() : new OBJLoader();
        const geometryOrObject = loader.parse(fileContent);
        
        const material = new THREE.MeshStandardMaterial({ color: 0x0055ff, metalness: 0.1, roughness: 0.5 });
        const mesh = geometryOrObject instanceof THREE.Mesh ? geometryOrObject : new THREE.Mesh(geometryOrObject, material);
        scene.add(mesh);

        const box = new THREE.Box3().setFromObject(mesh);
        const center = box.getCenter(new THREE.Vector3());
        mesh.position.sub(center);
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const fov = camera.fov * (Math.PI / 180);
        camera.position.z = Math.abs(maxDim / Math.tan(fov / 2)) * 1.2;
        camera.lookAt(scene.position);
        controls.update();

        let volume = 0;
        if (mesh.geometry?.isBufferGeometry) {
          const position = mesh.geometry.attributes.position;
          if (position) {
            for (let i = 0; i < position.count; i += 3) {
              const v1 = new THREE.Vector3().fromBufferAttribute(position, i);
              const v2 = new THREE.Vector3().fromBufferAttribute(position, i + 1);
              const v3 = new THREE.Vector3().fromBufferAttribute(position, i + 2);
              volume += v1.clone().cross(v2).dot(v3);
            }
            volume = Math.abs(volume / 6.0);
          }
        }

        const analysis = { dimensions: { x: size.x, y: size.y, z: size.z }, volume };
        setModelInfo(analysis);
        if (onAnalysisChange) onAnalysisChange(analysis);
      } catch (e) {
        console.error("Error processing model:", e);
        setError("Chyba při zpracování modelu.");
      } finally {
        setIsLoading(false);
      }
    };
    reader.onerror = () => {
      setError("Chyba při čtení souboru.");
      setIsLoading(false);
    };
    reader.readAsArrayBuffer(selectedFile.file);

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (mountRef.current) {
        const { clientWidth, clientHeight } = mountRef.current;
        camera.aspect = clientWidth / clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(clientWidth, clientHeight);
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      
      controls.dispose();
      renderer.dispose();
      scene.traverse(object => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
            if (Array.isArray(object.material)) {
                object.material.forEach(material => material.dispose());
            } else {
                object.material.dispose();
            }
        }
      });
      
      if (currentMount) {
        currentMount.innerHTML = '';
      }
    };
  }, [selectedFile, isFullscreen, onAnalysisChange]);

  return (
    <div className={`flex flex-col ${isFullscreen ? 'fixed inset-0 z-50 bg-black/80 backdrop-blur-sm text-white pt-20' : 'bg-card border border-border rounded-xl text-foreground'}`}>
      <div className={`flex items-center justify-between p-4 border-b ${isFullscreen ? 'border-white/20' : 'border-border'}`}>
        <h3 className="text-lg font-semibold flex items-center">
          <Icon name="Box" size={20} className="mr-2" />
          Prohlížeč modelu
        </h3>
        <div className="flex items-center space-x-1">
          <Button variant="ghost" size="icon" onClick={toggleFullscreen} className={isFullscreen ? 'hover:bg-white/10' : ''}>
            <Icon name={isFullscreen ? "Minimize" : "Maximize"} size={16} />
          </Button>
        </div>
      </div>
      
      <div ref={mountRef} className="flex-grow relative min-h-[300px]">
        {!selectedFile && !isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className={isFullscreen ? 'text-gray-400' : 'text-muted-foreground'}>Po nahrání se zde zobrazí model.</p>
          </div>
        )}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <p>Analyzuji model...</p>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-red-500/10">
            <p className="text-red-500 text-sm px-4 text-center">{error}</p>
          </div>
        )}
      </div>

      {modelInfo && (
        <div className={`p-4 border-t text-sm ${isFullscreen ? 'border-white/20' : 'border-border'}`}>
          <h4 className="font-medium mb-2">Analýza modelu</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <p className={isFullscreen ? 'text-gray-400' : 'text-muted-foreground'}>Rozměry (X/Y/Z)</p>
              <p className="font-mono">{modelInfo.dimensions.x.toFixed(1)}/{modelInfo.dimensions.y.toFixed(1)}/{modelInfo.dimensions.z.toFixed(1)} mm</p>
            </div>
            <div>
              <p className={isFullscreen ? 'text-gray-400' : 'text-muted-foreground'}>Objem</p>
              <p className="font-mono">{(modelInfo.volume / 1000).toFixed(2)} cm³</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModelViewer;
