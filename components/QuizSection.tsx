'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, XCircle, Trophy, ArrowRight } from 'lucide-react';

interface TrueFalseQuestion { question: string; answer: boolean; }
interface FillInTheBlankQuestion { question: string; options: string[]; answer: string; }
interface QuizData { trueFalse: TrueFalseQuestion[]; fillInTheBlanks: FillInTheBlankQuestion[]; }

const BG = '#0E0B16';
const BG_LIGHT = '#1A1528';
const GOLD = '#D4A017';
const GOLD_BRIGHT = '#F5C842';
const IVORY = '#F0E6D3';
const GREEN = '#2DC653';
const CRIMSON = '#C1121F';

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

  const cardStyle = {
    background: BG_LIGHT,
    boxShadow: '12px 12px 32px rgba(0,0,0,0.7), -6px -6px 18px rgba(255,255,255,0.04)',
    border: `1px solid rgba(212,160,23,0.12)`,
  };

  const renderFeedback = () => {
    if (showFeedback === null) return null;
    return (
      <motion.div initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.6 }}
        className="absolute inset-0 flex items-center justify-center z-10 rounded-3xl"
        style={{ background: showFeedback ? 'rgba(14,11,22,0.94)' : 'rgba(14,11,22,0.94)' }}>
        <div className="flex flex-col items-center gap-4">
          {showFeedback
            ? <CheckCircle2 className="w-24 h-24 md:w-32 md:h-32" style={{ color: GREEN }} />
            : <XCircle className="w-24 h-24 md:w-32 md:h-32" style={{ color: CRIMSON }} />}
          <h2 className="text-4xl font-bold" style={{ color: showFeedback ? GREEN : CRIMSON }}>
            {showFeedback ? 'صحيح جواب!' : 'غلط جواب'}
          </h2>
        </div>
      </motion.div>
    );
  };

  const renderTF = () => {
    const q = tfQuestions[currentIndex];
    return (
      <div className="flex flex-col items-center justify-center p-5 md:p-14 min-h-[300px] md:min-h-[380px] relative">
        <AnimatePresence>{renderFeedback()}</AnimatePresence>
        <h3 className="text-2xl md:text-4xl font-bold mb-8 md:mb-10 text-center leading-relaxed" dir="rtl" style={{ color: IVORY }}>
          {q.question}
        </h3>
        <div className="flex gap-4 md:gap-6 w-full max-w-sm md:max-w-none justify-center">
          {[
            { label: 'صحيح', correct: q.answer === true, accent: GREEN },
            { label: 'غلط', correct: q.answer === false, accent: CRIMSON },
          ].map(({ label, correct, accent }) => (
            <button key={label} onClick={() => handleAnswer(correct)} disabled={showFeedback !== null}
              className="flex-1 md:flex-none px-6 py-4 md:px-12 md:py-5 rounded-2xl text-2xl md:text-3xl font-bold nm-raised nm-press transition-all disabled:opacity-50"
              style={{ background: BG_LIGHT, color: accent, boxShadow: `6px 6px 16px rgba(0,0,0,0.6), -3px -3px 10px rgba(255,255,255,0.04), 0 0 16px ${accent}22`, border: `1px solid ${accent}33` }}>
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
      <div className="flex flex-col items-center justify-center p-5 md:p-14 min-h-[300px] md:min-h-[380px] relative">
        <AnimatePresence>{renderFeedback()}</AnimatePresence>
        <h3 className="text-xl md:text-4xl font-bold mb-6 md:mb-10 text-center leading-relaxed" dir="rtl" style={{ color: IVORY }}>
          {q.question.split('______').map((part, i, arr) => (
            <span key={i}>
              {part}
              {i < arr.length - 1 && (
                <span className="inline-block w-16 md:w-28 border-b-4 mx-2 md:mx-3 align-middle" style={{ borderColor: GOLD }} />
              )}
            </span>
          ))}
        </h3>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:gap-4 w-full max-w-3xl">
          {q.options.map((opt, idx) => (
            <button key={idx} onClick={() => handleAnswer(opt === q.answer)} disabled={showFeedback !== null}
              className="px-5 py-4 md:px-8 md:py-5 rounded-2xl text-xl md:text-2xl font-bold nm-raised nm-press transition-all disabled:opacity-50"
              style={{ background: BG_LIGHT, color: GOLD, boxShadow: `6px 6px 16px rgba(0,0,0,0.6), -3px -3px 10px rgba(255,255,255,0.04), 0 0 12px rgba(212,160,23,0.1)`, border: `1px solid rgba(212,160,23,0.2)` }}>
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
      <div className="flex flex-col items-center justify-center p-6 md:p-14 min-h-[300px] md:min-h-[380px]">
        <Trophy className="w-20 h-20 md:w-32 md:h-32 mb-4 md:mb-6" style={{ color: pct >= 80 ? GOLD : `${IVORY}30` }} />
        <h2 className="text-3xl md:text-5xl font-bold mb-3" dir="rtl" style={{ color: IVORY }}>توهان جو اسڪور</h2>
        <div className="text-5xl md:text-7xl font-black mb-4 gold-shimmer">{score} / {total * 10}</div>
        <p className="text-xl md:text-2xl opacity-60 mb-8 font-bold" dir="rtl" style={{ color: IVORY }}>
          {pct >= 80 ? '🎉 بهترين ڪارڪردگي!' : '💪 وڌيڪ محنت جي ضرورت آهي'}
        </p>
        <button onClick={onComplete}
          className="px-8 py-4 md:px-12 md:py-5 rounded-full text-2xl md:text-3xl font-bold flex items-center gap-3 nm-press"
          style={{ background: `linear-gradient(135deg, ${GOLD}, ${GOLD_BRIGHT})`, color: BG, boxShadow: `0 0 24px rgba(212,160,23,0.4)` }}
          dir="rtl">
          مڪمل ڪريو <ArrowRight className="w-6 h-6 md:w-7 md:h-7" />
        </button>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] w-full max-w-5xl mx-auto p-4 relative">
      <div className="w-full rounded-3xl overflow-hidden" style={cardStyle}>
        {/* Header */}
        <div className="p-4 md:p-6 flex justify-between items-center border-b" style={{ borderColor: `${GOLD}22`, background: BG }}>
          <h2 className="text-lg md:text-2xl font-bold" style={{ color: GOLD }}>
            {currentSection === 'tf' ? '✅ صحيح يا غلط' : currentSection === 'fib' ? '✏️ خالي جايون ڀريو' : '🏆 نتيجو'}
          </h2>
          {currentSection !== 'result' && (
            <div className="text-base md:text-xl font-bold px-4 py-2 rounded-full nm-press"
              style={{ background: `linear-gradient(135deg, ${GOLD}, ${GOLD_BRIGHT})`, color: BG }}>
              اسڪور: {score}
            </div>
          )}
        </div>

        {/* Content */}
        <div style={{ boxShadow: 'inset 3px 3px 10px rgba(0,0,0,0.4), inset -2px -2px 6px rgba(255,255,255,0.02)' }}>
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

        {/* Progress */}
        {currentSection !== 'result' && (
          <div className="p-4 text-center text-lg opacity-40 font-bold border-t" style={{ borderColor: `${GOLD}22`, background: BG, color: IVORY }}>
            سوال {currentIndex + 1} مان {currentSection === 'tf' ? tfQuestions.length : fibQuestions.length}
          </div>
        )}
      </div>
    </div>
  );
}
