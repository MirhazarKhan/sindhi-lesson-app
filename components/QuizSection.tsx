'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, XCircle, Trophy, ArrowRight } from 'lucide-react';

interface TrueFalseQuestion {
  question: string;
  answer: boolean;
}

interface FillInTheBlankQuestion {
  question: string;
  options: string[];
  answer: string;
}

interface QuizData {
  trueFalse: TrueFalseQuestion[];
  fillInTheBlanks: FillInTheBlankQuestion[];
}

export default function QuizSection({ data, onComplete }: { data: QuizData, onComplete: () => void }) {
  const [currentSection, setCurrentSection] = useState<'tf' | 'fib' | 'result'>('tf');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showFeedback, setShowFeedback] = useState<boolean | null>(null);

  const tfQuestions = data.trueFalse;
  const fibQuestions = data.fillInTheBlanks;

  const handleSectionChange = (section: 'tf' | 'fib' | 'result') => {
    setCurrentSection(section);
  };

  const handleAnswer = (isCorrect: boolean) => {
    setShowFeedback(isCorrect);
    if (isCorrect) setScore(prev => prev + 10);

    setTimeout(() => {
      setShowFeedback(null);
      if (currentSection === 'tf') {
        if (currentIndex < tfQuestions.length - 1) {
          setCurrentIndex(prev => prev + 1);
        } else {
          handleSectionChange('fib');
        }
      } else if (currentSection === 'fib') {
        if (currentIndex < fibQuestions.length - 1) {
          setCurrentIndex(prev => prev + 1);
        } else {
          handleSectionChange('result');
        }
      }
    }, 1500);
  };

  const renderFeedback = () => {
    if (showFeedback === null) return null;
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }}
        className="absolute inset-0 flex items-center justify-center z-10 rounded-3xl"
        style={{ background: showFeedback ? 'rgba(13,115,119,0.92)' : 'rgba(193,18,31,0.92)' }}
      >
        <div className="flex flex-col items-center gap-4">
          {showFeedback
            ? <CheckCircle2 className="w-32 h-32 text-[#FFB703]" />
            : <XCircle className="w-32 h-32 text-white" />}
          <h2 className="text-5xl font-bold text-white">{showFeedback ? 'صحيح جواب!' : 'غلط جواب'}</h2>
        </div>
      </motion.div>
    );
  };

  const renderTF = () => {
    const q = tfQuestions[currentIndex];
    return (
      <div className="flex flex-col items-center justify-center p-5 md:p-16 min-h-[320px] md:min-h-[400px] relative">
        <AnimatePresence>{renderFeedback()}</AnimatePresence>
        <h3 className="text-2xl md:text-5xl font-bold text-[#FFF8EE] mb-8 md:mb-12 text-center leading-relaxed" dir="rtl">
          {q.question}
        </h3>
        <div className="flex gap-4 md:gap-8 w-full max-w-sm md:max-w-none justify-center">
          <button onClick={() => handleAnswer(q.answer === true)} disabled={showFeedback !== null}
            className="flex-1 md:flex-none px-6 py-4 md:px-12 md:py-6 rounded-2xl text-2xl md:text-4xl font-bold transition-all active:scale-95 disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg,#1B4332,#0D7377)', border: '2px solid rgba(45,198,83,0.5)', color: '#2DC653' }}>
            صحيح
          </button>
          <button onClick={() => handleAnswer(q.answer === false)} disabled={showFeedback !== null}
            className="flex-1 md:flex-none px-6 py-4 md:px-12 md:py-6 rounded-2xl text-2xl md:text-4xl font-bold transition-all active:scale-95 disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg,#6A0572,#C1121F)', border: '2px solid rgba(193,18,31,0.5)', color: '#FFB703' }}>
            غلط
          </button>
        </div>
      </div>
    );
  };

  const renderFIB = () => {
    const q = fibQuestions[currentIndex];
    return (
      <div className="flex flex-col items-center justify-center p-5 md:p-16 min-h-[320px] md:min-h-[400px] relative">
        <AnimatePresence>{renderFeedback()}</AnimatePresence>
        <h3 className="text-xl md:text-5xl font-bold text-[#FFF8EE] mb-6 md:mb-12 text-center leading-relaxed" dir="rtl">
          {q.question.split('______').map((part, i, arr) => (
            <span key={i}>
              {part}
              {i < arr.length - 1 && (
                <span className="inline-block w-16 md:w-32 border-b-4 border-[#FFB703] mx-2 md:mx-4 align-middle" />
              )}
            </span>
          ))}
        </h3>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:gap-6 w-full max-w-3xl">
          {q.options.map((opt, idx) => (
            <button key={idx} onClick={() => handleAnswer(opt === q.answer)} disabled={showFeedback !== null}
              className="px-5 py-4 md:px-8 md:py-6 rounded-2xl text-xl md:text-3xl font-bold transition-all active:scale-95 disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg,rgba(13,115,119,0.3),rgba(20,33,61,0.5))', border: '2px solid rgba(255,183,3,0.4)', color: '#FFB703' }}>
              {opt}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderResult = () => {
    const totalQuestions = tfQuestions.length + fibQuestions.length;
    const maxScore = totalQuestions * 10;
    const percentage = (score / maxScore) * 100;

    return (
      <div className="flex flex-col items-center justify-center p-6 md:p-16 min-h-[320px] md:min-h-[400px]">
        <Trophy className={`w-24 h-24 md:w-48 md:h-48 mb-4 md:mb-8 ${percentage >= 80 ? 'text-[#FFB703]' : 'text-white/30'}`} />
        <h2 className="text-3xl md:text-6xl font-bold text-[#FFF8EE] mb-3 md:mb-4" dir="rtl">توهان جو اسڪور</h2>
        <div className="text-5xl md:text-8xl font-black mb-4 md:mb-8 gold-shimmer">{score} / {maxScore}</div>
        <p className="text-xl md:text-3xl text-white/60 mb-8 md:mb-12 font-bold" dir="rtl">
          {percentage >= 80 ? '🎉 بهترين ڪارڪردگي!' : '💪 وڌيڪ محنت جي ضرورت آهي'}
        </p>
        <button onClick={onComplete}
          className="px-8 py-4 md:px-12 md:py-6 rounded-full text-2xl md:text-4xl font-bold text-[#14213D] flex items-center gap-3 shadow-[0_0_30px_rgba(255,183,3,0.4)] active:scale-95 transition-transform"
          style={{ background: 'linear-gradient(135deg,#FFB703,#F4A261)' }} dir="rtl">
          مڪمل ڪريو <ArrowRight className="w-6 h-6 md:w-8 md:h-8" />
        </button>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] w-full max-w-5xl mx-auto p-4 relative">
      <div className="w-full rounded-3xl overflow-hidden border shadow-[0_0_60px_rgba(13,115,119,0.3)]"
        style={{ background: 'linear-gradient(160deg,#0D1B2A,#0a0a12)', borderColor: 'rgba(255,183,3,0.3)' }}>
        {/* Header */}
        <div className="p-4 md:p-6 flex justify-between items-center border-b"
          style={{ background: 'linear-gradient(90deg,#0D7377,#14213D)', borderColor: 'rgba(255,183,3,0.3)' }}>
          <h2 className="text-lg md:text-3xl font-bold text-[#FFB703]">
            {currentSection === 'tf' ? '✅ صحيح يا غلط' : currentSection === 'fib' ? '✏️ خالي جايون ڀريو' : '🏆 نتيجو'}
          </h2>
          {currentSection !== 'result' && (
            <div className="text-lg md:text-2xl font-bold px-3 py-1.5 md:px-4 md:py-2 rounded-full text-[#14213D]"
              style={{ background: 'linear-gradient(135deg,#FFB703,#F4A261)' }}>
              اسڪور: {score}
            </div>
          )}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${currentSection}-${currentIndex}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            {currentSection === 'tf' && renderTF()}
            {currentSection === 'fib' && renderFIB()}
            {currentSection === 'result' && renderResult()}
          </motion.div>
        </AnimatePresence>

        {/* Progress */}
        {currentSection !== 'result' && (
          <div className="p-4 text-center text-xl text-white/50 font-bold border-t"
            style={{ background: 'rgba(13,115,119,0.15)', borderColor: 'rgba(255,183,3,0.2)' }}>
            سوال {currentIndex + 1} مان {currentSection === 'tf' ? tfQuestions.length : fibQuestions.length}
          </div>
        )}
      </div>
    </div>
  );
}
