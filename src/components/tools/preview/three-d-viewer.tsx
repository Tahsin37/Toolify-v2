'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Upload, Box, Grid3X3, Loader2, Info, Palette, RotateCcw
} from 'lucide-react';

export function ThreeDViewer() {
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState('');
    const [fileName, setFileName] = React.useState('');
    const [showGrid, setShowGrid] = React.useState(true);
    const [wireframe, setWireframe] = React.useState(false);
    const [bgColor, setBgColor] = React.useState('#1e293b');
    const [modelColor, setModelColor] = React.useState('#8b5cf6');
    const [exampleModel, setExampleModel] = React.useState<string | null>(null);
    const [initialized, setInitialized] = React.useState(false);

    const threeRef = React.useRef<{
        scene: any;
        camera: any;
        renderer: any;
        controls: any;
        mesh: any;
        grid: any;
        animationId: number;
    } | null>(null);

    const fileInputRef = React.useRef<HTMLInputElement>(null);

    // Initialize Three.js scene
    const initScene = React.useCallback(async () => {
        if (!canvasRef.current || threeRef.current) return;

        try {
            const THREE = await import('three');
            const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls.js');

            const canvas = canvasRef.current;
            const width = canvas.clientWidth;
            const height = canvas.clientHeight;

            // Scene
            const scene = new THREE.Scene();
            scene.background = new THREE.Color(bgColor);

            // Camera
            const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
            camera.position.set(4, 4, 4);

            // Renderer
            const renderer = new THREE.WebGLRenderer({
                canvas,
                antialias: true,
                alpha: true
            });
            renderer.setSize(width, height);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            renderer.shadowMap.enabled = true;

            // Controls
            const controls = new OrbitControls(camera, canvas);
            controls.enableDamping = true;
            controls.dampingFactor = 0.05;
            controls.minDistance = 2;
            controls.maxDistance = 20;

            // Lights
            const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
            scene.add(ambientLight);

            const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
            directionalLight.position.set(10, 10, 5);
            directionalLight.castShadow = true;
            scene.add(directionalLight);

            const backLight = new THREE.DirectionalLight(0xffffff, 0.3);
            backLight.position.set(-10, -10, -5);
            scene.add(backLight);

            // Grid
            const grid = new THREE.GridHelper(10, 20, 0x6366f1, 0x334155);
            scene.add(grid);

            threeRef.current = {
                scene,
                camera,
                renderer,
                controls,
                mesh: null,
                grid,
                animationId: 0
            };

            // Animation loop
            const animate = () => {
                if (!threeRef.current) return;
                threeRef.current.animationId = requestAnimationFrame(animate);
                controls.update();
                renderer.render(scene, camera);
            };
            animate();

            // Resize handler
            const handleResize = () => {
                if (!canvasRef.current || !threeRef.current) return;
                const width = canvasRef.current.clientWidth;
                const height = canvasRef.current.clientHeight;
                threeRef.current.camera.aspect = width / height;
                threeRef.current.camera.updateProjectionMatrix();
                threeRef.current.renderer.setSize(width, height);
            };
            window.addEventListener('resize', handleResize);

            setInitialized(true);

        } catch (err) {
            console.error('Three.js init error:', err);
            setError('Failed to initialize 3D viewer: ' + (err as Error).message);
        }
    }, [bgColor]);

    // Initialize on mount
    React.useEffect(() => {
        initScene();

        return () => {
            if (threeRef.current) {
                cancelAnimationFrame(threeRef.current.animationId);
                threeRef.current.renderer.dispose();
                threeRef.current = null;
            }
        };
    }, [initScene]);

    // Update background color
    React.useEffect(() => {
        if (threeRef.current) {
            import('three').then(THREE => {
                threeRef.current!.scene.background = new THREE.Color(bgColor);
            });
        }
    }, [bgColor]);

    // Update grid visibility
    React.useEffect(() => {
        if (threeRef.current && threeRef.current.grid) {
            threeRef.current.grid.visible = showGrid;
        }
    }, [showGrid]);

    // Update wireframe
    React.useEffect(() => {
        if (threeRef.current && threeRef.current.mesh && threeRef.current.mesh.material) {
            threeRef.current.mesh.material.wireframe = wireframe;
        }
    }, [wireframe]);

    // Update model color
    React.useEffect(() => {
        if (threeRef.current && threeRef.current.mesh && threeRef.current.mesh.material) {
            import('three').then(THREE => {
                threeRef.current!.mesh.material.color = new THREE.Color(modelColor);
            });
        }
    }, [modelColor]);

    const loadExample = async (type: string) => {
        if (!threeRef.current) {
            await initScene();
        }
        if (!threeRef.current) return;

        setLoading(true);
        setExampleModel(type);
        setFileName(`Example: ${type}`);
        setError('');

        try {
            const THREE = await import('three');

            // Remove existing mesh
            if (threeRef.current.mesh) {
                threeRef.current.scene.remove(threeRef.current.mesh);
                threeRef.current.mesh.geometry.dispose();
                threeRef.current.mesh.material.dispose();
            }

            let geometry: any;
            switch (type) {
                case 'cube':
                    geometry = new THREE.BoxGeometry(2, 2, 2);
                    break;
                case 'sphere':
                    geometry = new THREE.SphereGeometry(1.5, 32, 32);
                    break;
                case 'torus':
                    geometry = new THREE.TorusGeometry(1.2, 0.5, 16, 48);
                    break;
                case 'knot':
                    geometry = new THREE.TorusKnotGeometry(1, 0.3, 100, 16);
                    break;
                case 'cone':
                    geometry = new THREE.ConeGeometry(1.2, 2.5, 32);
                    break;
                case 'cylinder':
                    geometry = new THREE.CylinderGeometry(1, 1, 2.5, 32);
                    break;
                default:
                    geometry = new THREE.BoxGeometry(2, 2, 2);
            }

            const material = new THREE.MeshStandardMaterial({
                color: modelColor,
                wireframe: wireframe,
                side: THREE.DoubleSide,
                metalness: 0.1,
                roughness: 0.5,
            });

            const mesh = new THREE.Mesh(geometry, material);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            threeRef.current.mesh = mesh;
            threeRef.current.scene.add(mesh);

        } catch (err) {
            console.error('Error loading example:', err);
            setError('Failed to load example: ' + (err as Error).message);
        }

        setLoading(false);
    };

    const loadFile = async (file: File) => {
        if (!threeRef.current) {
            await initScene();
        }
        if (!threeRef.current) return;

        setLoading(true);
        setError('');
        setExampleModel(null);
        setFileName(file.name);

        try {
            const THREE = await import('three');
            const extension = file.name.split('.').pop()?.toLowerCase();
            const arrayBuffer = await file.arrayBuffer();

            // Remove existing mesh
            if (threeRef.current.mesh) {
                threeRef.current.scene.remove(threeRef.current.mesh);
            }

            let geometry: any = null;

            if (extension === 'stl') {
                const { STLLoader } = await import('three/examples/jsm/loaders/STLLoader.js');
                const loader = new STLLoader();
                geometry = loader.parse(arrayBuffer);
            } else if (extension === 'obj') {
                const { OBJLoader } = await import('three/examples/jsm/loaders/OBJLoader.js');
                const loader = new OBJLoader();
                const text = new TextDecoder().decode(arrayBuffer);
                const object = loader.parse(text);
                object.traverse((child: any) => {
                    if (child.isMesh) {
                        geometry = child.geometry;
                    }
                });
            } else if (extension === 'gltf' || extension === 'glb') {
                const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');
                const loader = new GLTFLoader();
                const blob = new Blob([arrayBuffer]);
                const url = URL.createObjectURL(blob);

                const gltf = await new Promise<any>((resolve, reject) => {
                    loader.load(url, resolve, undefined, reject);
                });

                gltf.scene.traverse((child: any) => {
                    if (child.isMesh) {
                        geometry = child.geometry;
                    }
                });
                URL.revokeObjectURL(url);
            } else {
                throw new Error(`Unsupported format: ${extension}`);
            }

            if (geometry) {
                geometry.center();
                geometry.computeVertexNormals();

                // Normalize scale
                geometry.computeBoundingBox();
                const box = geometry.boundingBox;
                const maxDim = Math.max(
                    box.max.x - box.min.x,
                    box.max.y - box.min.y,
                    box.max.z - box.min.z
                );
                const scale = 3 / maxDim;
                geometry.scale(scale, scale, scale);

                const material = new THREE.MeshStandardMaterial({
                    color: modelColor,
                    wireframe: wireframe,
                    side: THREE.DoubleSide,
                });

                const mesh = new THREE.Mesh(geometry, material);
                mesh.castShadow = true;
                mesh.receiveShadow = true;
                threeRef.current.mesh = mesh;
                threeRef.current.scene.add(mesh);
            } else {
                throw new Error('Could not extract geometry from file');
            }
        } catch (err) {
            console.error('Load error:', err);
            setError(err instanceof Error ? err.message : 'Failed to load model');
        }

        setLoading(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) loadFile(file);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) loadFile(file);
    };

    const resetCamera = () => {
        if (threeRef.current && threeRef.current.camera && threeRef.current.controls) {
            threeRef.current.camera.position.set(4, 4, 4);
            threeRef.current.controls.reset();
        }
    };

    const bgColors = ['#1e293b', '#0f172a', '#ffffff', '#f8fafc', '#18181b'];
    const modelColors = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <Card className="p-3 bg-white border border-slate-200">
                <div className="flex flex-wrap items-center gap-2">
                    <Button
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-violet-600 hover:bg-violet-700"
                    >
                        <Upload className="h-4 w-4 mr-1" />
                        Load File
                    </Button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".obj,.stl,.gltf,.glb"
                        onChange={handleFileChange}
                        className="hidden"
                    />

                    <div className="h-6 w-px bg-slate-200" />

                    <span className="text-xs text-slate-500">Examples:</span>
                    {['cube', 'sphere', 'torus', 'knot', 'cone'].map(type => (
                        <Button
                            key={type}
                            size="sm"
                            variant={exampleModel === type ? 'primary' : 'outline'}
                            onClick={() => loadExample(type)}
                            className="h-7 text-xs"
                        >
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                        </Button>
                    ))}

                    <div className="h-6 w-px bg-slate-200" />

                    <Button
                        size="sm"
                        variant={showGrid ? 'primary' : 'outline'}
                        onClick={() => setShowGrid(!showGrid)}
                        title="Toggle Grid"
                    >
                        <Grid3X3 className="h-4 w-4" />
                    </Button>
                    <Button
                        size="sm"
                        variant={wireframe ? 'primary' : 'outline'}
                        onClick={() => setWireframe(!wireframe)}
                        title="Toggle Wireframe"
                    >
                        <Box className="h-4 w-4" />
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={resetCamera}
                        title="Reset Camera"
                    >
                        <RotateCcw className="h-4 w-4" />
                    </Button>

                    <div className="h-6 w-px bg-slate-200" />

                    <div className="flex items-center gap-1">
                        <Palette className="h-4 w-4 text-slate-400" />
                        {modelColors.map(c => (
                            <button
                                key={c}
                                onClick={() => setModelColor(c)}
                                className={`w-5 h-5 rounded-full border-2 transition-all ${modelColor === c ? 'border-slate-900 scale-110' : 'border-transparent'
                                    }`}
                                style={{ backgroundColor: c }}
                            />
                        ))}
                    </div>

                    <div className="flex items-center gap-1 ml-2">
                        <span className="text-xs text-slate-400">BG:</span>
                        {bgColors.map(c => (
                            <button
                                key={c}
                                onClick={() => setBgColor(c)}
                                className={`w-5 h-5 rounded border transition-all ${bgColor === c ? 'ring-2 ring-violet-500' : ''
                                    }`}
                                style={{ backgroundColor: c }}
                            />
                        ))}
                    </div>
                </div>
            </Card>

            {/* 3D Canvas */}
            <Card
                className="relative overflow-hidden border border-slate-200"
                style={{ height: '500px', backgroundColor: bgColor }}
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
            >
                <canvas
                    ref={canvasRef}
                    className="w-full h-full block"
                    style={{ touchAction: 'none' }}
                />

                {!initialized && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
                    </div>
                )}

                {initialized && !threeRef.current?.mesh && !loading && (
                    <div
                        className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
                    >
                        <Box className="h-16 w-16 text-slate-400 mb-4" />
                        <p className="text-lg font-medium text-slate-400">Click an example above</p>
                        <p className="text-sm text-slate-500 mt-1">Or drop OBJ, STL, GLTF file</p>
                    </div>
                )}

                {loading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                        <div className="flex flex-col items-center">
                            <Loader2 className="h-8 w-8 animate-spin text-violet-500 mb-2" />
                            <span className="text-white">Loading model...</span>
                        </div>
                    </div>
                )}

                {fileName && threeRef.current?.mesh && (
                    <div className="absolute bottom-3 left-3 bg-black/60 text-white text-xs px-3 py-2 rounded-lg backdrop-blur">
                        <div className="flex items-center gap-2">
                            <Box className="h-3 w-3" />
                            <span>{fileName}</span>
                        </div>
                        <p className="text-slate-300 mt-1">Drag to rotate • Scroll to zoom</p>
                    </div>
                )}
            </Card>

            {error && (
                <Card className="p-4 bg-red-50 border border-red-200">
                    <p className="text-red-700">{error}</p>
                </Card>
            )}

            <Card className="p-4 bg-violet-50 border border-violet-200">
                <div className="flex items-start gap-2">
                    <Info className="h-5 w-5 text-violet-600 mt-0.5" />
                    <div>
                        <h4 className="font-semibold text-violet-800 mb-1">3D Model Viewer</h4>
                        <p className="text-sm text-violet-700">
                            View 3D models directly in your browser. Supports OBJ, STL, GLTF/GLB formats.
                            Click an example shape to try it out, or upload your own 3D model file.
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    );
}
