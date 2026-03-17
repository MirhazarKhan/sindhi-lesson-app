'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Volume2, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import { playSindhiAudio } from '../utils/audioPlayer';

interface VocabItem {
  word: string;
  letters: string[];
}

interface LetterItem {
  id: string;
  letter: string;
}

export default function WordBreaker({ data, onComplete }: { data: VocabItem[], onComplete: () => void }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [pool, setPool] = useState<LetterItem[]>([]);
  const [slots, setSlots] = useState<(LetterItem | null)[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const isDraggingRef = useRef(false);
  const slotRefs = useRef<(HTMLDivElement | null)[]>([]);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentItem = data[currentIndex];

  useEffect(() => {
    // Initialize scrambled letters
    const letterObjects = currentItem.letters.map((letter, index) => ({
      id: `${currentIndex}-${index}-${letter}`,
      letter,
    }));

    // Simple shuffle that ensures it's actually scrambled if length > 1
    let shuffled = [...letterObjects].sort(() => Math.random() - 0.5);
    if (letterObjects.length > 1) {
      while (shuffled.map(i => i.letter).join('') === currentItem.letters.join('')) {
        shuffled = [...letterObjects].sort(() => Math.random() - 0.5);
      }
    }

    setPool(shuffled);
    setSlots(new Array(currentItem.letters.length).fill(null));
    setIsCompleted(false);
    slotRefs.current = new Array(currentItem.letters.length).fill(null);
  }, [currentIndex, currentItem]);

  useEffect(() => {
    // Check if the current order matches the word
    if (slots.every(s => s !== null)) {
      const currentWord = slots.map(s => s!.letter).join('');
      if (currentWord === currentItem.letters.join('')) {
        setIsCompleted(true);
        // Automatically read the completed word
        setTimeout(() => {
          playAudio(currentItem.word);
        }, 500);
      }
    }
  }, [slots, currentItem]);

  const playAudio = (text: string) => {
    playSindhiAudio(text);
  };

  const handleNext = () => {
    if (currentIndex < data.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleHoverPlay = (text: string) => {
    if (isDraggingRef.current) return;
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      if (!isDraggingRef.current) playAudio(text);
    }, 80);
  };

  const handleDragStart = () => {
    isDraggingRef.current = true;
    setIsDragging(true);
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
  };

  const handleDragEnd = (e: any, info: any, item: LetterItem) => {
    isDraggingRef.current = false;
    setIsDragging(false);
    const dropPoint = { x: info.point.x, y: info.point.y };
    let closestSlotIndex = -1;
    let minDistance = 100; // Snap radius in pixels

    slotRefs.current.forEach((slot, index) => {
      if (slot) {
        const rect = slot.getBoundingClientRect();
        const center = {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2
        };
        const distance = Math.sqrt(
          Math.pow(center.x - dropPoint.x, 2) +
          Math.pow(center.y - dropPoint.y, 2)
        );
        if (distance < minDistance) {
          minDistance = distance;
          closestSlotIndex = index;
        }
      }
    });

    if (closestSlotIndex !== -1) {
      const existingItem = slots[closestSlotIndex];
      const newSlots = [...slots];
      newSlots[closestSlotIndex] = item;
      setSlots(newSlots);

      if (existingItem) {
        setPool(prev => [...prev.filter(p => p.id !== item.id), existingItem]);
      } else {
        setPool(prev => prev.filter(p => p.id !== item.id));
      }
    }
  };

  const handlePoolItemClick = (item: LetterItem) => {
    const firstEmptyIndex = slots.findIndex(s => s === null);
    if (firstEmptyIndex !== -1) {
      const newSlots = [...slots];
      newSlots[firstEmptyIndex] = item;
      setSlots(newSlots);
      setPool(prev => prev.filter(p => p.id !== item.id));
    }
  };

  const handleSlotItemClick = (item: LetterItem, index: number) => {
    const newSlots = [...slots];
    newSlots[index] = null;
    setSlots(newSlots);
    setPool(prev => [...prev, item]);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] w-full max-w-5xl mx-auto p-4" dir="rtl">
      <div className="w-full rounded-3xl overflow-hidden border shadow-[0_0_60px_rgba(13,115,119,0.3)]"
        style={{ background: 'linear-gradient(160deg,#0D1B2A,#0a0a12)', borderColor: 'rgba(255,183,3,0.3)' }}>
        {/* Header */}
        <div className="p-6 flex justify-between items-center border-b"
          style={{ background: 'linear-gradient(90deg,#0D7377,#14213D)', borderColor: 'rgba(255,183,3,0.3)' }}>
          <h2 className="text-3xl font-bold text-[#FFB703]">لفظ ٺاهيو (Make the Word)</h2>
          <div className="text-xl font-bold px-4 py-2 rounded-full text-[#14213D]"
            style={{ background: 'linear-gradient(135deg,#FFB703,#F4A261)' }}>
            لفظ {currentIndex + 1} / {data.length}
          </div>
        </div>

        {/* Interactive Area */}
        <div className="p-8 md:p-16 flex flex-col items-center justify-center min-h-[450px] relative">

          {/* Audio Button */}
          <div className="absolute top-8 right-8">
            <button
              onClick={() => playAudio(currentItem.word)}
              className="flex items-center gap-2 px-6 py-3 rounded-full font-bold hover:scale-105 transition-transform text-xl text-[#14213D] shadow-[0_0_20px_rgba(255,183,3,0.4)]"
              style={{ background: 'linear-gradient(135deg,#FFB703,#F4A261)' }}
            >
              <Volume2 className="w-6 h-6" />
              آواز ٻڌو
            </button>
          </div>

          <div className="min-h-[200px] flex flex-col items-center justify-center w-full mt-12">
            <AnimatePresence mode="wait">
              {isCompleted ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.2 }}
                  className="flex flex-col items-center gap-8"
                >
                  <div className="text-8xl md:text-[150px] font-bold text-[#FFB703] drop-shadow-[0_0_20px_rgba(255,183,3,0.3)]">
                    {currentItem.word}
                  </div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 text-3xl font-bold px-8 py-4 rounded-full border"
                    style={{ color: '#2DC653', background: 'rgba(45,198,83,0.1)', borderColor: 'rgba(45,198,83,0.4)' }}
                  >
                    <CheckCircle2 className="w-10 h-10" />
                    بهترين! (Excellent!)
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div
                  key="scrambled"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center w-full"
                >
                  {/* Slots Area */}
                  <div className="flex flex-row items-center justify-center gap-4 md:gap-6 mb-12">
                    {slots.map((slotItem, index) => (
                      <div
                        key={`slot-${index}`}
                        ref={el => {
                          if (el) slotRefs.current[index] = el;
                        }}
                        className="w-24 h-32 md:w-32 md:h-40 border-4 border-dashed rounded-2xl flex items-center justify-center"
                        style={{ borderColor: 'rgba(255,183,3,0.3)', background: 'rgba(13,115,119,0.15)' }}
                      >
                        {slotItem && (
                          <motion.div
                            layoutId={slotItem.id}
                            onClick={() => handleSlotItemClick(slotItem, index)}
                            onMouseEnter={() => handleHoverPlay(slotItem.letter)}
                            className="w-full h-full text-6xl md:text-8xl font-bold rounded-2xl flex items-center justify-center cursor-pointer relative overflow-hidden group transition-colors"
                            style={{ background: 'linear-gradient(135deg,#0D7377,#14213D)', border: '2px solid rgba(255,183,3,0.6)', color: '#FFB703' }}
                          >
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'rgba(255,183,3,0.1)' }} />
                            <span className="relative z-10">{slotItem.letter}</span>
                          </motion.div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Pool Area */}
                  <div className="flex flex-row flex-wrap items-center justify-center gap-4 md:gap-6 min-h-[160px]">
                    {pool.map((item) => (
                      <motion.div
                        key={item.id}
                        layoutId={item.id}
                        drag
                        dragSnapToOrigin
                        onDragStart={handleDragStart}
                        onDragEnd={(e, info) => handleDragEnd(e, info, item)}
                        onClick={() => handlePoolItemClick(item)}
                        onMouseEnter={() => handleHoverPlay(item.letter)}
                        whileDrag={{ scale: 1.1, zIndex: 50 }}
                        className="w-24 h-32 md:w-32 md:h-40 text-6xl md:text-8xl font-bold rounded-2xl flex items-center justify-center cursor-grab active:cursor-grabbing relative overflow-hidden group z-10 transition-colors"
                        style={{ background: 'linear-gradient(135deg,#C1121F,#6A0572)', border: '2px solid rgba(255,183,3,0.5)', color: '#FFB703' }}
                      >
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'rgba(255,183,3,0.1)' }} />
                        <span className="relative z-10">{item.letter}</span>
                      </motion.div>
                    ))}
                  </div>

                  <p className="text-white/40 text-2xl font-bold animate-pulse mt-8">
                    اکرن کي ڇڪي خالي جاين تي رکو (يا ڪلڪ ڪريو)
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Navigation */}
        <div className="p-6 flex justify-between items-center border-t"
          style={{ background: 'rgba(13,115,119,0.15)', borderColor: 'rgba(255,183,3,0.2)' }}>
          <button onClick={handleNext}
            disabled={!isCompleted && currentIndex !== data.length - 1}
            className="flex items-center gap-2 px-8 py-4 rounded-full font-bold text-2xl transition-all"
            style={!isCompleted && currentIndex !== data.length - 1
              ? { color: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'not-allowed' }
              : { background: 'linear-gradient(135deg,#FFB703,#F4A261)', color: '#14213D', border: 'none' }}
          >
            {currentIndex === data.length - 1 ? 'مڪمل' : 'اڳيون'}
            <ArrowLeft className="w-6 h-6" />
          </button>
          <button onClick={handlePrev} disabled={currentIndex === 0}
            className="flex items-center gap-2 px-8 py-4 rounded-full font-bold text-2xl transition-all border"
            style={currentIndex === 0
              ? { color: 'rgba(255,255,255,0.2)', borderColor: 'rgba(255,255,255,0.1)', cursor: 'not-allowed' }
              : { color: '#FFB703', borderColor: 'rgba(255,183,3,0.4)', background: 'rgba(13,115,119,0.2)' }}
          >
            <ArrowRight className="w-6 h-6" />
            پوئتي
          </button>
        </div>
      </div>
    </div>
  );
}
