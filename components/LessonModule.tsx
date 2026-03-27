'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, BookOpen } from 'lucide-react';
import lessonData from '../data/lesson.json';
import IntroSlides from './IntroSlides';
import VocabularyGame from './VocabularyGame';
import WordBreaker from './WordBreaker';
import QuizSection from './QuizSection';

const BookLayout = dynamic(() => import('./BookLayout'), { ssr: false });
const ShrineViewer = dynamic(() => import('./ShrineViewer'), { ssr: false });

const NEON_PINK = '#FF0055';
const GOLD = '#D4A017';
const TEAL = '#0891B2';
const TEAL_DARK = '#0e7490';
const ORANGE = '#f97316';
const TEXT = '#1e293b';
const TEXT_MUTED = '#475569';

// ── Chapter labels for the tab bar ───────────────────────────────────────────
const CHAPTERS = [
  { label: 'سرورق', en: 'Cover' },
  { label: 'تعارف', en: 'Intro' },
  { label: 'لفظ', en: 'Vocab' },
  { label: 'مشق', en: 'Quiz' },
  { label: 'مزار', en: 'Shrine' },
];

// ── Cover spread ─────────────────────────────────────────────────────────────
function CoverLeft() {
  return (
    <div className="flex flex-col justify-center h-full p-8" dir="rtl">
      <p className="text-sm uppercase tracking-widest mb-6 font-bold" style={{ color: TEXT_MUTED }}>
        Sindhi Digital Textbook
      </p>
      <h1 className="text-5xl font-black leading-tight mb-3" style={{ color: TEXT }}>
        شاهه عبداللطيف
      </h1>
      <h2 className="text-4xl font-black mb-6" style={{ color: TEAL }}>
        ڀٽائي
      </h2>
      <div className="w-16 h-1 rounded mb-6" style={{ background: TEAL }} />
      <p className="text-xl leading-relaxed" style={{ color: TEXT_MUTED }}>
        سنڌ جو عظيم صوفي شاعر — هن ڪتاب ۾ سندس زندگي، شاعري ۽ مزار بابت سکو.
      </p>
      <div className="mt-8 space-y-3">
        {CHAPTERS.slice(1).map((c, i) => (
          <div key={i} className="flex items-center gap-3 text-lg" style={{ color: TEXT_MUTED }}>
            <span className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold text-white"
              style={{ background: TEAL }}>{i + 1}</span>
            {c.label}
          </div>
        ))}
      </div>
    </div>
  );
}

function CoverRight() {
  return (
    <div className="flex flex-col items-center justify-center h-full p-6 gap-6"
      style={{ background: 'linear-gradient(160deg, #f0f9ff 0%, #e0f2fe 100%)' }}>
      <div className="w-72 h-72 rounded-full overflow-hidden"
        style={{ maskImage: 'radial-gradient(circle, black 55%, transparent 80%)', WebkitMaskImage: 'radial-gradient(circle, black 55%, transparent 80%)' }}>
        <img src="/ShahAbdulLatifcom.jpg" alt="Shah Abdul Latif Bhittai"
          className="w-full h-full object-cover" />
      </div>
      <div className="text-center" dir="rtl">
        <p className="text-2xl font-bold mb-1" style={{ color: TEXT }}>1689ع — 1752ع</p>
        <p className="text-lg" style={{ color: TEXT_MUTED }}>ڀٽ شاهه، سنڌ، پاڪستان</p>
      </div>
      <blockquote className="text-center text-xl italic leading-relaxed max-w-xs px-4"
        dir="rtl" style={{ color: TEXT_MUTED, borderRight: `4px solid ${TEAL}`, paddingRight: 14 }}>
        ڪانه پُڇي ٿو ذاتِ، جيڪي آيا سي اَگهيا
      </blockquote>
    </div>
  );
}

