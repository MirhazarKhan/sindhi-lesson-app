'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, XCircle, Trophy, ArrowRight } from 'lucide-react';

interface TrueFalseQuestion { question: string; answer: boolean; }
interface FillInTheBlankQuestion { question: string; options: string[]; answer: string; }
interface QuizData { trueFalse: TrueFalseQuestion[]; fillInTheBlanks: FillInTheBlankQuestion[]; }

const TEAL = '#0891B2';
const TEAL_DARK = '#0e7490';
const ORANGE = '#f97316';
const TEXT = '#1e293b';
const TEXT_MUTED = '#475569';
const GREEN = '#16a34a';
const RED = '#dc2626';
const BG_HEADER = '#e0f2fe';

export default function QuizSection({ data, onComplete }: { data: QuizData, onComplete: () => void }) {
  const [currentSection, setCurrentSection] = useState<'tf' | 'fib' | 'result'>('tf');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showFeedback, setShowFeedback] = useState<boolean | null>(null);

  const tfQuestions = data.trueFalse;
  const fibQuestions = data.fillInTheBlanks;

  const handleAnswer = (isCorrect: boolean) => {
    setShowFeedback(isCorrect);
    if (isCorrect) setScore(p => p + 10);
    setTimeout(() => {
      setShowFeedback(null);
      if (currentSection === 'tf') {
        if (currentIndex < tfQuestions.length - 1) setCurrentIndex(p => p + 1);
        else { setCurrentSection('fib'); setCurrentIndex(0); }
      } else if (currentSection === 'fib') {
        if (currentIndex < fibQuestions.length - 1) setCurrentIndex(p => p + 1);
        else setCurrentSection('result');
      }
    }, 1500);
  };

  const renderFeedback = () => {
    if (showFeedback === null) return null;
    return (
      <motion.div initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.6 }}
        className="absolute inset-0 flex items-center justify-center z-10 rounded-2xl"
        style={{ background: 'rgba(255,255,255,0.96)' }}>
        <div className="flex flex-col items-center gap-4">
          {showFeedback
            ? <CheckCircle2 className="w-28 h-28" style={{ color: GREEN }} />
            : <XCircle className="w-28 h-28" style={{ color: RED }} />}
          <h2 className="text-4xl font-bold" style={{ color: showFeedback ? GREEN : RED }}>
            {showFeedback ? 'صحيح جواب!' : 'غلط جواب'}
          </h2>
        </div>
      </motion.div>
    );
  };

  const renderTF = () => {
    const q = tfQuestions[currentIndex];
    return (
      <div className="flex flex-col items-center justify-center p-5 min-h-[280px] relative">
        <AnimatePresence>{renderFeedback()}</AnimatePresence>
        <h3 className="text-2xl font-bold mb-8 text-center leading-loose" dir="rtl" style={{ color: TEXT }}>
          {q.question}
        </h3>
        <div className="flex gap-5 w-full justify-center">
          {[
            { label: 'صحيح ✅', correct: q.answer === true, bg: '#dcfce7', border: '#86efac', color: GREEN },
            { label: 'غلط ❌', correct: q.answer === false, bg: '#fee2e2', border: '#fca5a5', color: RED },
          ].map(({ label, correct, bg, border, color }) => (
            <button key={label} onClick={() => handleAnswer(correct)} disabled={showFeedback !== null}
              className="flex-1 max-w-[200px] px-6 py-5 rounded-2xl text-3xl font-bold transition-all hover:scale-105 active:scale-95 shadow-md disabled:opacity-50"
              style={{ background: bg, color, border: `2px solid ${border}` }}>
              {label}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderFIB = () => {
    const q = fibQuestions[currentIndex];
    return (
      <div className="flex flex-col items-center justify-center p-5 min-h-[280px] relative">
        <AnimatePresence>{renderFeedback()}</AnimatePresence>
        <h3 className="text-xl font-bold mb-6 text-center leading-loose" dir="rtl" style={{ color: TEXT }}>
          {q.question.split('______').map((part, i, arr) => (
            <span key={i}>
              {part}
              {i < arr.length - 1 && (
                <span className="inline-block w-20 border-b-4 mx-2 align-middle" style={{ borderColor: TEAL }} />
              )}
            </span>
          ))}
        </h3>
        <div className="grid grid-cols-1 gap-3 w-full">
          {q.options.map((opt, idx) => (
            <button key={idx} onClick={() => handleAnswer(opt === q.answer)} disabled={showFeedback !== null}
              className="px-5 py-4 rounded-2xl text-2xl font-bold transition-all hover:scale-[1.02] active:scale-95 shadow-md disabled:opacity-50"
              style={{ background: '#f0f9ff', color: TEAL, border: `2px solid ${TEAL}33` }}>
              {opt}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderResult = () => {
    const total = tfQuestions.length + fibQuestions.length;
    const pct = (score / (total * 10)) * 100;
    return (
      <div className="flex flex-col items-center justify-center p-6 min-h-[280px]">
        <Trophy className="w-24 h-24 mb-4" style={{ color: pct >= 80 ? ORANGE : '#94a3b8' }} />
        <h2 className="text-4xl font-bold mb-3" dir="rtl" style={{ color: TEXT }}>توهان جو اسڪور</h2>
        <div className="text-6xl font-black mb-4" style={{ color: TEAL }}>{score} / {total * 10}</div>
        <p className="text-2xl mb-8 font-bold" dir="rtl" style={{ color: TEXT_MUTED }}>
          {pct >= 80 ? '🎉 بهترين ڪارڪردگي!' : '💪 وڌيڪ محنت جي ضرورت آهي'}
        </p>
        <button onClick={onComplete}
          className="px-10 py-4 rounded-full text-2xl font-bold flex items-center gap-3 shadow-lg hover:scale-105 active:scale-95 transition-all"
          style={{ background: `linear-gradient(135deg, ${ORANGE}, #ea580c)`, color: '#fff' }}
          dir="rtl">
          مڪمل ڪريو <ArrowRight className="w-6 h-6" />
        </button>
      </div>
    );
  };

  return (
    <div className="flex flex-col w-full h-full">
      <div className="px-4 py-3 flex justify-between items-center border-b shrink-0"
        style={{ borderColor: '#bae6fd', background: BG_HEADER }}>
        <h2 className="text-2xl font-bold" style={{ color: TEAL }}>
          {currentSection === 'tf' ? '✅ صحيح يا غلط' : currentSection === 'fib' ? '✏️ خالي جايون ڀريو' : '🏆 نتيجو'}
        </h2>
        {currentSection !== 'result' && (
          <div className="text-xl font-bold px-4 py-2 rounded-full shadow"
            style={{ background: ORANGE, color: '#fff' }}>
            اسڪور: {score}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar" style={{ background: '#fff' }}>
        <AnimatePresence mode="wait">
          <motion.div key={`${currentSection}-${currentIndex}`}
            initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }} transition={{ duration: 0.2 }}>
            {currentSection === 'tf' && renderTF()}
            {currentSection === 'fib' && renderFIB()}
            {currentSection === 'result' && renderResult()}
          </motion.div>
        </AnimatePresence>
      </div>

      {currentSection !== 'result' && (
        <div className="px-4 py-3 text-center text-xl font-bold border-t shrink-0"
          style={{ borderColor: '#bae6fd', background: BG_HEADER, color: TEXT_MUTED }}>
          سوال {currentIndex + 1} مان {currentSection === 'tf' ? tfQuestions.length : fibQuestions.length}
        </div>
      )}
    </div>
  );
}
