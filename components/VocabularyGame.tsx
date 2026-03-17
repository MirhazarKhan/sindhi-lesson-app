'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, ArrowLeft, Play, Volume2 } from 'lucide-react';
import { playSindhiAudio } from '../utils/audioPlayer';

interface VocabItem {
  word: string;
  letters: string[];
}

const WordAnimation = () => {
  const letters = ['ڪ', 'ت', 'ا', 'ب'];
  const [phase, setPhase] = useState<'joined' | 'broken'>('joined');

  useEffect(() => {
    const interval = setInterval(() => {
      setPhase(p => p === 'joined' ? 'broken' : 'joined');
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full w-full" dir="rtl">
      <div className="h-24 flex items-center justify-center mb-4">
        <AnimatePresence mode="wait">
          {phase === 'joined' ? (
            <motion.div
              key="joined"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.5, filter: 'blur(10px)' }}
              transition={{ duration: 0.5 }}
              className="text-8xl font-bold text-[#FFB703]"
            >
              ڪتاب
            </motion.div>
          ) : (
            <motion.div
              key="broken"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex gap-4"
            >
              {letters.map((l, i) => (
                <motion.div
                  key={i}
                  initial={{ y: -50, opacity: 0, rotate: -10 }}
                  animate={{ y: 0, opacity: 1, rotate: 0 }}
                  transition={{ type: "spring", bounce: 0.5, delay: i * 0.15 }}
                  className="w-20 h-24 rounded-2xl text-[#FFB703] text-6xl font-bold flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg,#0D7377,#14213D)', border: '1px solid rgba(255,183,3,0.4)' }}
                >
                  {l}
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <motion.div key={phase} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-bold text-white/40 mt-4">
        {phase === 'joined' ? 'جوڙ (ملائڻ)' : 'ٽوڙ (ڌار ڪرڻ)'}
      </motion.div>
    </div>
  );
};

export default function VocabularyGame({ data, onComplete }: { data: VocabItem[], onComplete: () => void }) {
  const [showIntro, setShowIntro] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentItem = data[currentIndex];

  // Initialize revealed state for the current word
  const [revealed, setRevealed] = useState<boolean[]>(new Array(currentItem.letters.length).fill(false));
  const [score, setScore] = useState(0);

  const handleReveal = (index: number) => {
    if (!revealed[index]) {
      const newRevealed = [...revealed];
      newRevealed[index] = true;
      setRevealed(newRevealed);
      setScore(prev => prev + 10);
    }
  };

  useEffect(() => {
    if (revealed.length > 0 && revealed.every(Boolean)) {
      setTimeout(() => {
        playSindhiAudio(currentItem.word);
      }, 500);
    }
  }, [revealed, currentItem.word]);

  const allRevealed = revealed.every(Boolean);

  const handleNext = () => {
    if (currentIndex < data.length - 1) {
      const nextItem = data[currentIndex + 1];
      setCurrentIndex(prev => prev + 1);
      setRevealed(new Array(nextItem.letters.length).fill(false));
    } else {
      onComplete();
    }
  };

  if (showIntro) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] w-full max-w-4xl mx-auto p-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
          className="w-full rounded-3xl overflow-hidden border p-8 md:p-12 flex flex-col items-center text-center shadow-[0_0_60px_rgba(13,115,119,0.3)]"
          style={{ background: 'linear-gradient(160deg,#0D1B2A,#0a0a12)', borderColor: 'rgba(255,183,3,0.3)' }}
        >
          <h2 className="text-5xl md:text-6xl font-bold text-[#FFB703] mb-6">جوڙ ۽ ٽوڙ ڇا آهي؟</h2>
          <p className="text-2xl md:text-3xl text-[#FFF8EE]/80 mb-10 leading-relaxed max-w-2xl">
            لفظن کي ٺاهڻ لاءِ اکرن کي ملائڻ کي <strong className="text-[#FFB703] text-4xl">جوڙ</strong> چئبو آهي، ۽ لفظن کي واپس اکرن ۾ ڌار ڪرڻ کي <strong className="text-[#FFB703] text-4xl">ٽوڙ</strong> چئبو آهي.
          </p>
          <div className="flex flex-col items-center justify-center h-64 mb-12 w-full rounded-3xl border border-dashed overflow-hidden relative shadow-inner"
            style={{ background: 'rgba(13,115,119,0.15)', borderColor: 'rgba(255,183,3,0.3)' }}>
            <WordAnimation />
          </div>
          <button onClick={() => setShowIntro(false)}
            className="px-12 py-5 rounded-full text-4xl font-bold text-[#14213D] shadow-[0_0_30px_rgba(255,183,3,0.4)] flex items-center gap-4 hover:scale-105 active:scale-95 transition-transform"
            style={{ background: 'linear-gradient(135deg,#FFB703,#F4A261)' }}>
            <Play className="w-10 h-10 fill-current" />
            راند شروع ڪريو
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] w-full max-w-4xl mx-auto p-4">
      <div className="w-full rounded-3xl overflow-hidden border shadow-[0_0_60px_rgba(13,115,119,0.3)]"
        style={{ background: 'linear-gradient(160deg,#0D1B2A,#0a0a12)', borderColor: 'rgba(255,183,3,0.3)' }}>
        {/* Header */}
        <div className="p-6 flex justify-between items-center border-b"
          style={{ background: 'linear-gradient(90deg,#0D7377,#14213D)', borderColor: 'rgba(255,183,3,0.3)' }}>
          <h2 className="text-3xl font-bold text-[#FFB703]">لفظن جا جوڙ ۽ ٽوڙ</h2>
          <div className="text-2xl font-bold px-4 py-2 rounded-full text-[#14213D]"
            style={{ background: 'linear-gradient(135deg,#FFB703,#F4A261)' }}>
            اسڪور: {score}
          </div>
        </div>

        {/* Game Area */}
        <div className="p-8 md:p-16 flex flex-col items-center justify-center min-h-[400px]">
          <div className="flex items-center gap-6 mb-12">
            <motion.h3 key={currentItem.word} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="text-6xl md:text-8xl font-bold text-[#FFB703]">{currentItem.word}</motion.h3>
            <button onClick={() => playSindhiAudio(currentItem.word)}
              className="p-4 rounded-full border text-[#FFB703] hover:scale-105 transition-transform"
              style={{ background: 'rgba(13,115,119,0.3)', borderColor: 'rgba(255,183,3,0.4)' }}>
              <Volume2 className="w-8 h-8" />
            </button>
          </div>

          <div className="flex flex-wrap justify-center gap-4" dir="rtl">
            <AnimatePresence>
              {currentItem.letters.map((letter, idx) => (
                <motion.button key={`${currentIndex}-${idx}`}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}
                  onClick={() => { handleReveal(idx); playSindhiAudio(letter); }}
                  className="w-20 h-24 md:w-24 md:h-28 rounded-2xl text-5xl md:text-6xl font-bold flex items-center justify-center transition-all hover:scale-105 border"
                  style={revealed[idx]
                    ? { background: 'linear-gradient(135deg,#FFB703,#F4A261)', borderColor: '#FFB703', color: '#14213D' }
                    : { background: 'rgba(13,115,119,0.2)', borderColor: 'rgba(255,183,3,0.3)', borderStyle: 'dashed', color: 'rgba(255,255,255,0.3)' }}
                >
                  {revealed[idx] ? letter : '؟'}
                </motion.button>
              ))}
            </AnimatePresence>
          </div>

          <AnimatePresence>
            {allRevealed && (
              <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                className="mt-12 flex flex-col items-center gap-6">
                <div className="flex items-center gap-2 text-3xl font-bold px-6 py-3 rounded-full border"
                  style={{ color: '#2DC653', background: 'rgba(45,198,83,0.1)', borderColor: 'rgba(45,198,83,0.4)' }}>
                  <CheckCircle2 className="w-8 h-8" /> بهترين!
                </div>
                <button onClick={handleNext}
                  className="px-8 py-4 rounded-full text-3xl font-bold text-[#14213D] flex items-center gap-3 shadow-[0_0_20px_rgba(255,183,3,0.4)] hover:scale-105 transition-transform"
                  style={{ background: 'linear-gradient(135deg,#FFB703,#F4A261)' }}>
                  {currentIndex === data.length - 1 ? 'مڪمل ڪريو' : 'اڳيون لفظ'}
                  <ArrowLeft className="w-8 h-8" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Progress */}
        <div className="p-4 text-center text-xl text-white/50 font-bold border-t"
          style={{ background: 'rgba(13,115,119,0.15)', borderColor: 'rgba(255,183,3,0.2)' }}>
          لفظ {currentIndex + 1} مان {data.length}
        </div>
      </div>
    </div>
  );
}
