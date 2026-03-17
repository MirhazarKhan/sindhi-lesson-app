'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';

// ─────────────────────────────────────────────────────────────────────────────
// PageTurnTransition
//
// Wraps children in a 3-D book-page-turn effect.
// When `pageKey` changes the old page folds away (rotateY 0→-180) while the
// new page unfolds in (rotateY 180→0), both sharing the same perspective
// container so they look like two sides of the same leaf.
//
// Visual extras:
//   • Paper-grain overlay on each page
//   • Spine shadow that sweeps across during the turn
//   • Gold-edge shimmer on the folding corner
//   • Dust-particle burst at the moment of the turn
// ─────────────────────────────────────────────────────────────────────────────

interface Props {
    pageKey: string;
    children: React.ReactNode;
    /** 'forward' = turn right-to-left (next page), 'back' = left-to-right */
    direction?: 'forward' | 'back';
}

// Tiny floating dust mote
function DustMote({ x, y, delay }: { x: number; y: number; delay: number }) {
    return (
        <motion.div
            className="absolute rounded-full pointer-events-none"
            style={{
                width: Math.random() * 4 + 2,
                height: Math.random() * 4 + 2,
                left: `${x}%`,
                top: `${y}%`,
                background: `rgba(255,183,3,${Math.random() * 0.6 + 0.2})`,
                zIndex: 60,
            }}
            initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
            animate={{
                opacity: [0, 1, 0],
                scale: [0, 1.5, 0],
                x: (Math.random() - 0.5) * 120,
                y: (Math.random() - 0.5) * 120,
            }}
            transition={{ duration: 0.9, delay, ease: 'easeOut' }}
        />
    );
}

// Paper texture overlay (SVG noise)
const PaperGrain = () => (
    <div
        className="absolute inset-0 pointer-events-none rounded-inherit opacity-[0.04] mix-blend-overlay"
        style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundSize: '200px 200px',
        }}
    />
);

