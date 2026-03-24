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

const BG = '#0E0B16';
const BG_LIGHT = '#1A1528';
const GOLD = '#D4A017';
const GOLD_BRIGHT = '#F5C842';
const CRIMSON = '#C1121F';
const IVORY = '#F0E6D3';

const MENU = [
    { id: 'intro', title: 'تعارف', desc: 'شاهه صاحب جي زندگي بابت پڙهو', icon: BookOpen, badge: '📖', accent: '#0D7377' },
    { id: 'vocab', title: 'لفظن جي راند', desc: 'جوڙ ۽ ٽوڙ ذريعي لفظ سکو', icon: Puzzle, badge: '🧩', accent: '#C1121F' },
    { id: 'breaker', title: 'لفظ ٺاهيو', desc: 'اکرن کي ڇڪي لفظ ٺاهيو', icon: Type, badge: '✍️', accent: '#1B4332' },
    { id: 'quiz', title: 'مشق', desc: 'پنهنجي ڄاڻ کي پرکو', icon: CheckSquare, badge: '🏆', accent: '#7B2D8B' },
    { id: 'shrine', title: 'مزار', desc: 'ڀٽ شاهه مزار جو 3D تجربو', icon: Building2, badge: '🕌', accent: '#B5451B' },
];

const GoldLine = () => (
    <div className="w-full h-px" style={{ background: `linear-gradient(90deg, transparent, ${GOLD}66, transparent)` }} />
);

function SidebarBtn({ active, onClick, icon, label, danger }: {
    active: boolean; onClick: () => void; icon: React.ReactNode; label: string; danger?: boolean;
}) {
    return (
        <button onClick={onClick}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl font-bold text-base transition-all whitespace-nowrap nm-press"
            style={active
                ? { background: GOLD, color: BG, boxShadow: `0 0 18px rgba(212,160,23,0.5), inset 2px 2px 6px rgba(0,0,0,0.3)` }
                : danger
                    ? { background: BG_LIGHT, color: '#ff6b6b', boxShadow: '4px 4px 10px rgba(0,0,0,0.5), -2px -2px 6px rgba(255,255,255,0.03)' }
                    : { background: BG_LIGHT, color: IVORY, boxShadow: '4px 4px 10px rgba(0,0,0,0.5), -2px -2px 6px rgba(255,255,255,0.03)' }
            }
        >
            {icon}<span>{label}</span>
        </button>
    );
}

