'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// ── Bright, child-friendly palette ──────────────────────────────────────────
const TEAL = '#0891B2';
const PAPER = '#FFFDF7';
const PAPER_SHADOW = '#F5F0E8';

function DustMote({ x, y, delay }: { x: number; y: number; delay: number }) {
    return (
        <motion.div className="absolute rounded-full pointer-events-none"
            style={{
                width: Math.random() * 4 + 2, height: Math.random() * 4 + 2,
                left: `${x}%`, top: `${y}%`,
                background: `rgba(8,145,178,${Math.random() * 0.5 + 0.2})`,
                zIndex: 80, filter: 'blur(0.5px)',
            }}
            initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
            animate={{ opacity: [0, 1, 0], scale: [0, 2, 0], x: (Math.random() - 0.5) * 120, y: (Math.random() - 0.5) * 120 }}
            transition={{ duration: 1.0, delay, ease: 'easeOut' }}
        />
    );
}

interface BookLayoutProps {
    leftPage: React.ReactNode;
    rightPage: React.ReactNode;
    onNext?: () => void;
    onPrev?: () => void;
    canNext?: boolean;
    canPrev?: boolean;
    pageLabel?: string;
    accentColor?: string;
    title?: string;
}

export default function BookLayout({
    leftPage, rightPage, onNext, onPrev,
    canNext = true, canPrev = true,
    pageLabel, accentColor = TEAL, title = 'سنڌي سبق',
}: BookLayoutProps) {
    const [flipping, setFlipping] = useState(false);
    const [dust, setDust] = useState<{ x: number; y: number; delay: number }[]>([]);
    const [displayLeft, setDisplayLeft] = useState(leftPage);
    const [displayRight, setDisplayRight] = useState(rightPage);
    const pendingRef = useRef<{ left: React.ReactNode; right: React.ReactNode } | null>(null);
    const flippingRef = useRef(false);

    useEffect(() => {
        if (flippingRef.current) { pendingRef.current = { left: leftPage, right: rightPage }; return; }
        setDisplayLeft(leftPage);
        setDisplayRight(rightPage);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [leftPage, rightPage]);

    const spawnDust = useCallback(() => {
        const motes = Array.from({ length: 16 }, () => ({
            x: 44 + Math.random() * 12, y: 10 + Math.random() * 80, delay: Math.random() * 0.2,
        }));
        setDust(motes);
        setTimeout(() => setDust([]), 1200);
    }, []);

    const triggerFlip = useCallback((dir: 'next' | 'prev', callback?: () => void) => {
        if (flippingRef.current) return;
        flippingRef.current = true;
        setFlipping(true);
        spawnDust();
        setTimeout(() => {
            if (callback) callback();
            if (pendingRef.current) {
                setDisplayLeft(pendingRef.current.left);
                setDisplayRight(pendingRef.current.right);
                pendingRef.current = null;
            }
        }, 380);
        setTimeout(() => { setFlipping(false); flippingRef.current = false; }, 750);
    }, [spawnDust]);

    const handleNext = () => { if (!canNext || flippingRef.current) return; triggerFlip('next', onNext); };
    const handlePrev = () => { if (!canPrev || flippingRef.current) return; triggerFlip('prev', onPrev); };

    const pageStyle = {
        background: PAPER,
        boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
    };

    return (
        <div className="relative w-full flex-1 flex flex-col items-center justify-center select-none min-h-0"
            style={{ background: 'linear-gradient(160deg, #e0f2fe 0%, #bae6fd 40%, #e0f7fa 100%)' }}>

            {dust.map((d, i) => <DustMote key={i} x={d.x} y={d.y} delay={d.delay} />)}

            <div className="relative flex items-center justify-center w-full flex-1 px-4 py-2">
                <div className="relative flex flex-col md:flex-row overflow-y-auto md:overflow-visible snap-y snap-mandatory custom-scrollbar"
                    style={{ 
                        width: 'min(96vw, 1200px)', 
                        height: '100%', 
                        maxHeight: '780px', 
                        filter: 'drop-shadow(0 20px 48px rgba(0,0,0,0.18))',
                        borderRadius: '16px'
                    }}>

                    {/* Left page */}
                    <div className="relative w-full h-full flex-shrink-0 md:flex-1 flex flex-col overflow-hidden snap-start"
                        style={{ ...pageStyle, borderRight: '1px solid #e2d9c8', borderTopLeftRadius: '16px', borderBottomLeftRadius: '16px' }}>
                        <div className="absolute top-0 bottom-0 left-10 w-px opacity-30" style={{ background: accentColor }} />
                        <div className="absolute bottom-4 left-6 text-xs font-bold opacity-25"
                            style={{ color: accentColor, fontFamily: 'Georgia, serif' }}>
                            {pageLabel ? `← ${pageLabel}` : ''}
                        </div>
                        <div className="relative z-10 flex-1 overflow-y-auto custom-scrollbar">
                            <AnimatePresence mode="wait">
                                <motion.div key={`left-${String(displayLeft)?.slice(0, 20)}`}
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                    transition={{ duration: 0.2 }} className="h-full">
                                    {displayLeft}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                        {/* Mobile indicator that you can scroll down */}
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 md:hidden animate-bounce text-xs font-bold opacity-40 bg-white/80 px-3 py-1 rounded-full shadow-sm" style={{ color: accentColor }}>
                            ↓ وڌيڪ ↓
                        </div>
                    </div>

                    {/* Spine */}
                    <div className="relative z-20 hidden md:flex flex-col items-center justify-center shrink-0"
                        style={{ width: 24, background: `linear-gradient(to right, #cbd5e1, #e2e8f0, #cbd5e1)`, boxShadow: '0 0 12px rgba(0,0,0,0.12)' }}>
                        <div className="relative z-10 text-xs font-black tracking-widest opacity-40"
                            style={{ color: accentColor, writingMode: 'vertical-rl', textOrientation: 'mixed', transform: 'rotate(180deg)', fontSize: 8 }}>
                            {title}
                        </div>
                    </div>

                    {/* Right page */}
                    <div className="relative w-full h-full flex-shrink-0 md:flex-1 flex flex-col overflow-hidden snap-start"
                        style={{ ...pageStyle, borderLeft: '1px solid #e2d9c8', borderTopRightRadius: '16px', borderBottomRightRadius: '16px' }}>
                        <div className="absolute top-0 bottom-0 right-10 w-px opacity-30" style={{ background: accentColor }} />
                        <div className="absolute bottom-4 right-6 text-xs font-bold opacity-25"
                            style={{ color: accentColor, fontFamily: 'Georgia, serif' }}>
                            {pageLabel ? `${pageLabel} →` : ''}
                        </div>
                        <div className="relative z-10 flex-1 overflow-y-auto custom-scrollbar">
                            <AnimatePresence mode="wait">
                                <motion.div key={`right-${String(displayRight)?.slice(0, 20)}`}
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                    transition={{ duration: 0.2 }} className="h-full">
                                    {displayRight}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* 3D flip overlay removed — CSS fade is sufficient */}

                    {/* Edge nav buttons — always visible */}
                    {canPrev && (
                        <button onClick={handlePrev}
                            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 z-30 transition-transform hover:scale-110 active:scale-95"
                            style={{ cursor: 'pointer' }}>
                            <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-xl"
                                style={{ background: accentColor, border: '3px solid #fff' }}>
                                <ChevronRight className="w-6 h-6 text-white" />
                            </div>
                        </button>
                    )}
                    {canNext && (
                        <button onClick={handleNext}
                            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-30 transition-transform hover:scale-110 active:scale-95"
                            style={{ cursor: 'pointer' }}>
                            <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-xl"
                                style={{ background: accentColor, border: '3px solid #fff' }}>
                                <ChevronLeft className="w-6 h-6 text-white" />
                            </div>
                        </button>
                    )}
                </div>
            </div>

            {/* Nav bar */}
            <div className="relative z-10 flex items-center gap-5 pb-4">
                <button onClick={handlePrev} disabled={!canPrev || flipping}
                    className="flex items-center gap-2 px-5 py-3 rounded-full font-bold text-base transition-all disabled:opacity-40 shadow-lg hover:scale-105 active:scale-95"
                    style={{ background: canPrev ? accentColor : '#94a3b8', color: '#fff' }}>
                    <ChevronRight className="w-5 h-5" />
                    پوئتي
                </button>
                {pageLabel && (
                    <span className="text-base font-black px-5 py-2 rounded-full shadow-md"
                        style={{ color: accentColor, background: '#fff', border: `2px solid ${accentColor}` }}>
                        {pageLabel}
                    </span>
                )}
                <button onClick={handleNext} disabled={!canNext || flipping}
                    className="flex items-center gap-2 px-5 py-3 rounded-full font-bold text-base transition-all disabled:opacity-40 shadow-lg hover:scale-105 active:scale-95"
                    style={{ background: canNext ? accentColor : '#94a3b8', color: '#fff' }}>
                    اڳيون
                    <ChevronLeft className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}