// The sweeping spine shadow
function SpineShadow({ turning }: { turning: boolean }) {
    return (
        <AnimatePresence>
            {turning && (
                <motion.div
                    className="absolute inset-0 pointer-events-none z-50"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.05 }}
                >
                    {/* Left half darkens as page lifts */}
                    <motion.div
                        className="absolute inset-y-0 left-0 w-1/2"
                        style={{
                            background: 'linear-gradient(to right, rgba(0,0,0,0.55) 0%, transparent 100%)',
                        }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 0.8, 0] }}
                        transition={{ duration: 0.65, ease: 'easeInOut' }}
                    />
                    {/* Spine crease line */}
                    <motion.div
                        className="absolute inset-y-0"
                        style={{ width: 3, background: 'rgba(255,183,3,0.6)', filter: 'blur(2px)' }}
                        initial={{ left: '100%', opacity: 0 }}
                        animate={{ left: ['100%', '50%', '0%'], opacity: [0, 1, 0] }}
                        transition={{ duration: 0.65, ease: 'easeInOut' }}
                    />
                    {/* Gold edge shimmer on the turning corner */}
                    <motion.div
                        className="absolute top-0 bottom-0 w-8"
                        style={{
                            background: 'linear-gradient(to left, rgba(255,183,3,0.5) 0%, transparent 100%)',
                            filter: 'blur(4px)',
                        }}
                        initial={{ right: 0, opacity: 0 }}
                        animate={{ right: ['0%', '50%'], opacity: [0.8, 0] }}
                        transition={{ duration: 0.65, ease: 'easeIn' }}
                    />
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export default function PageTurnTransition({ pageKey, children, direction = 'forward' }: Props) {
    const [displayKey, setDisplayKey] = useState(pageKey);
    const [displayChildren, setDisplayChildren] = useState(children);
    const [phase, setPhase] = useState<'idle' | 'exit' | 'enter'>('idle');
    const [turning, setTurning] = useState(false);
    const [dust, setDust] = useState<{ x: number; y: number; delay: number }[]>([]);
    const pendingRef = useRef<{ key: string; children: React.ReactNode } | null>(null);
    const phaseRef = useRef(phase);
    phaseRef.current = phase;

    const sign = direction === 'forward' ? 1 : -1;

    const spawnDust = useCallback(() => {
        const motes = Array.from({ length: 14 }, () => ({
            x: 45 + Math.random() * 10,
            y: 20 + Math.random() * 60,
            delay: Math.random() * 0.15,
        }));
        setDust(motes);
        setTimeout(() => setDust([]), 1100);
    }, []);

    useEffect(() => {
        if (pageKey === displayKey) return;

        // Queue the incoming page
        pendingRef.current = { key: pageKey, children };

        if (phaseRef.current !== 'idle') return; // already animating, will pick up in onExitComplete

        // Kick off exit
        setPhase('exit');
        setTurning(true);
        spawnDust();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pageKey]);

    // When children update while same key (e.g. sectionKey bump) also re-render
    useEffect(() => {
        if (pageKey === displayKey) {
            setDisplayChildren(children);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [children]);

    const onExitComplete = useCallback(() => {
        const pending = pendingRef.current;
        if (pending) {
            setDisplayKey(pending.key);
            setDisplayChildren(pending.children);
            pendingRef.current = null;
        }
        setPhase('enter');
    }, []);

    const onEnterComplete = useCallback(() => {
        setPhase('idle');
        setTurning(false);
        // If another change queued while we were entering
        if (pendingRef.current) {
            setPhase('exit');
            setTurning(true);
            spawnDust();
        }
    }, [spawnDust]);

    // ── Animation variants ──────────────────────────────────────────────────────
    // Exit: current page folds away (rotates to -180 on Y, shrinks slightly)
    const exitVariants = {
        animate: { rotateY: 0, opacity: 1, scale: 1 },
        exit: {
            rotateY: sign * -90,
            opacity: 0,
            scale: 0.96,
            transition: { duration: 0.45, ease: [0.4, 0, 0.2, 1] as any },
        },
    };

    // Enter: new page unfolds in from the opposite side
    const enterVariants = {
        initial: { rotateY: sign * 90, opacity: 0, scale: 0.96 },
        animate: {
            rotateY: 0,
            opacity: 1,
            scale: 1,
            transition: { duration: 0.45, ease: [0.4, 0, 0.2, 1] as any },
        },
    };

    return (
        <div
            className="relative w-full flex-1 flex flex-col"
            style={{ perspective: '1400px', perspectiveOrigin: '50% 40%' }}
        >
            {/* Dust particles */}
            {dust.map((d, i) => (
                <DustMote key={i} x={d.x} y={d.y} delay={d.delay} />
            ))}

            {/* Spine shadow overlay */}
            <SpineShadow turning={turning} />

            {/* Exit phase */}
            <AnimatePresence onExitComplete={onExitComplete}>
                {phase === 'exit' && (
                    <motion.div
                        key={`exit-${displayKey}`}
                        className="absolute inset-0 flex flex-col"
                        style={{ transformStyle: 'preserve-3d', transformOrigin: sign > 0 ? 'left center' : 'right center' }}
                        variants={exitVariants}
                        animate="animate"
                        exit="exit"
                    >
                        <PaperGrain />
                        {displayChildren}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Enter phase */}
            <AnimatePresence onExitComplete={onEnterComplete}>
                {(phase === 'enter' || phase === 'idle') && (
                    <motion.div
                        key={`enter-${displayKey}`}
                        className="w-full flex-1 flex flex-col"
                        style={{ transformStyle: 'preserve-3d', transformOrigin: sign > 0 ? 'right center' : 'left center' }}
                        variants={phase === 'enter' ? enterVariants : undefined}
                        initial={phase === 'enter' ? 'initial' : false}
                        animate="animate"
                        onAnimationComplete={phase === 'enter' ? onEnterComplete : undefined}
                    >
                        <PaperGrain />
                        {displayChildren}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
