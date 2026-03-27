'use client';

import { Suspense, useRef, useState, useEffect, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, OrbitControls, Environment, ContactShadows, Html } from '@react-three/drei';
import { motion, AnimatePresence } from 'motion/react';
import { RotateCcw, ZoomIn, ZoomOut, Info, X, Maximize2, Minimize2 } from 'lucide-react';
import * as THREE from 'three';

// ── Cinematic camera fly-in ───────────────────────────────────────────────────
// Starts high + far, eases into final resting position over ~3s
const CAM_START = new THREE.Vector3(8, 12, 14);
const CAM_END = new THREE.Vector3(0, 2.2, 6.5);
const TARGET = new THREE.Vector3(0, 1.2, 0);

function CinematicCamera({ active, onDone }: { active: boolean; onDone: () => void }) {
    const { camera } = useThree();
    const t = useRef(0);
    const done = useRef(false);

    useEffect(() => {
        if (active) {
            camera.position.copy(CAM_START);
            camera.lookAt(TARGET);
            t.current = 0;
            done.current = false;
        }
    }, [active, camera]);

    useFrame((_, delta) => {
        if (!active || done.current) return;
        t.current = Math.min(t.current + delta * 0.38, 1);
        // Smooth ease-out cubic
        const e = 1 - Math.pow(1 - t.current, 3);
        camera.position.lerpVectors(CAM_START, CAM_END, e);
        camera.lookAt(TARGET);
        if (t.current >= 1) {
            done.current = true;
            onDone();
        }
    });

    return null;
}

// ── Camera reset ──────────────────────────────────────────────────────────────
function CameraReset({ trigger }: { trigger: number }) {
    const { camera } = useThree();
    useEffect(() => {
        if (trigger > 0) {
            camera.position.copy(CAM_END);
            camera.lookAt(TARGET);
        }
    }, [trigger, camera]);
    return null;
}

// ── Shrine model ──────────────────────────────────────────────────────────────
function ShrineModel({ onLoaded }: { onLoaded: () => void }) {
    const { scene } = useGLTF('/ShahAbdulLatifShrine.glb');
    const called = useRef(false);

    useEffect(() => {
        if (!scene || called.current) return;
        called.current = true;

        const box = new THREE.Box3().setFromObject(scene);
        const size = new THREE.Vector3();
        box.getSize(size);
        const scale = 3 / Math.max(size.x, size.y, size.z);
        scene.scale.setScalar(scale);

        box.setFromObject(scene);
        scene.position.y -= box.min.y;

        scene.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
                const mesh = child as THREE.Mesh;
                mesh.castShadow = true;
                mesh.receiveShadow = true;
            }
        });

        onLoaded();
    }, [scene, onLoaded]);

    return <primitive object={scene} />;
}

// ── Loader ────────────────────────────────────────────────────────────────────
function Loader() {
    return (
        <Html center>
            <div className="flex flex-col items-center gap-4" style={{ color: '#FFB703' }}>
                <div className="w-12 h-12 border-4 rounded-full animate-spin"
                    style={{ borderColor: 'rgba(255,183,3,0.2)', borderTopColor: '#FFB703' }} />
                <span className="font-lateef text-2xl">لوڊ ٿي رهيو آهي…</span>
            </div>
        </Html>
    );
}

// ── Info panel ────────────────────────────────────────────────────────────────
const INFO_POINTS = [
    { label: 'مزار جو نالو', value: 'ڀٽ شاهه مزار' },
    { label: 'مقام', value: 'ڀٽ شاهه، سنڌ، پاڪستان' },
    { label: 'تعمير', value: '18هين صدي' },
    { label: 'اهميت', value: 'سنڌ جو روحاني مرڪز' },
];

