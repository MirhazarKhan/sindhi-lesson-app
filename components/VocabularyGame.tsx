'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, ArrowLeft, Play, Volume2 } from 'lucide-react';
import { playSindhiAudio } from '../utils/audioPlayer';

interface VocabItem { word: string; letters: string[]; }

const BG = '#0E0B16';
const BG_LIGHT = '#1A1528';
const GOLD = '#D4A017';
const GOLD_BRIGHT = '#F5C842';
const IVORY = '#F0E6D3';
const GREEN = '#2DC653';

const WordAnimation = () => {
  const letters = ['ڪ', 'ت', 'ا', 'ب'];
  const [phase, setPhase] = useState<'joined' | 'broken'>('joined');
  useEffect(() => {
    const interval = setInterval(() => setPhase(p => p === 'joined' ? 'broken' : 'joined'), 2500);
    return () => clearInterval(interval);
  }, []);
  return (
    <div className="flex flex-col items-center justify-center h-full w-full" dir="rtl">
      <div className="h-24 flex items-center justify-center mb-4">
        <AnimatePresence mode="wait">
          {phase === 'joined' ? (
            <motion.div key="joined" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.5, filter: 'blur(10px)' }} transition={{ duration: 0.5 }}
              className="text-8xl font-bold" style={{ color: GOLD }}>ڪتاب</motion.div>
          ) : (
            <motion.div key="broken" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex gap-3">
              {letters.map((l, i) => (
                <motion.div key={i} initial={{ y: -40, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                  transition={{ type: 'spring', bounce: 0.5, delay: i * 0.12 }}
                  className="w-14 h-18 md:w-18 md:h-22 rounded-2xl text-3xl md:text-5xl font-bold flex items-center justify-center nm-raised"
                  style={{ background: BG_LIGHT, color: GOLD, width: 56, height: 72, border: `1px solid rgba(212,160,23,0.2)` }}>
                  {l}
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <motion.div key={phase} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        className="text-xl font-bold opacity-40 mt-4" style={{ color: IVORY }}>
        {phase === 'joined' ? 'جوڙ (ملائڻ)' : 'ٽوڙ (ڌار ڪرڻ)'}
      </motion.div>
    </div>
  );
};

export default function VocabularyGame({ data, onComplete }: { data: VocabItem[], onComplete: () => void }) {
  const [showIntro, setShowIntro] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentItem = data[currentIndex];
  const [revealed, setRevealed] = useState<boolean[]>(new Array(currentItem.letters.length).fill(false));
  const [score, setScore] = useState(0);

  const handleReveal = (index: number) => {
    if (!revealed[index]) {
      const n = [...revealed]; n[index] = true; setRevealed(n); setScore(p => p + 10);
    }
  };

  useEffect(() => {
    if (revealed.length > 0 && revealed.every(Boolean)) {
      setTimeout(() => playSindhiAudio(currentItem.word), 500);
    }
  }, [revealed, currentItem.word]);

  const allRevealed = revealed.every(Boolean);

  const handleNext = () => {
    if (currentIndex < data.length - 1) {
      const next = data[currentIndex + 1];
      setCurrentIndex(p => p + 1);
      setRevealed(new Array(next.letters.length).fill(false));
    } else { onComplete(); }
  };

  const cardStyle = {
    background: BG_LIGHT,
    boxShadow: '12px 12px 32px rgba(0,0,0,0.7), -6px -6px 18px rgba(255,255,255,0.04)',
    border: `1px solid rgba(212,160,23,0.12)`,
  };

  if (showIntro) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] w-full max-w-4xl mx-auto p-4">
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
          className="w-full rounded-3xl overflow-hidden flex flex-col items-center text-center p-5 md:p-12" style={cardStyle}>
          <h2 className="text-3xl md:text-5xl font-bold mb-4" style={{ color: GOLD }}>جوڙ ۽ ٽوڙ ڇا آهي؟</h2>
          <p className="text-lg md:text-2xl mb-6 leading-relaxed max-w-2xl opacity-80" style={{ color: IVORY }}>
            لفظن کي ٺاهڻ لاءِ اکرن کي ملائڻ کي <strong style={{ color: GOLD }}>جوڙ</strong> چئبو آهي، ۽ لفظن کي واپس اکرن ۾ ڌار ڪرڻ کي <strong style={{ color: GOLD }}>ٽوڙ</strong> چئبو آهي.
          </p>
          <div className="flex flex-col items-center justify-center h-48 md:h-56 mb-8 w-full rounded-2xl overflow-hidden"
            style={{ background: BG, boxShadow: 'inset 4px 4px 12px rgba(0,0,0,0.6), inset -3px -3px 8px rgba(255,255,255,0.03)', border: `1px solid rgba(212,160,23,0.1)` }}>
            <WordAnimation />
          </div>
          <button onClick={() => setShowIntro(false)}
            className="px-8 py-4 md:px-12 md:py-5 rounded-full text-2xl md:text-3xl font-bold flex items-center gap-3 nm-press"
            style={{ background: `linear-gradient(135deg, ${GOLD}, ${GOLD_BRIGHT})`, color: BG, boxShadow: `0 0 24px rgba(212,160,23,0.4)` }}>
            <Play className="w-8 h-8 fill-current" />راند شروع ڪريو
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] w-full max-w-4xl mx-auto p-4">
      <div className="w-full rounded-3xl overflow-hidden" style={cardStyle}>
        {/* Header */}
        <div className="p-4 md:p-6 flex justify-between items-center border-b" style={{ borderColor: `${GOLD}22`, background: BG }}>
          <h2 className="text-xl md:text-2xl font-bold" style={{ color: GOLD }}>لفظن جا جوڙ ۽ ٽوڙ</h2>
          <div className="text-base md:text-xl font-bold px-4 py-2 rounded-full nm-press"
            style={{ background: `linear-gradient(135deg, ${GOLD}, ${GOLD_BRIGHT})`, color: BG }}>
            اسڪور: {score}
          </div>
        </div>

        {/* Game area */}
        <div className="p-4 md:p-12 flex flex-col items-center justify-center min-h-[300px] md:min-h-[380px]"
          style={{ boxShadow: 'inset 3px 3px 10px rgba(0,0,0,0.4), inset -2px -2px 6px rgba(255,255,255,0.02)' }}>
          <div className="flex items-center gap-4 mb-8 md:mb-10">
            <motion.h3 key={currentItem.word} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="text-5xl md:text-7xl font-bold" style={{ color: GOLD }}>{currentItem.word}</motion.h3>
            <button onClick={() => playSindhiAudio(currentItem.word)}
              className="p-3 md:p-4 rounded-full nm-raised nm-press"
              style={{ background: BG_LIGHT, color: GOLD }}>
              <Volume2 className="w-5 h-5 md:w-7 md:h-7" />
            </button>
          </div>

          <div className="flex flex-wrap justify-center gap-3 md:gap-4" dir="rtl">
            <AnimatePresence>
              {currentItem.letters.map((letter, idx) => (
                <motion.button key={`${currentIndex}-${idx}`}
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.08 }}
                  onClick={() => { handleReveal(idx); playSindhiAudio(letter); }}
                  className="w-14 h-18 md:w-22 md:h-26 rounded-2xl text-3xl md:text-5xl font-bold flex items-center justify-center nm-press transition-all"
                  style={revealed[idx]
                    ? { background: `linear-gradient(135deg, ${GOLD}, ${GOLD_BRIGHT})`, color: BG, boxShadow: `0 0 16px rgba(212,160,23,0.4)`, width: 72, height: 88 }
                    : { background: BG, color: 'rgba(240,230,211,0.2)', boxShadow: 'inset 3px 3px 8px rgba(0,0,0,0.6), inset -2px -2px 5px rgba(255,255,255,0.03)', border: `1px dashed rgba(212,160,23,0.2)`, width: 72, height: 88 }
                  }>
                  {revealed[idx] ? letter : '؟'}
                </motion.button>
              ))}
            </AnimatePresence>
          </div>

          <AnimatePresence>
            {allRevealed && (
              <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
                className="mt-8 md:mt-10 flex flex-col items-center gap-4">
                <div className="flex items-center gap-2 text-xl md:text-2xl font-bold px-5 py-2.5 rounded-full"
                  style={{ color: GREEN, background: 'rgba(45,198,83,0.1)', border: '1px solid rgba(45,198,83,0.3)' }}>
                  <CheckCircle2 className="w-6 h-6" /> بهترين!
                </div>
                <button onClick={handleNext}
                  className="px-6 py-3 md:px-8 md:py-4 rounded-full text-xl md:text-2xl font-bold flex items-center gap-3 nm-press"
                  style={{ background: `linear-gradient(135deg, ${GOLD}, ${GOLD_BRIGHT})`, color: BG, boxShadow: `0 0 20px rgba(212,160,23,0.4)` }}>
                  {currentIndex === data.length - 1 ? 'مڪمل ڪريو' : 'اڳيون لفظ'}
                  <ArrowLeft className="w-5 h-5 md:w-6 md:h-6" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Progress */}
        <div className="p-4 text-center text-lg opacity-40 font-bold border-t" style={{ borderColor: `${GOLD}22`, background: BG, color: IVORY }}>
          لفظ {currentIndex + 1} مان {data.length}
        </div>
      </div>
    </div>
  );
}
