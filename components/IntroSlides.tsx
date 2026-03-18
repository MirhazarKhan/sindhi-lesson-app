'use client';

import { motion } from 'motion/react';
import { Check } from 'lucide-react';

interface Slide { id: number; text: string; }

const BG = '#0E0B16';
const BG_LIGHT = '#1A1528';
const GOLD = '#D4A017';
const GOLD_BRIGHT = '#F5C842';
const IVORY = '#F0E6D3';

export default function IntroSlides({ data, onComplete }: { data: Slide[], onComplete: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] w-full max-w-4xl mx-auto p-4">
      <div className="w-full rounded-3xl overflow-hidden flex flex-col"
        style={{ background: BG_LIGHT, boxShadow: '12px 12px 32px rgba(0,0,0,0.7), -6px -6px 18px rgba(255,255,255,0.04)', border: `1px solid rgba(212,160,23,0.12)` }}>

        {/* Header */}
        <div className="p-4 md:p-6 flex items-center gap-3 border-b" style={{ borderColor: `${GOLD}22`, background: BG }}>
          <span className="text-2xl md:text-3xl">📖</span>
          <h2 className="text-2xl md:text-3xl font-bold" style={{ color: GOLD }}>تعارف</h2>
        </div>

        {/* Content — inset well */}
        <div className="p-5 md:p-10 max-h-[60vh] overflow-y-auto custom-scrollbar"
          style={{ boxShadow: 'inset 4px 4px 12px rgba(0,0,0,0.5), inset -3px -3px 8px rgba(255,255,255,0.03)' }}>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="space-y-6">
            {data.map((paragraph) => (
              <p key={paragraph.id}
                className="text-xl md:text-3xl leading-relaxed font-medium text-justify"
                style={{ color: IVORY, direction: 'rtl' }}>
                {paragraph.text}
              </p>
            ))}
          </motion.div>
        </div>

        {/* Footer */}
        <div className="p-4 md:p-6 flex justify-center border-t" style={{ borderColor: `${GOLD}22`, background: BG }}>
          <button onClick={onComplete}
            className="flex items-center gap-3 px-8 py-3 md:px-12 md:py-4 rounded-full font-bold text-xl md:text-2xl nm-press transition-all"
            style={{ background: `linear-gradient(135deg, ${GOLD}, ${GOLD_BRIGHT})`, color: BG, boxShadow: `0 0 24px rgba(212,160,23,0.4)` }}>
            مڪمل <Check className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}