// ── Main ──────────────────────────────────────────────────────────────────────
export default function ShrineViewer({ onComplete }: { onComplete: () => void }) {
    const [loaded, setLoaded] = useState(false);
    const [cinematic, setCinematic] = useState(false); // starts after model loads
    const [orbitEnabled, setOrbitEnabled] = useState(false); // locked during fly-in
    const [resetTrigger, setResetTrigger] = useState(0);
    const [showInfo, setShowInfo] = useState(false);
    const [fullscreen, setFullscreen] = useState(false);
    const controlsRef = useRef<any>(null);

    const handleLoaded = useCallback(() => {
        setLoaded(true);
        // Small pause then start cinematic
        setTimeout(() => setCinematic(true), 400);
    }, []);

    const handleCinematicDone = useCallback(() => {
        setOrbitEnabled(true);
        if (controlsRef.current) {
            controlsRef.current.target.copy(TARGET);
            controlsRef.current.update();
        }
    }, []);

    const handleReset = () => {
        setOrbitEnabled(false);
        setCinematic(false);
        setResetTrigger(t => t + 1);
        setTimeout(() => {
            setCinematic(true);
        }, 50);
    };

    const handleZoom = (dir: 'in' | 'out') => {
        if (!controlsRef.current) return;
        const cam = controlsRef.current.object as THREE.Camera;
        const factor = dir === 'in' ? 0.8 : 1.25;
        cam.position.multiplyScalar(factor);
        controlsRef.current.update();
    };

    return (
        <div className={`flex flex-col w-full h-full font-lateef ${fullscreen ? 'fixed inset-0 z-[999]' : ''}`}
            dir="rtl" style={{ background: '#000' }}>

            <div className="w-full flex flex-col h-full overflow-hidden"
                style={{ borderRadius: fullscreen ? 0 : 24, border: '1px solid rgba(255,183,3,0.2)', height: '100%' }}>

                {/* Header */}
                <div className="flex justify-between items-center px-5 py-3 shrink-0 border-b"
                    style={{ background: '#0a0a0a', borderColor: 'rgba(255,183,3,0.15)' }}>
                    <h2 className="text-xl md:text-2xl font-bold" style={{ color: '#FFB703' }}>
                        ڀٽ شاهه مزار — 3D تجربو
                    </h2>
                    <div className="flex items-center gap-2" dir="ltr">
                        <button onClick={() => setShowInfo(v => !v)}
                            className="p-2 rounded-full border transition-colors"
                            style={{ background: '#111', borderColor: showInfo ? '#FFB703' : '#333', color: '#FFB703' }}>
                            <Info className="w-4 h-4" />
                        </button>
                        <button onClick={() => setFullscreen(v => !v)}
                            className="p-2 rounded-full border transition-colors"
                            style={{ background: '#111', borderColor: '#333', color: '#FFB703' }}>
                            {fullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                        </button>
                    </div>
                </div>

                {/* Canvas */}
                <div className="relative flex-1" style={{ minHeight: fullscreen ? 'calc(100vh - 110px)' : undefined, height: fullscreen ? undefined : 'min(500px, 60vh)' }}>
                    <Canvas shadows camera={{ position: [8, 12, 14], fov: 42 }}
                        gl={{ antialias: true, alpha: false }}
                        style={{ background: 'linear-gradient(180deg,#0a0510 0%,#100a00 100%)' }}>

                        <CinematicCamera active={cinematic} onDone={handleCinematicDone} />
                        <CameraReset trigger={resetTrigger} />

                        {/* Lighting — warm golden shrine feel */}
                        <ambientLight intensity={0.4} />
                        <directionalLight position={[6, 12, 6]} intensity={1.8} castShadow
                            shadow-mapSize={[2048, 2048]} color="#fff8e7" />
                        <pointLight position={[-3, 5, -3]} intensity={1.2} color="#FFB703" />
                        <pointLight position={[3, 1, 5]} intensity={0.5} color="#ff9944" />
                        <pointLight position={[0, 8, 0]} intensity={0.3} color="#ffffff" />

                        <Suspense fallback={<Loader />}>
                            <ShrineModel onLoaded={handleLoaded} />
                            <ContactShadows position={[0, 0, 0]} opacity={0.6} scale={12} blur={2.5} far={5} color="#000" />
                            <Environment preset="night" />
                        </Suspense>

                        <OrbitControls ref={controlsRef}
                            enabled={orbitEnabled}
                            autoRotate={false}
                            enablePan={false}
                            minDistance={2} maxDistance={14}
                            maxPolarAngle={Math.PI / 2}
                            target={[0, 1.2, 0]}
                            makeDefault />
                    </Canvas>

                    {/* Cinematic vignette overlay — fades out after fly-in */}
                    <AnimatePresence>
                        {!orbitEnabled && loaded && (
                            <motion.div className="absolute inset-0 pointer-events-none"
                                initial={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 1.2 }}
                                style={{ background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.7) 100%)' }} />
                        )}
                    </AnimatePresence>

                    {/* Cinematic title card — appears during fly-in */}
                    <AnimatePresence>
                        {loaded && !orbitEnabled && (
                            <motion.div className="absolute inset-0 flex flex-col items-center justify-end pb-20 pointer-events-none"
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                transition={{ duration: 0.8, delay: 0.3 }}>
                                <motion.p className="text-white/40 text-sm tracking-widest uppercase mb-2"
                                    initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.6 }} dir="ltr">
                                    Shah Abdul Latif Bhittai Shrine
                                </motion.p>
                                <motion.h2 className="text-4xl md:text-6xl font-black text-center drop-shadow-2xl"
                                    style={{ color: '#FFB703' }}
                                    initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.8 }} dir="rtl">
                                    ڀٽ شاهه مزار
                                </motion.h2>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Controls — only show after fly-in */}
                    <AnimatePresence>
                        {orbitEnabled && (
                            <motion.div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10"
                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4 }} dir="ltr">
                                {[
                                    { fn: () => handleZoom('in'), icon: <ZoomIn className="w-4 h-4" /> },
                                    { fn: handleReset, icon: <RotateCcw className="w-4 h-4" /> },
                                    { fn: () => handleZoom('out'), icon: <ZoomOut className="w-4 h-4" /> },
                                ].map((b, i) => (
                                    <button key={i} onClick={b.fn}
                                        className="p-3 rounded-full border backdrop-blur-sm transition-colors"
                                        style={{ background: 'rgba(0,0,0,0.6)', borderColor: 'rgba(255,255,255,0.15)', color: '#fff' }}>
                                        {b.icon}
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Hint */}
                    {orbitEnabled && (
                        <div className="absolute top-3 left-1/2 -translate-x-1/2 text-white/30 text-xs pointer-events-none select-none" dir="ltr">
                            Drag · Scroll to zoom
                        </div>
                    )}

                    {/* Info panel */}
                    <AnimatePresence>
                        {showInfo && (
                            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 30 }}
                                className="absolute top-12 right-4 w-64 rounded-2xl p-4 z-20 border"
                                style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)', borderColor: 'rgba(255,183,3,0.25)', color: '#fff' }}
                                dir="rtl">
                                <div className="flex justify-between items-center mb-3">
                                    <h3 className="font-bold text-lg" style={{ color: '#FFB703' }}>مزار بابت</h3>
                                    <button onClick={() => setShowInfo(false)} className="opacity-50 hover:opacity-100">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {INFO_POINTS.map(p => (
                                        <div key={p.label} className="border-b pb-2" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                                            <div className="text-xs opacity-50">{p.label}</div>
                                            <div className="font-bold">{p.value}</div>
                                        </div>
                                    ))}
                                </div>
                                <p className="mt-3 text-xs opacity-40 leading-relaxed">
                                    هي مزار سنڌ جي عظيم صوفي شاعر شاهه عبداللطيف ڀٽائي جو آرامگاهه آهي.
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Footer */}
                <div className="flex justify-between items-center px-5 py-3 shrink-0 border-t"
                    style={{ background: '#0a0a0a', borderColor: 'rgba(255,183,3,0.15)' }}>
                    <p className="text-sm opacity-30">ماڊل کي ڇڪيو ۽ ويجهو ڪريو</p>
                    <button onClick={onComplete}
                        className="px-6 py-2.5 rounded-full font-bold text-lg transition-transform hover:scale-105"
                        style={{ background: '#FFB703', color: '#000' }}>
                        اڳيون
                    </button>
                </div>
            </div>
        </div>
    );
}

useGLTF.preload('/ShahAbdulLatifShrine.glb');