// ── Intro spread ─────────────────────────────────────────────────────────────
function IntroRight() {
  return (
    <div className="flex flex-col justify-center h-full p-8" dir="rtl"
      style={{ background: 'linear-gradient(160deg, #f0fdf4 0%, #dcfce7 100%)' }}>
      <h3 className="text-3xl font-black mb-4" style={{ color: '#15803d' }}>شاهه جو رسالو</h3>
      <div className="w-10 h-1 rounded mb-5" style={{ background: '#16a34a' }} />
      <p className="text-xl leading-relaxed mb-6" style={{ color: TEXT }}>
        شاهه صاحب جي شاعري جو مجموعو <strong>"شاهه جو رسالو"</strong> سنڌي ادب جو سڀ کان وڏو خزانو آهي.
        ان ۾ 30 سُر آهن، جن ۾ محبت، قرباني، ۽ روحانيت جا سبق آهن.
      </p>
      <div className="rounded-2xl p-5 shadow-sm" style={{ background: '#fff', border: `2px solid #86efac` }}>
        <p className="text-sm uppercase tracking-widest mb-2 font-bold" style={{ color: '#16a34a' }}>
          مشهور شعر
        </p>
        <p className="text-xl italic font-bold leading-relaxed" style={{ color: TEXT }}>
          "جيڪي پيا پرين سان، تن کي پيا پرين ملن"
        </p>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-3">
        {[['30', 'سُر'], ['600+', 'بيت'], ['1689', 'پيدائش'], ['1752', 'وفات']].map(([val, lbl]) => (
          <div key={lbl} className="rounded-xl p-4 text-center shadow-sm" style={{ background: '#fff', border: `2px solid #bbf7d0` }}>
            <div className="text-3xl font-black" style={{ color: '#16a34a' }}>{val}</div>
            <div className="text-base mt-1" style={{ color: TEXT_MUTED }}>{lbl}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Quiz spread wrapper ───────────────────────────────────────────────────────
function QuizLeft({ onComplete }: { onComplete: () => void }) {
  return (
    <div className="h-full overflow-y-auto custom-scrollbar">
      <QuizSection data={lessonData.quiz} onComplete={onComplete} />
    </div>
  );
}

// ── Shrine spread ─────────────────────────────────────────────────────────────
function ShrineLeft() {
  const points = [
    ['مزار جو نالو', 'ڀٽ شاهه مزار'],
    ['مقام', 'ڀٽ شاهه، سنڌ'],
    ['تعمير', '18هين صدي'],
    ['اهميت', 'سنڌ جو روحاني مرڪز'],
  ];
  return (
    <div className="flex flex-col justify-center h-full p-8" dir="rtl"
      style={{ background: 'linear-gradient(160deg, #fefce8 0%, #fef9c3 100%)' }}>
      <h3 className="text-3xl font-black mb-2" style={{ color: '#92400e' }}>ڀٽ شاهه مزار</h3>
      <div className="w-10 h-1 rounded mb-5" style={{ background: '#d97706' }} />
      <p className="text-xl leading-relaxed mb-6" style={{ color: TEXT }}>
        هي مزار سنڌ جي عظيم صوفي شاعر شاهه عبداللطيف ڀٽائي جو آرامگاهه آهي.
        هر سال هزارين عقيدتمند هتي حاضري ڀرين ٿا.
      </p>
      <div className="space-y-3">
        {points.map(([label, value]) => (
          <div key={label} className="flex justify-between items-center py-3 border-b"
            style={{ borderColor: '#fde68a' }}>
            <span className="text-base font-bold" style={{ color: TEXT_MUTED }}>{label}</span>
            <span className="text-lg font-bold" style={{ color: TEXT }}>{value}</span>
          </div>
        ))}
      </div>
      <p className="mt-6 text-base" style={{ color: TEXT_MUTED }}>
        ساڄي پاسي 3D ماڊل کي ڇڪيو ۽ ويجهو ڪريو
      </p>
    </div>
  );
}

// ── Main LessonModule ─────────────────────────────────────────────────────────
export default function LessonModule() {
  const [started, setStarted] = useState(false);
  const [spread, setSpread] = useState(0);

  const totalSpreads = CHAPTERS.length; // 0–4

  const goNext = () => setSpread(p => Math.min(totalSpreads - 1, p + 1));
  const goPrev = () => setSpread(p => Math.max(0, p - 1));

  // Build left/right page content per spread
  const getPages = () => {
    switch (spread) {
      case 0:
        return { left: <CoverLeft />, right: <CoverRight /> };
      case 1:
        return {
          left: (
            <div className="h-full overflow-y-auto custom-scrollbar">
              <IntroSlides data={lessonData.introSlides} onComplete={goNext} />
            </div>
          ),
          right: <IntroRight />,
        };
      case 2:
        return {
          left: (
            <div className="h-full overflow-y-auto custom-scrollbar">
              <VocabularyGame data={lessonData.vocabularyGame} onComplete={goNext} />
            </div>
          ),
          right: (
            <div className="h-full overflow-y-auto custom-scrollbar">
              <WordBreaker data={lessonData.vocabularyGame} onComplete={goNext} />
            </div>
          ),
        };
      case 3:
        return {
          left: <QuizLeft onComplete={goNext} />,
          right: (
            <div className="flex flex-col items-center justify-center h-full p-8" dir="rtl"
              style={{ background: 'linear-gradient(160deg, #f0f9ff 0%, #e0f2fe 100%)' }}>
              <div className="text-7xl mb-4">🏆</div>
              <h3 className="text-3xl font-black mb-3" style={{ color: TEAL }}>مشق</h3>
              <p className="text-xl text-center leading-relaxed" style={{ color: TEXT_MUTED }}>
                کاٻي پاسي سوالن جا جواب ڏيو. صحيح جواب لاءِ پوائنٽ ملندا.
              </p>
              <div className="mt-8 w-full rounded-2xl p-5 shadow-sm" style={{ background: '#fff', border: `2px solid #bae6fd` }}>
                <p className="text-sm font-bold mb-3" style={{ color: TEXT_MUTED }}>سيڪشن</p>
                <p className="text-xl font-bold mb-2" style={{ color: TEXT }}>✅ صحيح يا غلط</p>
                <p className="text-xl font-bold" style={{ color: TEXT }}>✏️ خالي جايون ڀريو</p>
              </div>
            </div>
          ),
        };
      case 4:
        return {
          left: <ShrineLeft />,
          right: (
            <div className="h-full">
              <ShrineViewer onComplete={goNext} />
            </div>
          ),
        };
      default:
        return { left: null, right: null };
    }
  };

  const { left, right } = getPages();

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #e0f2fe 0%, #bae6fd 100%)' }}>

      {/* ── Splash ── */}
      <AnimatePresence>
        {!started && (
          <motion.div key="splash"
            className="fixed inset-0 z-50 flex flex-col items-center justify-center"
            style={{ background: 'linear-gradient(160deg, #0ea5e9 0%, #0891b2 50%, #0e7490 100%)' }}
            exit={{ opacity: 0, scale: 1.06 }}
            transition={{ duration: 0.55 }}>
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute rounded-full blur-[120px] opacity-30"
                style={{ width: 500, height: 400, top: '-10%', right: '-5%', background: '#7dd3fc' }} />
              <div className="absolute rounded-full blur-[100px] opacity-20"
                style={{ width: 400, height: 300, bottom: '-5%', left: '-5%', background: '#bae6fd' }} />
            </div>
            <motion.div initial={{ opacity: 0, y: -24 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }} className="text-center mb-10" dir="rtl">
              <h1 className="font-black leading-none mb-2 drop-shadow-lg"
                style={{ fontSize: 'clamp(2.8rem,11vw,5.5rem)', color: '#ffffff' }}>
                شاهه عبداللطيف
              </h1>
              <h2 className="font-black drop-shadow-lg"
                style={{ fontSize: 'clamp(1.8rem,7vw,3.5rem)', color: '#fef9c3' }}>
                ڀٽائي
              </h2>
              <p className="mt-4 text-xl font-medium" style={{ color: 'rgba(255,255,255,0.75)' }}>
                سنڌ جو عظيم صوفي شاعر
              </p>
            </motion.div>
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.35, type: 'spring', bounce: 0.4 }}
              whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.93 }}
              onClick={() => setStarted(true)}
              className="flex items-center gap-3 px-10 py-5 rounded-full font-black text-2xl shadow-2xl"
              style={{ background: '#ffffff', color: TEAL }}>
              <BookOpen className="w-6 h-6" />
              ڪتاب کوليو
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Book ── */}
      {started && (
        <div className="relative w-full h-screen flex flex-col">
          {/* Chapter tabs */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3">
            {CHAPTERS.map((c, i) => (
              <button key={i} onClick={() => setSpread(i)}
                className="px-5 py-2 rounded-full text-lg font-black tracking-wide transition-all duration-200 shadow-sm"
                style={{
                  background: spread === i ? TEAL : 'rgba(255,255,255,0.85)',
                  color: spread === i ? '#fff' : TEXT_MUTED,
                  border: `2px solid ${spread === i ? TEAL : 'transparent'}`,
                  transform: spread === i ? 'scale(1.08)' : 'scale(1)',
                }}>
                {c.label}
              </button>
            ))}
          </div>

          {/* BookLayout fills remaining space */}
          <div className="flex-1 pt-12 flex flex-col min-h-0">
            <BookLayout
              leftPage={left}
              rightPage={right}
              onNext={goNext}
              onPrev={goPrev}
              canNext={spread < totalSpreads - 1}
              canPrev={spread > 0}
              pageLabel={`${spread + 1} / ${totalSpreads}`}
              accentColor={TEAL}
              title="شاهه عبداللطيف ڀٽائي"
            />
          </div>
        </div>
      )}
    </div>
  );
}
