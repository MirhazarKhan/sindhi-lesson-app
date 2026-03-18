'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Volume2, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import { playSindhiAudio } from '../utils/audioPlayer';

interface VocabItem { word: string; letters: string[]; }
interface LetterItem { id: string; letter: string; }

const BG = '#0E0B16';
const BG_LIGHT = '#1A1528';
const GOLD = '#D4A017';
const GOLD_BRIGHT = '#F5C842';
const IVORY = '#F0E6D3';
const GREEN = '#2DC653';
const CRIMSON = '#C1121F';

export default function WordBreaker({ data, onComplete }: { data: VocabItem[], onComplete: () => void }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [pool, setPool] = useState<LetterItem[]>([]);
  const [slots, setSlots] = useState<(LetterItem | null)[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const isDraggingRef = useRef(false);
  const slotRefs = useRef<(HTMLDivElement | null)[]>([]);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentItem = data[currentIndex];

  useEffect(() => {
    const letterObjects = currentItem.letters.map((letter, index) => ({ id: `${currentIndex}-${index}-${letter}`, letter }));
    let shuffled = [...letterObjects].sort(() => Math.random() - 0.5);
    if (letterObjects.length > 1) {
      while (shuffled.map(i => i.letter).join('') === currentItem.letters.join(''))
        shuffled = [...letterObjects].sort(() => Math.random() - 0.5);
    }
    setPool(shuffled);
    setSlots(new Array(currentItem.letters.length).fill(null));
    setIsCompleted(false);
    slotRefs.current = new Array(currentItem.letters.length).fill(null);
  }, [currentIndex, currentItem]);

  useEffect(() => {
    if (slots.every(s => s !== null)) {
      if (slots.map(s => s!.letter).join('') === currentItem.letters.join('')) {
        setIsCompleted(true);
        setTimeout(() => playSindhiAudio(currentItem.word), 500);
      }
    }
  }, [slots, currentItem]);

  const handleHoverPlay = (text: string) => {
    if (isDraggingRef.current) return;
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => { if (!isDraggingRef.current) playSindhiAudio(text); }, 80);
  };

  const handleDragStart = () => { isDraggingRef.current = true; if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current); };

  const handleDragEnd = (_e: any, info: any, item: LetterItem) => {
    isDraggingRef.current = false;
    const dropPoint = { x: info.point.x, y: info.point.y };
    let closestSlotIndex = -1; let minDistance = 100;
    slotRefs.current.forEach((slot, index) => {
      if (slot) {
        const rect = slot.getBoundingClientRect();
        const center = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
        const distance = Math.sqrt(Math.pow(center.x - dropPoint.x, 2) + Math.pow(center.y - dropPoint.y, 2));
        if (distance < minDistance) { minDistance = distance; closestSlotIndex = index; }
      }
    });
    if (closestSlotIndex !== -1) {
      const existingItem = slots[closestSlotIndex];
      const newSlots = [...slots]; newSlots[closestSlotIndex] = item; setSlots(newSlots);
      if (existingItem) setPool(prev => [...prev.filter(p => p.id !== item.id), existingItem]);
      else setPool(prev => prev.filter(p => p.id !== item.id));
    }
  };

  const handlePoolItemClick = (item: LetterItem) => {
    const firstEmpty = slots.findIndex(s => s === null);
    if (firstEmpty !== -1) {
      const newSlots = [...slots]; newSlots[firstEmpty] = item; setSlots(newSlots);
      setPool(prev => prev.filter(p => p.id !== item.id));
    }
  };

  const handleSlotItemClick = (item: LetterItem, index: number) => {
    const newSlots = [...slots]; newSlots[index] = null; setSlots(newSlots);
    setPool(prev => [...prev, item]);
  };

  const cardStyle = {
    background: BG_LIGHT,
    boxShadow: '12px 12px 32px rgba(0,0,0,0.7), -6px -6px 18px rgba(255,255,255,0.04)',
    border: `1px solid rgba(212,160,23,0.12)`,
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] w-full max-w-5xl mx-auto p-4" dir="rtl">
      <div className="w-full rounded-3xl overflow-hidden" style={cardStyle}>
        {/* Header */}
        <div className="p-4 md:p-6 flex justify-between items-center border-b" style={{ borderColor: `${GOLD}22`, background: BG }}>
          <h2 className="text-lg md:text-2xl font-bold" style={{ color: GOLD }}>لفظ ٺاهيو</h2>
          <div className="flex items-center gap-2">
            <button onClick={() => playSindhiAudio(currentItem.word)}
              className="flex items-center gap-1.5 px-4 py-2 md:px-6 md:py-3 rounded-full font-bold text-sm md:text-lg nm-press"
              style={{ background: `linear-gradient(135deg, ${GOLD}, ${GOLD_BRIGHT})`, color: BG }}>
              <Volume2 className="w-4 h-4 md:w-5 md:h-5" />
              <span className="hidden sm:inline">آواز ٻڌو</span>
            </button>
            <div className="text-sm md:text-lg font-bold px-3 py-1.5 rounded-full nm-raised"
              style={{ background: BG_LIGHT, color: GOLD }}>
              {currentIndex + 1}/{data.length}
            </div>
          </div>
        </div>

        {/* Interactive area */}
        <div className="p-4 md:p-12 flex flex-col items-center justify-center min-h-[340px] md:min-h-[420px]"
          style={{ boxShadow: 'inset 3px 3px 10px rgba(0,0,0,0.4), inset -2px -2px 6px rgba(255,255,255,0.02)' }}>
          <AnimatePresence mode="wait">
            {isCompleted ? (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }} className="flex flex-col items-center gap-5">
                <div className="text-6xl md:text-9xl font-bold" style={{ color: GOLD }}>{currentItem.word}</div>
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 text-xl md:text-2xl font-bold px-6 py-3 rounded-full"
                  style={{ color: GREEN, background: 'rgba(45,198,83,0.1)', border: '1px solid rgba(45,198,83,0.3)' }}>
                  <CheckCircle2 className="w-6 h-6 md:w-8 md:h-8" />بهترين!
                </motion.div>
              </motion.div>
            ) : (
              <motion.div key="scrambled" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex flex-col items-center w-full">
                {/* Slots — inset wells */}
                <div className="flex flex-row flex-wrap items-center justify-center gap-2 md:gap-5 mb-6 md:mb-10">
                  {slots.map((slotItem, index) => (
                    <div key={`slot-${index}`}
                      ref={el => { if (el) slotRefs.current[index] = el; }}
                      className="rounded-2xl flex items-center justify-center"
                      style={{ width: 64, height: 80, background: BG, boxShadow: 'inset 4px 4px 10px rgba(0,0,0,0.6), inset -3px -3px 7px rgba(255,255,255,0.03)', border: `1px dashed rgba(212,160,23,0.2)` }}>
                      {slotItem && (
                        <motion.div layoutId={slotItem.id}
                          onClick={() => handleSlotItemClick(slotItem, index)}
                          onMouseEnter={() => handleHoverPlay(slotItem.letter)}
                          className="w-full h-full text-3xl md:text-5xl font-bold rounded-2xl flex items-center justify-center cursor-pointer nm-raised"
                          style={{ background: BG_LIGHT, color: GOLD, border: `1px solid rgba(212,160,23,0.3)` }}>
                          {slotItem.letter}
                        </motion.div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Pool — raised tiles */}
                <div className="flex flex-row flex-wrap items-center justify-center gap-2 md:gap-5 min-h-[90px] md:min-h-[140px]">
                  {pool.map((item) => (
                    <motion.div key={item.id} layoutId={item.id}
                      drag dragSnapToOrigin
                      onDragStart={handleDragStart}
                      onDragEnd={(e, info) => handleDragEnd(e, info, item)}
                      onClick={() => handlePoolItemClick(item)}
                      onMouseEnter={() => handleHoverPlay(item.letter)}
                      whileDrag={{ scale: 1.12, zIndex: 50 }}
                      className="text-3xl md:text-5xl font-bold rounded-2xl flex items-center justify-center cursor-grab active:cursor-grabbing nm-press"
                      style={{ width: 64, height: 80, background: BG_LIGHT, color: IVORY, boxShadow: `6px 6px 16px rgba(0,0,0,0.6), -3px -3px 10px rgba(255,255,255,0.04), 0 0 12px ${CRIMSON}22`, border: `1px solid rgba(193,18,31,0.25)` }}>
                      {item.letter}
                    </motion.div>
                  ))}
                </div>

                <p className="opacity-30 text-sm md:text-lg font-bold animate-pulse mt-5 text-center px-4" style={{ color: IVORY }}>
                  اکرن کي ڇڪي خالي جاين تي رکو (يا ڪلڪ ڪريو)
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="p-4 md:p-6 flex justify-between items-center border-t" style={{ borderColor: `${GOLD}22`, background: BG }}>
          <button onClick={() => { if (currentIndex < data.length - 1) setCurrentIndex(p => p + 1); else onComplete(); }}
            disabled={!isCompleted && currentIndex !== data.length - 1}
            className="flex items-center gap-2 px-5 py-3 md:px-8 md:py-4 rounded-full font-bold text-lg md:text-xl nm-press transition-all"
            style={!isCompleted && currentIndex !== data.length - 1
              ? { color: 'rgba(240,230,211,0.2)', background: BG_LIGHT, cursor: 'not-allowed', opacity: 0.4 }
              : { background: `linear-gradient(135deg, ${GOLD}, ${GOLD_BRIGHT})`, color: BG, boxShadow: `0 0 18px rgba(212,160,23,0.35)` }
            }>
            {currentIndex === data.length - 1 ? 'مڪمل' : 'اڳيون'}
            <ArrowLeft className="w-5 h-5" />
          </button>
          <button onClick={() => { if (currentIndex > 0) setCurrentIndex(p => p - 1); }}
            disabled={currentIndex === 0}
            className="flex items-center gap-2 px-5 py-3 md:px-8 md:py-4 rounded-full font-bold text-lg md:text-xl nm-raised nm-press transition-all"
            style={currentIndex === 0
              ? { color: 'rgba(240,230,211,0.2)', background: BG_LIGHT, cursor: 'not-allowed', opacity: 0.4 }
              : { background: BG_LIGHT, color: GOLD }
            }>
            <ArrowRight className="w-5 h-5" />پوئتي
          </button>
        </div>
      </div>
    </div>
  );
}