function HeroMenu({ currentIndex, onSelect, onNext, onPrev }: {
    currentIndex: number; onSelect: (id: string) => void; onNext: () => void; onPrev: () => void;
}) {
    const item = MENU[currentIndex];
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="relative min-h-screen w-full overflow-hidden flex flex-col geo-pattern"
            style={{ background: BG }}>
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute rounded-full blur-[120px]" style={{ width: 500, height: 500, top: '-15%', left: '-10%', background: 'rgba(13,115,119,0.12)' }} />
                <div className="absolute rounded-full blur-[100px]" style={{ width: 400, height: 400, bottom: '-10%', right: '-5%', background: 'rgba(193,18,31,0.1)' }} />
                <div className="absolute rounded-full blur-[80px]" style={{ width: 300, height: 300, top: '40%', left: '50%', background: 'rgba(212,160,23,0.07)' }} />
            </div>
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 z-10" style={{ background: `linear-gradient(to bottom, ${BG}cc 0%, ${BG}99 40%, ${BG}ee 100%)` }} />
                <Image src="/shah_abdul_latif.jpg" alt="Shah Abdul Latif Bhittai" fill className="object-cover object-center opacity-10" priority />
            </div>
            <div className="relative z-20 flex items-center justify-between px-6 md:px-12 pt-6 pb-4">
                <div className="flex items-center gap-3 nm-flat rounded-2xl px-4 py-2.5" style={{ background: BG_LIGHT }}>
                    <span className="text-2xl">🕌</span>
                    <div dir="rtl">
                        <div className="font-black text-lg leading-none" style={{ color: GOLD }}>سنڌي سبق</div>
                        <div className="text-sm opacity-40" style={{ color: IVORY }}>شاهه عبداللطيف ڀٽائي</div>
                    </div>
                </div>
                <div className="flex gap-2" dir="ltr">
                    {MENU.map((_, i) => (
                        <motion.div key={i} animate={{ width: i === currentIndex ? 28 : 6, opacity: i === currentIndex ? 1 : 0.25 }}
                            className="h-1.5 rounded-full" style={{ background: GOLD }} />
                    ))}
                </div>
            </div>
            <GoldLine />
            <div className="relative z-20 flex-1 flex flex-col md:flex-row items-center justify-center gap-8 px-6 md:px-16 py-6 md:py-10" dir="rtl">
                <div className="flex-1 flex flex-col justify-center max-w-xl w-full">
                    <AnimatePresence mode="wait">
                        <motion.div key={`hero-${currentIndex}`}
                            initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                            transition={{ duration: 0.3 }}>
                            <div className="text-5xl mb-3">{item.badge}</div>
                            <h1 className="font-black leading-none mb-3 drop-shadow-2xl"
                                style={{ fontSize: 'clamp(3.5rem, 14vw, 7rem)', color: IVORY }}>
                                {item.title}
                            </h1>
                            <p className="text-lg md:text-2xl mb-6 md:mb-10 leading-relaxed" style={{ color: `${IVORY}80` }}>
                                {item.desc}
                            </p>
                            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                                onClick={() => onSelect(item.id)}
                                className="inline-flex items-center gap-3 px-8 py-4 md:px-10 md:py-5 rounded-2xl font-black text-xl md:text-2xl nm-gold-glow nm-press"
                                style={{ background: `linear-gradient(135deg, ${GOLD} 0%, ${GOLD_BRIGHT} 100%)`, color: BG }}>
                                <Sparkles className="w-5 h-5" />شروع ڪريو
                            </motion.button>
                        </motion.div>
                    </AnimatePresence>
                </div>
                <div className="hidden md:flex flex-1 items-center justify-center relative min-h-[320px] max-w-sm w-full">
                    {[-1, 1].map(offset => {
                        const idx = (currentIndex + offset + MENU.length) % MENU.length;
                        return (
                            <div key={offset} className="absolute rounded-3xl opacity-20"
                                style={{ width: 208, height: 240, background: BG_LIGHT, transform: `translateX(${offset * 65}px) scale(0.82)`, boxShadow: '8px 8px 20px rgba(0,0,0,0.6)', border: `1px solid rgba(212,160,23,0.1)` }}>
                                <div className="flex items-center justify-center h-full text-5xl">{MENU[idx].badge}</div>
                            </div>
                        );
                    })}
                    <AnimatePresence mode="wait">
                        <motion.button key={`card-${currentIndex}`}
                            initial={{ opacity: 0, scale: 0.88, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.88, y: -16 }}
                            transition={{ duration: 0.3, type: 'spring', bounce: 0.25 }}
                            whileHover={{ scale: 1.03, y: -5 }} whileTap={{ scale: 0.97 }}
                            onClick={() => onSelect(item.id)}
                            className="relative rounded-3xl flex flex-col items-center justify-center gap-5 overflow-hidden"
                            style={{ width: 240, height: 280, background: BG_LIGHT, boxShadow: `12px 12px 32px rgba(0,0,0,0.7), -6px -6px 18px rgba(255,255,255,0.04), 0 0 30px ${item.accent}33`, border: `1px solid rgba(212,160,23,0.15)` }}>
                            <div className="absolute inset-0 rounded-3xl" style={{ background: `radial-gradient(circle at 30% 30%, ${item.accent}22, transparent 70%)` }} />
                            <span className="text-6xl relative z-10">{item.badge}</span>
                            <span className="text-4xl font-black relative z-10" style={{ color: IVORY }}>{item.title}</span>
                            <span className="text-sm relative z-10 px-4 text-center opacity-50" style={{ color: IVORY }}>{item.desc}</span>
                        </motion.button>
                    </AnimatePresence>
                </div>
            </div>
            <div className="relative z-20 pb-6 px-4 flex flex-col items-center gap-4">
                <GoldLine />
                <div className="flex overflow-x-auto gap-2 mt-3 w-full pb-1 justify-start md:justify-center" dir="rtl" style={{ scrollbarWidth: 'none' }}>
                    {MENU.map((m, i) => (
                        <motion.button key={m.id} whileTap={{ scale: 0.95 }} onClick={() => onSelect(m.id)}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-full font-bold text-base shrink-0 nm-press transition-all"
                            style={i === currentIndex
                                ? { background: GOLD, color: BG, boxShadow: `0 0 14px rgba(212,160,23,0.4)` }
                                : { background: BG_LIGHT, color: `${IVORY}80`, boxShadow: '3px 3px 8px rgba(0,0,0,0.5), -2px -2px 5px rgba(255,255,255,0.03)' }
                            }>
                            <span>{m.badge}</span><span>{m.title}</span>
                        </motion.button>
                    ))}
                </div>
                <div className="flex gap-3" dir="ltr">
                    {[{ fn: onNext, icon: <ChevronLeft className="w-4 h-4" /> }, { fn: onPrev, icon: <ChevronRight className="w-4 h-4" /> }].map((b, i) => (
                        <motion.button key={i} whileTap={{ scale: 0.9 }} onClick={b.fn}
                            className="p-3 rounded-full nm-raised nm-press" style={{ background: BG_LIGHT, color: IVORY }}>
                            {b.icon}
                        </motion.button>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}

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
    useEffect(() => {
        const handler = () => setTtsNoBalance(true);
        window.addEventListener('tts:no-balance', handler);
        return () => window.removeEventListener('tts:no-balance', handler);
    }, []);

    const handleSectionChange = (section: Section) => {
        setTurnDirection(section === 'menu' ? 'back' : 'forward');
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
        <div className="min-h-screen font-lateef" style={{ background: BG }}>
            {ttsNoBalance && (
                <div className="fixed top-0 inset-x-0 z-[300] flex items-center justify-between gap-3 px-5 py-3 text-sm font-bold"
                    style={{ background: CRIMSON, color: '#fff', direction: 'rtl' }}>
                    <span>🔇 سنڌي آواز بند آهي — UpliftAI اڪائونٽ ۾ بيلنس ختم ٿي ويو آهي</span>
                    <a href="https://upliftai.org" target="_blank" rel="noopener noreferrer" className="underline opacity-80 hover:opacity-100 whitespace-nowrap">upliftai.org تي ٽاپ اپ ڪريو</a>
                    <button onClick={() => setTtsNoBalance(false)} className="opacity-60 hover:opacity-100 text-lg leading-none">✕</button>
                </div>
            )}

            <AnimatePresence>
                {appState === 'init' && (
                    <motion.div key="init" className="fixed inset-0 z-[200] flex items-center justify-center overflow-hidden geo-pattern"
                        style={{ background: BG }} exit={{ opacity: 0, scale: 1.04 }} transition={{ duration: 0.7 }}>
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                            <div className="absolute rounded-full blur-[140px]" style={{ width: 600, height: 600, top: '-20%', left: '-15%', background: 'rgba(13,115,119,0.18)' }} />
                            <div className="absolute rounded-full blur-[120px]" style={{ width: 500, height: 500, bottom: '-15%', right: '-10%', background: 'rgba(193,18,31,0.14)' }} />
                        </div>
                        <div className="relative z-10 flex flex-col items-center gap-8 px-8 text-center" dir="rtl">
                            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}
                                className="text-7xl float">🕌</motion.div>
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}
                                className="nm-raised-lg rounded-3xl px-8 py-6" style={{ background: BG_LIGHT }}>
                                <h1 className="text-5xl md:text-7xl font-black leading-tight" style={{ color: IVORY }}>
                                    شاهه عبداللطيف<br /><span className="gold-shimmer">ڀٽائي</span>
                                </h1>
                            </motion.div>
                            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                                className="text-xl md:text-2xl opacity-50" style={{ color: IVORY }}>سنڌ جو عظيم صوفي شاعر</motion.p>
                            <GoldLine />
                            <motion.button initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.7, type: 'spring', bounce: 0.35 }}
                                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                onClick={() => setAppState('splash')}
                                className="mt-2 px-12 py-5 rounded-full font-black text-2xl md:text-3xl nm-gold-glow nm-press"
                                style={{ background: `linear-gradient(135deg, ${GOLD}, ${GOLD_BRIGHT})`, color: BG }}>
                                <span className="flex items-center gap-3"><Sparkles className="w-7 h-7" />شروع ڪريو</span>
                            </motion.button>
                        </div>
                    </motion.div>
                )}
                {appState === 'splash' && (
                    <motion.div key="splash" className="fixed inset-0 z-[100] pointer-events-none flex items-center justify-center overflow-hidden geo-pattern"
                        style={{ background: BG }} exit={{ opacity: 0 }} transition={{ duration: 1 }}>
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                            <div className="absolute rounded-full blur-[160px]" style={{ width: 700, height: 700, top: '-25%', left: '-20%', background: 'rgba(13,115,119,0.15)' }} />
                            <div className="absolute rounded-full blur-[120px]" style={{ width: 500, height: 500, bottom: '-20%', right: '-15%', background: 'rgba(193,18,31,0.12)' }} />
                        </div>
                        <div className="relative z-10 flex flex-col items-center gap-6 px-8 text-center" dir="rtl">
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}
                                className="text-4xl md:text-6xl lg:text-7xl font-black leading-snug" style={{ color: IVORY }}>
                                ڪانه پُڇي ٿو ذاتِ،
                            </motion.div>
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 1 }}
                                className="text-4xl md:text-6xl lg:text-7xl font-black leading-snug gold-shimmer">
                                جيڪي آيا سي اَگهيا۔
                            </motion.div>
                            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.2 }}
                                className="text-base md:text-xl opacity-30 mt-2" style={{ color: IVORY }}>— شاهه عبداللطيف ڀٽائي</motion.p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {currentSection === 'menu' ? (
                <div className="min-h-screen">
                    <PageTurnTransition pageKey={currentSection + sectionKey} direction={turnDirection}>
                        {renderSection()}
                    </PageTurnTransition>
                </div>
            ) : (
                <div className="min-h-screen flex flex-col md:flex-row" dir="rtl" style={{ background: BG }}>
                    <aside className="w-full md:w-56 flex flex-row md:flex-col p-3 md:p-4 gap-2 z-50 overflow-x-auto md:overflow-visible shrink-0 border-b md:border-b-0 md:border-l"
                        style={{ background: BG_LIGHT, borderColor: `${GOLD}22`, boxShadow: '4px 0 20px rgba(0,0,0,0.4)' }}>
                        <div className="hidden md:flex flex-col items-center gap-2 mb-4 pb-4" style={{ borderBottom: `1px solid ${GOLD}22` }}>
                            <span className="text-3xl">🕌</span>
                            <h2 className="text-lg font-black text-center" style={{ color: GOLD }}>سنڌي سبق</h2>
                        </div>
                        <SidebarBtn active={isReadingAll} onClick={handleReadAll}
                            icon={isReadingAll ? <Square className="w-4 h-4 fill-current" /> : <Volume2 className="w-4 h-4" />}
                            label={isReadingAll ? 'بند ڪريو' : 'سڀ پڙهو'} />
                        <SidebarBtn active={isHoverSpeakEnabled} onClick={() => setIsHoverSpeakEnabled(v => !v)}
                            icon={<MousePointer2 className="w-4 h-4" />} label="لفظ تي آواز" />
                        <div className="hidden md:block flex-1" />
                        <SidebarBtn active={false} onClick={handleRestart} icon={<RotateCcw className="w-4 h-4" />} label="ٻيهر شروع" />
                        <SidebarBtn active={false} onClick={() => handleSectionChange('menu')} icon={<Home className="w-4 h-4" />} label="واپس مينيو" danger />
                    </aside>
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
