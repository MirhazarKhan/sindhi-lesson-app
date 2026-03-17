'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import IntroSlides from './IntroSlides';
import VocabularyGame from './VocabularyGame';
import WordBreaker from './WordBreaker';
import QuizSection from './QuizSection';
import dynamic from 'next/dynamic';
const ShrineViewer = dynamic(() => import('./ShrineViewer'), { ssr: false });
import PageTurnTransition from './PageTurnTransition';
import lessonData from '../data/lesson.json';
import {
    BookOpen, Puzzle, CheckSquare, Type, Volume2,
    MousePointer2, RotateCcw, Home, Square, Building2,
    ChevronLeft, ChevronRight, Sparkles,
} from 'lucide-react';
import { playSindhiAudio, stopAudio, prefetchLessonAudio } from '../utils/audioPlayer';

type Section = 'menu' | 'intro' | 'vocab' | 'breaker' | 'quiz' | 'shrine';
type AppState = 'init' | 'splash' | 'main';

const MENU = [
    { id: 'intro', title: 'تعارف', desc: 'شاهه صاحب جي زندگي بابت پڙهو', icon: BookOpen, bg: 'from-[#0D7377] to-[#14213D]', badge: '📖' },
    { id: 'vocab', title: 'لفظن جي راند', desc: 'جوڙ ۽ ٽوڙ ذريعي لفظ سکو', icon: Puzzle, bg: 'from-[#C1121F] to-[#6A0572]', badge: '🧩' },
    { id: 'breaker', title: 'لفظ ٺاهيو', desc: 'اکرن کي ڇڪي لفظ ٺاهيو', icon: Type, bg: 'from-[#1B4332] to-[#0D7377]', badge: '✍️' },
    { id: 'quiz', title: 'مشق', desc: 'پنهنجي ڄاڻ کي پرکو', icon: CheckSquare, bg: 'from-[#7B2D8B] to-[#C1121F]', badge: '🏆' },
    { id: 'shrine', title: 'مزار', desc: 'ڀٽ شاهه مزار جو 3D تجربو', icon: Building2, bg: 'from-[#B5451B] to-[#0D7377]', badge: '🕌' },
];

// ── Decorative helpers ────────────────────────────────────────────────────────
const AjrakBorder = () => (
    <svg className="w-full h-3 opacity-60" viewBox="0 0 400 12" preserveAspectRatio="none">
        <defs>
            <pattern id="ajrak" x="0" y="0" width="20" height="12" patternUnits="userSpaceOnUse">
                <polygon points="10,1 19,11 1,11" fill="none" stroke="#FFB703" strokeWidth="1" />
                <circle cx="10" cy="6" r="1.5" fill="#C1121F" />
            </pattern>
        </defs>
        <rect width="400" height="12" fill="url(#ajrak)" />
    </svg>
);

const ORB_CONFIG = [
    { size: 320, top: '-10%', left: '-8%', color: 'rgba(13,115,119,0.35)', dy: 0, dur: 7 },
    { size: 240, top: '60%', left: '75%', color: 'rgba(193,18,31,0.25)', dy: 1.5, dur: 9 },
    { size: 180, top: '30%', left: '55%', color: 'rgba(255,183,3,0.2)', dy: 0.8, dur: 6 },
    { size: 140, top: '75%', left: '15%', color: 'rgba(224,64,251,0.2)', dy: 2, dur: 8 },
    { size: 100, top: '15%', left: '85%', color: 'rgba(45,198,83,0.2)', dy: 0.3, dur: 5 },
];

const FloatingOrbs = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {ORB_CONFIG.map((o, i) => (
            <motion.div
                key={i}
                className="absolute rounded-full blur-3xl"
                style={{ width: o.size, height: o.size, top: o.top, left: o.left, background: o.color }}
                animate={{ y: [0, -20, 0], scale: [1, 1.1, 1] }}
                transition={{ duration: o.dur, delay: o.dy, repeat: Infinity, ease: 'easeInOut' }}
            />
        ))}
    </div>
);

