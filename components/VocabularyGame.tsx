'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, ArrowLeft, Play, Volume2 } from 'lucide-react';
import { playSindhiAudio } from '../utils/audioPlayer';

interface VocabItem { word: string; letters: string[]; }

const TEAL = '#0891B2';
const TEAL_DARK = '#0e7490';
const ORANGE = '#f97316';
const TEXT = '#1e293b';
const TEXT_MUTED = '#475569';
const GREEN = '#16a34a';
const BG_CARD = '#f0f9ff';
const BG_HEADER = '#e0f2fe';

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
              className="text-8xl font-bold" style={{ color: TEAL }}>ڪتاب</motion.div>
          ) : (
            <motion.div key="broken" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex gap-3">
              {letters.map((l, i) => (
                <motion.div key={i} initial={{ y: -40, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                  transition={{ type: 'spring', bounce: 0.5, delay: i * 0.12 }}
                  className="rounded-2xl text-5xl font-bold flex items-center justify-center shadow-md"
                  style={{ background: '#fff', color: TEAL, width: 72, height: 88, border: `2px solid ${TEAL}33` }}>
                  {l}
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <motion.div key={phase} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-bold mt-4" style={{ color: TEXT_MUTED }}>
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

  if (showIntro) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full p-4">
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
          className="w-full rounded-3xl overflow-hidden flex flex-col items-center text-center p-6 shadow-xl"
          style={{ background: '#fff', border: `2px solid ${TEAL}22` }}>
          <h2 className="text-4xl font-bold mb-4" style={{ color: TEAL }}>جوڙ ۽ ٽوڙ ڇا آهي؟</h2>
          <p className="text-xl mb-6 leading-relaxed max-w-2xl" style={{ color: TEXT_MUTED }}>
            لفظن کي ٺاهڻ لاءِ اکرن کي ملائڻ کي <strong style={{ color: TEAL }}>جوڙ</strong> چئبو آهي، ۽ لفظن کي واپس اکرن ۾ ڌار ڪرڻ کي <strong style={{ color: TEAL }}>ٽوڙ</strong> چئبو آهي.
          </p>
          <div className="flex flex-col items-center justify-center h-48 mb-8 w-full rounded-2xl overflow-hidden"
            style={{ background: BG_CARD, border: `1px solid ${TEAL}22` }}>
            <WordAnimation />
          </div>
          <button onClick={() => setShowIntro(false)}
            className="px-10 py-5 rounded-full text-3xl font-bold flex items-center gap-3 shadow-lg hover:scale-105 active:scale-95 transition-all"
            style={{ background: `linear-gradient(135deg, ${TEAL}, ${TEAL_DARK})`, color: '#fff' }}>
            <Play className="w-8 h-8 fill-current" />راند شروع ڪريو
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-full">
      {/* Header */}
      <div className="px-4 py-3 flex justify-between items-center border-b shrink-0"
        style={{ borderColor: '#bae6fd', background: BG_HEADER }}>
        <h2 className="text-2xl font-bold" style={{ color: TEAL }}>لفظن جا جوڙ ۽ ٽوڙ</h2>
        <div className="text-xl font-bold px-4 py-2 rounded-full shadow"
          style={{ background: ORANGE, color: '#fff' }}>
          اسڪور: {score}
        </div>
      </div>

      {/* Game area */}
      <div className="flex-1 flex flex-col items-center justify-center p-4" style={{ background: '#fff' }}>
        <div className="flex items-center gap-4 mb-6">
          <motion.h3 key={currentItem.word} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="text-7xl font-bold" style={{ color: TEAL }}>{currentItem.word}</motion.h3>
          <button onClick={() => playSindhiAudio(currentItem.word)}
            className="p-4 rounded-full shadow-md hover:scale-110 active:scale-95 transition-all"
            style={{ background: BG_CARD, color: TEAL, border: `2px solid ${TEAL}33` }}>
            <Volume2 className="w-8 h-8" />
          </button>
        </div>

        <div className="flex flex-wrap justify-center gap-4" dir="rtl">
          <AnimatePresence>
            {currentItem.letters.map((letter, idx) => (
              <motion.button key={`${currentIndex}-${idx}`}
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.08 }}
                onClick={() => { handleReveal(idx); playSindhiAudio(letter); }}
                className="rounded-2xl text-5xl font-bold flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-md"
                style={revealed[idx]
                  ? { background: `linear-gradient(135deg, ${TEAL}, ${TEAL_DARK})`, color: '#fff', width: 88, height: 104 }
                  : { background: '#f1f5f9', color: '#94a3b8', border: `2px dashed #cbd5e1`, width: 88, height: 104 }
                }>
                {revealed[idx] ? letter : '؟'}
              </motion.button>
            ))}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {allRevealed && (
            <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
              className="mt-8 flex flex-col items-center gap-4">
              <div className="flex items-center gap-2 text-2xl font-bold px-5 py-2.5 rounded-full"
                style={{ color: GREEN, background: '#dcfce7', border: '2px solid #86efac' }}>
                <CheckCircle2 className="w-6 h-6" /> بهترين!
              </div>
              <button onClick={handleNext}
                className="px-8 py-4 rounded-full text-2xl font-bold flex items-center gap-3 shadow-lg hover:scale-105 active:scale-95 transition-all"
                style={{ background: `linear-gradient(135deg, ${ORANGE}, #ea580c)`, color: '#fff' }}>
                {currentIndex === data.length - 1 ? 'مڪمل ڪريو' : 'اڳيون لفظ'}
                <ArrowLeft className="w-6 h-6" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Progress */}
      <div className="px-4 py-3 text-center text-xl font-bold border-t shrink-0"
        style={{ borderColor: '#bae6fd', background: BG_HEADER, color: TEXT_MUTED }}>
        لفظ {currentIndex + 1} مان {data.length}
      </div>
    </div>
  );
}
