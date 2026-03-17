'use client';

import { motion } from 'motion/react';
import { Check } from 'lucide-react';

interface Slide {
  id: number;
  text: string;
}

export default function IntroSlides({ data, onComplete }: { data: Slide[], onComplete: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] w-full max-w-5xl mx-auto p-4">
      <div className="w-full rounded-3xl overflow-hidden border flex flex-col shadow-[0_0_60px_rgba(13,115,119,0.3)]"
        style={{ background: 'linear-gradient(160deg,#0D1B2A,#0a0a12)', borderColor: 'rgba(255,183,3,0.3)' }}>
        {/* Header */}
        <div className="p-4 md:p-6 flex items-center gap-3 border-b" style={{ background: 'linear-gradient(90deg,#0D7377,#14213D)', borderColor: 'rgba(255,183,3,0.3)' }}>
          <span className="text-2xl md:text-4xl">📖</span>
          <h2 className="text-2xl md:text-4xl font-bold text-[#FFB703]">تعارف</h2>
        </div>

        {/* Content */}
        <div className="p-5 md:p-14 max-h-[60vh] overflow-y-auto custom-scrollbar">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-6">
            {data.map((paragraph) => (
              <p key={paragraph.id} className="text-xl md:text-3xl lg:text-4xl leading-relaxed font-medium text-justify text-[#FFF8EE]" dir="rtl">
                {paragraph.text}
              </p>
            ))}
          </motion.div>
        </div>

        {/* Controls */}
        <div className="p-4 md:p-6 flex justify-center border-t" style={{ background: 'rgba(13,115,119,0.15)', borderColor: 'rgba(255,183,3,0.2)' }}>
          <button onClick={onComplete}
            className="flex items-center gap-3 px-8 py-3 md:px-12 md:py-4 rounded-full font-bold text-xl md:text-3xl text-[#14213D] shadow-[0_0_30px_rgba(255,183,3,0.4)] active:scale-95 transition-transform"
            style={{ background: 'linear-gradient(135deg,#FFB703,#F4A261)' }}>
            مڪمل <Check className="w-6 h-6 md:w-8 md:h-8" />
          </button>
        </div>
      </div>
    </div>
  );
}
