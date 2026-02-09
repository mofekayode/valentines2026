'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

interface IntroProps {
  onComplete: () => void;
}

const introTexts = [
  "Out of 8 billion people...",
  "Across all the places in the world...",
  "Through all the moments in time...",
  "We found each other."
];

// Pre-defined star positions to avoid hydration mismatch
const starPositions = [
  { left: 5, top: 10 }, { left: 15, top: 25 }, { left: 25, top: 5 }, { left: 35, top: 45 },
  { left: 45, top: 15 }, { left: 55, top: 35 }, { left: 65, top: 8 }, { left: 75, top: 55 },
  { left: 85, top: 20 }, { left: 95, top: 40 }, { left: 10, top: 60 }, { left: 20, top: 75 },
  { left: 30, top: 50 }, { left: 40, top: 85 }, { left: 50, top: 65 }, { left: 60, top: 90 },
  { left: 70, top: 70 }, { left: 80, top: 30 }, { left: 90, top: 80 }, { left: 3, top: 35 },
  { left: 12, top: 88 }, { left: 22, top: 42 }, { left: 32, top: 18 }, { left: 42, top: 72 },
  { left: 52, top: 28 }, { left: 62, top: 58 }, { left: 72, top: 12 }, { left: 82, top: 68 },
  { left: 92, top: 48 }, { left: 8, top: 95 }, { left: 18, top: 52 }, { left: 28, top: 78 },
  { left: 38, top: 32 }, { left: 48, top: 92 }, { left: 58, top: 22 }, { left: 68, top: 82 },
  { left: 78, top: 38 }, { left: 88, top: 62 }, { left: 98, top: 15 }, { left: 2, top: 72 },
  { left: 14, top: 38 }, { left: 24, top: 92 }, { left: 34, top: 62 }, { left: 44, top: 8 },
  { left: 54, top: 78 }, { left: 64, top: 42 }, { left: 74, top: 95 }, { left: 84, top: 52 },
  { left: 94, top: 25 }, { left: 6, top: 82 }
];

export default function Intro({ onComplete }: IntroProps) {
  const [currentText, setCurrentText] = useState(0);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    if (currentText < introTexts.length - 1) {
      const timer = setTimeout(() => {
        setCurrentText(prev => prev + 1);
      }, 2500);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        setShowButton(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [currentText]);

  return (
    <motion.div
      className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50 px-8"
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
    >
      {/* Stars background */}
      <div className="absolute inset-0 overflow-hidden">
        {starPositions.map((star, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              left: `${star.left}%`,
              top: `${star.top}%`,
            }}
            animate={{
              opacity: [0.2, 1, 0.2],
            }}
            transition={{
              duration: 2 + (i % 3),
              repeat: Infinity,
              delay: i * 0.1,
            }}
          />
        ))}
      </div>

      {/* Text */}
      <AnimatePresence mode="wait">
        <motion.h1
          key={currentText}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.8 }}
          className="text-2xl md:text-4xl font-light text-center text-white max-w-lg leading-relaxed z-10"
        >
          {introTexts[currentText]}
        </motion.h1>
      </AnimatePresence>

      {/* Continue button */}
      <AnimatePresence>
        {showButton && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            onClick={onComplete}
            className="mt-12 btn-primary z-10 cursor-pointer"
            type="button"
          >
            Our Story
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