// ── Sidebar button ────────────────────────────────────────────────────────────
function SidebarBtn({ active, onClick, icon, label, danger }: {
    active: boolean; onClick: () => void; icon: React.ReactNode; label: string; danger?: boolean;
}) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl font-bold text-lg transition-all whitespace-nowrap border
        ${active
                    ? 'bg-[#FFB703] text-[#14213D] border-[#FFB703]'
                    : danger
                        ? 'bg-white/5 text-red-400 border-red-400/30 hover:bg-red-500/20 hover:border-red-400'
                        : 'bg-white/5 text-white border-white/10 hover:bg-[#FFB703]/20 hover:text-[#FFB703] hover:border-[#FFB703]/50'
                }`}
        >
            {icon}<span>{label}</span>
        </button>
    );
}

// ── Hero Menu ─────────────────────────────────────────────────────────────────
function HeroMenu({ currentIndex, onSelect, onNext, onPrev }: {
    currentIndex: number; onSelect: (id: string) => void; onNext: () => void; onPrev: () => void;
}) {
    const item = MENU[currentIndex];
    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="relative min-h-screen w-full overflow-hidden flex flex-col"
            style={{ background: 'linear-gradient(135deg,#0a0a12 0%,#0D1B2A 60%,#14213D 100%)' }}
        >
            <FloatingOrbs />
            <div className="ajrak-pattern absolute inset-0 opacity-40" />

            {/* Photo backdrop */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a0a12]/60 to-[#0a0a12] z-10" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a12]/80 via-transparent to-[#0a0a12]/80 z-10" />
                <Image src="/shah_abdul_latif.jpg" alt="Shah Abdul Latif Bhittai" fill className="object-cover object-center opacity-20" priority />
            </div>

            {/* Top bar */}
            <div className="relative z-20 flex items-center justify-between px-6 md:px-12 pt-6 pb-3">
                <div className="flex items-center gap-3">
                    <span className="text-3xl">🕌</span>
                    <div dir="rtl">
                        <div className="text-[#FFB703] font-black text-xl md:text-2xl leading-none">سنڌي سبق</div>
                        <div className="text-white/40 text-sm">شاهه عبداللطيف ڀٽائي</div>
                    </div>
                </div>
                <div className="flex gap-2" dir="ltr">
                    {MENU.map((_, i) => (
                        <motion.div key={i} animate={{ width: i === currentIndex ? 32 : 8, opacity: i === currentIndex ? 1 : 0.3 }}
                            className="h-2 rounded-full bg-[#FFB703]" />
                    ))}
                </div>
            </div>

            <AjrakBorder />

            {/* Hero body */}
            <div className="relative z-20 flex-1 flex flex-col md:flex-row items-center justify-center gap-8 px-6 md:px-16 py-8" dir="rtl">
                {/* Title side */}
                <div className="flex-1 flex flex-col justify-center max-w-xl">
                    <AnimatePresence mode="wait">
                        <motion.div key={`hero-${currentIndex}`}
                            initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
                            transition={{ duration: 0.35 }}
                        >
                            <div className="text-6xl mb-3">{item.badge}</div>
                            <h1 className="text-[15vw] md:text-[7vw] font-black leading-none text-white drop-shadow-2xl mb-4">{item.title}</h1>
                            <p className="text-2xl md:text-3xl text-white/60 font-bold leading-relaxed mb-8">{item.desc}</p>
                            <motion.button
                                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                onClick={() => onSelect(item.id)}
                                className="inline-flex items-center gap-3 px-10 py-5 rounded-2xl font-black text-2xl md:text-3xl text-[#14213D] shadow-[0_8px_30px_rgba(255,183,3,0.4)]"
                                style={{ background: 'linear-gradient(135deg,#FFB703 0%,#F4A261 100%)' }}
                            >
                                <Sparkles className="w-7 h-7" />
                                شروع ڪريو
                            </motion.button>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Card side */}
                <div className="flex-1 flex items-center justify-center relative min-h-[340px] w-full max-w-md">
                    {[-1, 1].map(offset => {
                        const idx = (currentIndex + offset + MENU.length) % MENU.length;
                        return (
                            <div key={offset}
                                className={`absolute w-56 h-64 rounded-3xl bg-gradient-to-br ${MENU[idx].bg} opacity-25 blur-sm`}
                                style={{ transform: `translateX(${offset * 70}px) scale(0.85)` }}
                            />
                        );
                    })}
                    <AnimatePresence mode="wait">
                        <motion.button
                            key={`card-${currentIndex}`}
                            initial={{ opacity: 0, scale: 0.85, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.85, y: -20 }}
                            transition={{ duration: 0.3, type: 'spring', bounce: 0.3 }}
                            whileHover={{ scale: 1.04, y: -6 }} whileTap={{ scale: 0.97 }}
                            onClick={() => onSelect(item.id)}
                            className={`relative w-64 h-72 md:w-72 md:h-80 rounded-3xl bg-gradient-to-br ${item.bg} flex flex-col items-center justify-center gap-5 shadow-[0_20px_60px_rgba(0,0,0,0.5)] border border-white/10 overflow-hidden`}
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
                            <div className="absolute top-0 right-0 w-20 h-20 opacity-20" style={{ background: 'radial-gradient(circle at top right,#FFB703,transparent)' }} />
                            <div className="absolute bottom-0 left-0 w-20 h-20 opacity-20" style={{ background: 'radial-gradient(circle at bottom left,#C1121F,transparent)' }} />
                            <span className="text-6xl relative z-10">{item.badge}</span>
                            <span className="text-4xl md:text-5xl font-black text-white relative z-10 drop-shadow-lg">{item.title}</span>
                            <span className="text-sm text-white/60 relative z-10 px-4 text-center">{item.desc}</span>
                        </motion.button>
                    </AnimatePresence>
                </div>
            </div>

            {/* Bottom pills + nav */}
            <div className="relative z-20 pb-8 px-6 flex flex-col items-center gap-5">
                <AjrakBorder />
                <div className="flex flex-wrap justify-center gap-3 mt-3" dir="rtl">
                    {MENU.map((m, i) => (
                        <motion.button key={m.id} whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}
                            onClick={() => onSelect(m.id)}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-lg border transition-all
                ${i === currentIndex
                                    ? 'border-[#FFB703] text-[#14213D] shadow-[0_0_20px_rgba(255,183,3,0.4)]'
                                    : 'border-white/20 text-white/70 hover:border-[#FFB703]/60 hover:text-white bg-white/5'}`}
                            style={i === currentIndex ? { background: 'linear-gradient(135deg,#FFB703,#F4A261)' } : {}}
                        >
                            <span>{m.badge}</span><span>{m.title}</span>
                        </motion.button>
                    ))}
                </div>
                <div className="flex gap-4" dir="ltr">
                    {[{ fn: onNext, icon: <ChevronLeft className="w-6 h-6" /> }, { fn: onPrev, icon: <ChevronRight className="w-6 h-6" /> }].map((b, i) => (
                        <motion.button key={i} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={b.fn}
                            className="p-4 rounded-full border border-white/20 text-white hover:border-[#FFB703] hover:text-[#FFB703] transition-colors bg-white/5 backdrop-blur-sm">
                            {b.icon}
                        </motion.button>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function LessonModule() {
    const [currentSection, setCurrentSection] = useState<Section>('menu');
    const [appState, setAppState] = useState<AppState>('init');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [sectionKey, setSectionKey] = useState(0);
    const [isHoverSpeakEnabled, setIsHoverSpeakEnabled] = useState(false);
    const [isReadingAll, setIsReadingAll] = useState(false);
    const [turnDirection, setTurnDirection] = useState<'forward' | 'back'>('forward');
    const [ttsNoBalance, setTtsNoBalance] = useState(false);
    const prevSectionRef = useRef<Section>('menu');

    useEffect(() => { prefetchLessonAudio(lessonData); }, []);

    // Listen for UpliftAI balance-exhausted event from audioPlayer
    useEffect(() => {
        const handler = () => setTtsNoBalance(true);
        window.addEventListener('tts:no-balance', handler);
        return () => window.removeEventListener('tts:no-balance', handler);
    }, []);

    const handleSectionChange = (section: Section) => {
        // going back to menu = backward turn; going into a section = forward
        const dir = section === 'menu' ? 'back' : 'forward';
        setTurnDirection(dir);
        prevSectionRef.current = currentSection;
        setCurrentSection(section);
        setSectionKey(p => p + 1);
        stopReadingAll();
    };
    const handleRestart = () => { setSectionKey(p => p + 1); stopReadingAll(); };

    useEffect(() => {
        if (appState !== 'splash') return;
        playSindhiAudio('ڪانه پُڇي ٿو ذاتِ، جيڪي آيا سي اَگهيا');
        const t = setTimeout(() => setAppState('main'), 5000);
        return () => clearTimeout(t);
    }, [appState]);

    useEffect(() => {
        if (!isHoverSpeakEnabled) { stopAudio(); return; }
        let last = ''; let tid: NodeJS.Timeout;
        const h = (e: MouseEvent) => {
            const node = (e.target as HTMLElement).closest('p,h1,h2,h3,span,button');
            if (!node) return;
            const text = node.textContent?.trim();
            if (text && text.length < 200 && text !== last) {
                clearTimeout(tid); tid = setTimeout(() => { last = text; playSindhiAudio(text); }, 300);
            }
        };
        document.addEventListener('mouseover', h);
        return () => { document.removeEventListener('mouseover', h); clearTimeout(tid); stopAudio(); };
    }, [isHoverSpeakEnabled]);

    const stopReadingAll = () => { stopAudio(); setIsReadingAll(false); };
    const handleReadAll = async () => {
        if (isReadingAll) { stopReadingAll(); return; }
        let text = '';
        if (currentSection === 'intro') text = lessonData.introSlides.map(s => s.text).join('۔ ');
        else if (currentSection === 'vocab' || currentSection === 'breaker') text = lessonData.vocabularyGame.map(v => v.word).join('۔ ');
        else if (currentSection === 'quiz') text = [...lessonData.quiz.trueFalse.map(q => q.question), ...lessonData.quiz.fillInTheBlanks.map(q => q.question)].join('۔ ');
        if (!text) return;
        setIsReadingAll(true); await playSindhiAudio(text); setIsReadingAll(false);
    };

    const renderSection = () => {
        switch (currentSection) {
            case 'intro': return <IntroSlides key={sectionKey} data={lessonData.introSlides} onComplete={() => handleSectionChange('menu')} />;
            case 'vocab': return <VocabularyGame key={sectionKey} data={lessonData.vocabularyGame} onComplete={() => handleSectionChange('menu')} />;
            case 'breaker': return <WordBreaker key={sectionKey} data={lessonData.vocabularyGame} onComplete={() => handleSectionChange('menu')} />;
            case 'quiz': return <QuizSection key={sectionKey} data={lessonData.quiz} onComplete={() => handleSectionChange('menu')} />;
            case 'shrine': return <ShrineViewer key={sectionKey} onComplete={() => handleSectionChange('menu')} />;
            default: return <HeroMenu currentIndex={currentIndex} onSelect={id => handleSectionChange(id as Section)}
                onNext={() => setCurrentIndex(p => (p + 1) % MENU.length)}
                onPrev={() => setCurrentIndex(p => (p - 1 + MENU.length) % MENU.length)} />;
        }
    };

    return (
        <div className="min-h-screen font-lateef" style={{ background: '#0a0a12' }}>

            {/* TTS no-balance banner */}
            {ttsNoBalance && (
                <div className="fixed top-0 inset-x-0 z-[300] flex items-center justify-between gap-3 px-5 py-3 text-sm font-bold"
                    style={{ background: 'linear-gradient(90deg,#C1121F,#9d0208)', color: '#fff', direction: 'rtl' }}>
                    <span>🔇 سنڌي آواز بند آهي — UpliftAI اڪائونٽ ۾ بيلنس ختم ٿي ويو آهي</span>
                    <a href="https://upliftai.org" target="_blank" rel="noopener noreferrer"
                        className="underline whitespace-nowrap opacity-90 hover:opacity-100">
                        upliftai.org تي ٽاپ اپ ڪريو
                    </a>
                    <button onClick={() => setTtsNoBalance(false)} className="ml-2 opacity-70 hover:opacity-100 text-lg leading-none">✕</button>
                </div>
            )}

            {/* Init */}
            <AnimatePresence>
                {appState === 'init' && (
                    <motion.div key="init"
                        className="fixed inset-0 z-[200] flex items-center justify-center overflow-hidden"
                        style={{ background: 'linear-gradient(135deg,#0D7377 0%,#14213D 50%,#C1121F 100%)' }}
                        exit={{ opacity: 0, scale: 1.05 }} transition={{ duration: 0.6 }}
                    >
                        <FloatingOrbs />
                        <div className="ajrak-pattern absolute inset-0 opacity-30" />
                        <div className="relative z-10 flex flex-col items-center gap-8 px-8 text-center" dir="rtl">
                            <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
                                className="text-7xl float">🕌</motion.div>
                            <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
                                className="text-5xl md:text-7xl lg:text-8xl font-black leading-tight text-white drop-shadow-2xl">
                                شاهه عبداللطيف<br /><span className="gold-shimmer">ڀٽائي</span>
                            </motion.h1>
                            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                                className="text-2xl md:text-3xl text-white/70">سنڌ جو عظيم صوفي شاعر</motion.p>
                            <AjrakBorder />
                            <motion.button
                                initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.7, type: 'spring', bounce: 0.4 }}
                                whileHover={{ scale: 1.07 }} whileTap={{ scale: 0.95 }}
                                onClick={() => setAppState('splash')}
                                className="mt-4 px-14 py-5 rounded-full font-black text-3xl md:text-4xl text-[#14213D] shadow-[0_0_40px_rgba(255,183,3,0.5)]"
                                style={{ background: 'linear-gradient(135deg,#FFB703,#F4A261)' }}
                            >
                                <span className="flex items-center gap-3"><Sparkles className="w-8 h-8" />شروع ڪريو</span>
                            </motion.button>
                        </div>
                    </motion.div>
                )}

                {/* Splash */}
                {appState === 'splash' && (
                    <motion.div key="splash"
                        className="fixed inset-0 z-[100] pointer-events-none flex items-center justify-center overflow-hidden"
                        style={{ background: 'linear-gradient(135deg,#14213D 0%,#0D7377 60%,#C1121F 100%)' }}
                        exit={{ opacity: 0 }} transition={{ duration: 1 }}
                    >
                        <FloatingOrbs />
                        <div className="ajrak-pattern absolute inset-0 opacity-20" />
                        <div className="relative z-10 flex flex-col items-center gap-6 px-8 text-center" dir="rtl">
                            <motion.div initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 1 }}
                                className="text-5xl md:text-7xl lg:text-[6.5rem] font-black leading-snug text-white drop-shadow-2xl">
                                ڪانه پُڇي ٿو ذاتِ،
                            </motion.div>
                            <motion.div initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 1, delay: 1 }}
                                className="text-5xl md:text-7xl lg:text-[6.5rem] font-black leading-snug gold-shimmer drop-shadow-2xl">
                                جيڪي آيا سي اَگهيا۔
                            </motion.div>
                            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.2 }}
                                className="text-xl md:text-2xl text-white/50 mt-4">— شاهه عبداللطيف ڀٽائي</motion.p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Sections */}
            {currentSection === 'menu' ? (
                <div className="min-h-screen selection:bg-[#FFB703] selection:text-[#14213D]">
                    <PageTurnTransition pageKey={currentSection + sectionKey} direction={turnDirection}>
                        {renderSection()}
                    </PageTurnTransition>
                </div>
            ) : (
                <div className="min-h-screen flex flex-col md:flex-row selection:bg-[#FFB703] selection:text-[#14213D]" dir="rtl"
                    style={{ background: 'linear-gradient(160deg,#0a0a12 0%,#0D1B2A 100%)' }}>

                    {/* Sidebar */}
                    <aside className="w-full md:w-60 flex flex-row md:flex-col p-3 md:p-5 gap-3 z-50 overflow-x-auto md:overflow-visible shrink-0 border-b md:border-b-0 md:border-l"
                        style={{ background: 'linear-gradient(180deg,#0D7377 0%,#14213D 100%)', borderColor: 'rgba(255,183,3,0.3)' }}>
                        <div className="hidden md:flex flex-col items-center gap-2 mb-5">
                            <span className="text-3xl">🕌</span>
                            <h2 className="text-xl font-black text-[#FFB703] text-center">سنڌي سبق</h2>
                            <AjrakBorder />
                        </div>
                        <SidebarBtn active={isReadingAll} onClick={handleReadAll}
                            icon={isReadingAll ? <Square className="w-5 h-5 fill-current" /> : <Volume2 className="w-5 h-5" />}
                            label={isReadingAll ? 'بند ڪريو' : 'سڀ پڙهو'} />
                        <SidebarBtn active={isHoverSpeakEnabled} onClick={() => setIsHoverSpeakEnabled(v => !v)}
                            icon={<MousePointer2 className="w-5 h-5" />} label="لفظ تي آواز" />
                        <div className="hidden md:block flex-1" />
                        <SidebarBtn active={false} onClick={handleRestart}
                            icon={<RotateCcw className="w-5 h-5" />} label="ٻيهر شروع" />
                        <SidebarBtn active={false} onClick={() => handleSectionChange('menu')}
                            icon={<Home className="w-5 h-5" />} label="واپس مينيو" danger />
                    </aside>

                    {/* Content */}
                    <main className="flex-1 flex flex-col h-screen overflow-y-auto custom-scrollbar">
                        <div className="container mx-auto py-6 px-4 flex-1 flex flex-col">
                            <PageTurnTransition pageKey={currentSection + sectionKey} direction={turnDirection}>
                                {renderSection()}
                            </PageTurnTransition>
                        </div>
                    </main>
                </div>
            )}
        </div>
    );
}
