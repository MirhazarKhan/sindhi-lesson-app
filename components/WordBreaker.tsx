'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Volume2, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import { playSindhiAudio } from '../utils/audioPlayer';

interface VocabItem { word: string; letters: string[]; }
interface LetterItem { id: string; letter: string; }

const TEAL = '#0891B2';
const TEAL_DARK = '#0e7490';
const ORANGE = '#f97316';
const TEXT_MUTED = '#475569';
const GREEN = '#16a34a';
const PURPLE = '#7c3aed';
const BG_HEADER = '#e0f2fe';

export default function WordBreaker({ data, onComplete }: { data: VocabItem[], onComplete: () => void }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [pool, setPool] = useState<LetterItem[]>([]);
  const [slots, setSlots] = useState<(LetterItem | null)[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const isDraggingRef = useRef(false);
  const slotRefs = useRef<(HTMLDivElement | null)[]>([]);
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

  return (
    <div className="flex flex-col w-full h-full" dir="rtl">
      <div className="px-4 py-3 flex justify-between items-center border-b shrink-0"
        style={{ borderColor: '#bae6fd', background: BG_HEADER }}>
        <h2 className="text-2xl font-bold" style={{ color: TEAL }}>لفظ ٺاهيو</h2>
        <div className="flex items-center gap-2">
          <button onClick={() => playSindhiAudio(currentItem.word)}
            className="flex items-center gap-2 px-4 py-2 rounded-full font-bold text-xl shadow hover:scale-105 active:scale-95 transition-all"
            style={{ background: `linear-gradient(135deg, ${TEAL}, ${TEAL_DARK})`, color: '#fff' }}>
            <Volume2 className="w-5 h-5" />آواز ٻڌو
          </button>
          <div className="text-xl font-bold px-3 py-1.5 rounded-full shadow"
            style={{ background: '#fff', color: TEAL, border: `2px solid ${TEAL}33` }}>
            {currentIndex + 1}/{data.length}
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4" style={{ background: '#fff' }}>
        <AnimatePresence mode="wait">
          {isCompleted ? (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }} className="flex flex-col items-center gap-5">
              <div className="text-8xl font-bold" style={{ color: TEAL }}>{currentItem.word}</div>
              <div className="flex items-center gap-2 text-2xl font-bold px-6 py-3 rounded-full"
                style={{ color: GREEN, background: '#dcfce7', border: '2px solid #86efac' }}>
                <CheckCircle2 className="w-7 h-7" />بهترين!
              </div>
            </motion.div>
          ) : (
            <motion.div key="scrambled" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center w-full">
              <div className="flex flex-row flex-wrap items-center justify-center gap-3 mb-6">
                {slots.map((slotItem, index) => (
                  <div key={`slot-${index}`}
                    ref={el => { if (el) slotRefs.current[index] = el; }}
                    className="rounded-2xl flex items-center justify-center"
                    style={{ width: 80, height: 96, background: '#f8fafc', border: `2px dashed #cbd5e1` }}>
                    {slotItem && (
                      <motion.div key={slotItem.id} initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                        onClick={() => { handleSlotItemClick(slotItem, index); playSindhiAudio(slotItem.letter); }}
                        className="w-full h-full text-5xl font-bold rounded-2xl flex items-center justify-center cursor-pointer shadow-md"
                        style={{ background: `linear-gradient(135deg, ${TEAL}, ${TEAL_DARK})`, color: '#fff' }}>
                        {slotItem.letter}
                      </motion.div>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex flex-row flex-wrap items-center justify-center gap-3 min-h-[100px]">
                {pool.map((item) => (
                  <motion.div key={item.id}
                    initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                    drag dragSnapToOrigin
                    onDragStart={() => { isDraggingRef.current = true; }}
                    onDragEnd={(e, info) => handleDragEnd(e, info, item)}
                    onClick={() => { handlePoolItemClick(item); playSindhiAudio(item.letter); }}
                    whileDrag={{ scale: 1.12, zIndex: 50 }}
                    className="text-5xl font-bold rounded-2xl flex items-center justify-center cursor-grab active:cursor-grabbing shadow-lg"
                    style={{ width: 80, height: 96, background: `linear-gradient(135deg, ${PURPLE}, #6d28d9)`, color: '#fff' }}>
                    {item.letter}
                  </motion.div>
                ))}
              </div>
              <p className="text-lg font-bold animate-pulse mt-4 text-center" style={{ color: TEXT_MUTED }}>
                اکرن کي ڇڪي خالي جاين تي رکو (يا ڪلڪ ڪريو)
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="px-4 py-3 flex justify-between items-center border-t shrink-0"
        style={{ borderColor: '#bae6fd', background: BG_HEADER }}>
        <button onClick={() => { if (currentIndex < data.length - 1) setCurrentIndex(p => p + 1); else onComplete(); }}
          disabled={!isCompleted}
          className="flex items-center gap-2 px-6 py-3 rounded-full font-bold text-xl transition-all hover:scale-105 active:scale-95 shadow disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: `linear-gradient(135deg, ${ORANGE}, #ea580c)`, color: '#fff' }}>
          {currentIndex === data.length - 1 ? 'مڪمل' : 'اڳيون'}
          <ArrowLeft className="w-5 h-5" />
        </button>
        <button onClick={() => { if (currentIndex > 0) setCurrentIndex(p => p - 1); }}
          disabled={currentIndex === 0}
          className="flex items-center gap-2 px-6 py-3 rounded-full font-bold text-xl transition-all hover:scale-105 active:scale-95 shadow disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: '#fff', color: TEAL, border: `2px solid ${TEAL}44` }}>
          <ArrowRight className="w-5 h-5" />پوئتي
        </button>
      </div>
    </div>
  );
}
