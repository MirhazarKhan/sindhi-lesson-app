'use client';

import { motion } from 'motion/react';
import { Check } from 'lucide-react';

interface Slide { id: number; text: string; }

const TEAL = '#0891B2';
const TEAL_DARK = '#0e7490';
const TEXT = '#1e293b';
const TEXT_MUTED = '#475569';
const BG_HEADER = '#f0f9ff';

export default function IntroSlides({ data, onComplete }: { data: Slide[], onComplete: () => void }) {
  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-4 flex items-center gap-3 border-b shrink-0"
        style={{ borderColor: '#bae6fd', background: BG_HEADER }}>
        <span className="text-3xl">📖</span>
        <h2 className="text-3xl font-bold" style={{ color: TEAL }}>تعارف</h2>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-5" style={{ background: '#fff' }}>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }} className="space-y-6">
          {data.map((paragraph) => (
            <p key={paragraph.id}
              className="text-2xl font-medium text-justify"
              style={{ color: TEXT, direction: 'rtl', lineHeight: 2.2 }}>
              {paragraph.text}
            </p>
          ))}
        </motion.div>
      </div>

      <div className="px-6 py-4 flex justify-center border-t shrink-0"
        style={{ borderColor: '#bae6fd', background: BG_HEADER }}>
        <button onClick={onComplete}
          className="flex items-center gap-3 px-10 py-4 rounded-full font-bold text-2xl transition-all hover:scale-105 active:scale-95 shadow-lg"
          style={{ background: `linear-gradient(135deg, ${TEAL}, ${TEAL_DARK})`, color: '#fff' }}>
          مڪمل <Check className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
