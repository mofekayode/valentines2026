'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import confetti from 'canvas-confetti';

interface ValentineQuestionProps {
  onYes: () => void;
}

export default function ValentineQuestion({ onYes }: ValentineQuestionProps) {
  const [stage, setStage] = useState(0);
  const [noPosition, setNoPosition] = useState({ x: 0, y: 0 });
  const [noAttempts, setNoAttempts] = useState(0);
  const [answered, setAnswered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const stages = [
    "I have something to ask you...",
    "Something I've been thinking about...",
    "Every moment with you feels special.",
    "And I want more of them.",
    "So here it is..."
  ];

  useEffect(() => {
    if (stage < stages.length - 1) {
      const timer = setTimeout(() => setStage(s => s + 1), 2500);
      return () => clearTimeout(timer);
    }
  }, [stage, stages.length]);

  const handleNoHover = () => {
    if (!containerRef.current) return;
    const container = containerRef.current.getBoundingClientRect();
    const maxX = container.width - 120;
    const maxY = 100;

    setNoPosition({
      x: Math.random() * maxX - maxX / 2,
      y: Math.random() * maxY - maxY / 2
    });
    setNoAttempts(n => n + 1);
  };

  const handleYes = () => {
    setAnswered(true);

    // Luxury confetti
    const duration = 5 * 1000;
    const end = Date.now() + duration;

    const colors = ['#ff6b9d', '#ffd700', '#ff1493', '#ffffff', '#c44569'];

    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors: colors
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors: colors
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());

    // Hearts burst
    confetti({
      particleCount: 100,
      spread: 100,
      origin: { y: 0.6 },
      shapes: ['circle'],
      colors: ['#ff6b9d', '#ff1493', '#c44569']
    });

    setTimeout(onYes, 3000);
  };

  const noMessages = [
    "Are you sure? 🥺",
    "Think about it...",
    "Pretty please?",
    "One more chance?",
    "I'll be sad...",
    "Really? 😢",
    "Okay I'll wait...",
    "But why? 💔"
  ];

  return (
    <section
      ref={containerRef}
      className="min-h-screen flex flex-col items-center justify-center px-4 py-16 relative overflow-hidden"
    >
      {/* Luxury background effects */}
      <div className="absolute inset-0 bg-gradient-to-t from-rose-900/20 via-transparent to-amber-900/10" />
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-amber-200/30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0.2, 0.8, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {!answered ? (
          <motion.div
            key="question"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center relative z-10"
          >
            {/* Build up text */}
            <AnimatePresence mode="wait">
              {stage < stages.length - 1 ? (
                <motion.p
                  key={stage}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="text-xl md:text-2xl font-light text-white/80 mb-8"
                >
                  {stages[stage]}
                </motion.p>
              ) : (
                <motion.div
                  key="final"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-12"
                >
                  {/* Decorative element */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: "spring" }}
                    className="text-6xl mb-6"
                  >
                    💝
                  </motion.div>

                  <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="text-3xl md:text-5xl font-light mb-4"
                  >
                    <span className="bg-gradient-to-r from-amber-200 via-rose-300 to-amber-200 bg-clip-text text-transparent">
                      Will you be my Valentine?
                    </span>
                  </motion.h2>

                  {/* Buttons */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10"
                  >
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleYes}
                      className="btn-primary text-xl px-12 py-4 shadow-lg shadow-rose-500/25"
                    >
                      Yes! 💕
                    </motion.button>

                    <motion.button
                      animate={{
                        x: noPosition.x,
                        y: noPosition.y
                      }}
                      transition={{ type: "spring", damping: 10 }}
                      onMouseEnter={handleNoHover}
                      onTouchStart={handleNoHover}
                      className="btn-secondary text-lg relative"
                    >
                      {noAttempts > 0 ? noMessages[Math.min(noAttempts - 1, noMessages.length - 1)] : "No"}
                    </motion.button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div
            key="answered"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center relative z-10"
          >
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 0.5,
                repeat: Infinity,
              }}
              className="text-8xl mb-8"
            >
              💖
            </motion.div>

            <h2 className="text-4xl md:text-6xl font-light mb-4 bg-gradient-to-r from-amber-200 via-rose-300 to-amber-200 bg-clip-text text-transparent">
              You made me the happiest!
            </h2>

            <p className="text-xl text-white/60 font-light">
              I love you more than words can say
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
