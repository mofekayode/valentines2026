'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useMemo, useState } from 'react';
import { RawMessage, Moment } from '@/types';

interface StarfieldProps {
  messages: RawMessage[];
  moments: Moment[];
  onStarClick: (moment: Moment) => void;
}

// Seeded random for consistent values
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9999) * 10000;
  return x - Math.floor(x);
}

export default function Starfield({ messages, moments, onStarClick }: StarfieldProps) {
  const [hoveredMoment, setHoveredMoment] = useState<{ moment: Moment; x: number; y: number } | null>(null);

  const { stars, stats } = useMemo(() => {
    // Group messages by date
    const messagesByDate: Record<string, number> = {};
    messages.forEach(m => {
      const date = m.timestamp?.split('T')[0];
      if (date) {
        messagesByDate[date] = (messagesByDate[date] || 0) + 1;
      }
    });

    // Get text moments (no image) for clicking
    const textMoments = moments.filter(m => !m.image);

    // Create stars
    const dates = Object.keys(messagesByDate).sort();
    const counts = Object.values(messagesByDate);
    const maxMessages = Math.max(...counts);

    // Top 15% of days are "special" (pink stars)
    const sortedCounts = [...counts].sort((a, b) => b - a);
    const threshold = sortedCounts[Math.floor(sortedCounts.length * 0.15)] || maxMessages;

    let momentIndex = 0;
    const starData = dates.map((date, i) => {
      const count = messagesByDate[date];
      const brightness = 0.3 + (count / maxMessages) * 0.7;
      const size = 1 + (count / maxMessages) * 3;
      const isSpecial = count >= threshold;

      // Distribute stars in a flowing galaxy pattern
      const progress = i / dates.length;
      const angle = progress * Math.PI * 4;
      const radius = 20 + progress * 25;
      const x = 50 + Math.cos(angle) * radius + (seededRandom(i) * 10 - 5);
      const y = 50 + Math.sin(angle) * radius * 0.6 + (seededRandom(i + 100) * 10 - 5);

      // Assign a moment to special stars
      let moment: Moment | undefined;
      if (isSpecial && textMoments.length > 0) {
        moment = textMoments[momentIndex % textMoments.length];
        momentIndex++;
      }

      return {
        x: Math.max(5, Math.min(95, x)),
        y: Math.max(10, Math.min(90, y)),
        size,
        brightness,
        date,
        count,
        isSpecial,
        moment
      };
    });

    return {
      stars: starData,
      stats: {
        totalDays: dates.length,
        totalMessages: counts.reduce((a, b) => a + b, 0),
      }
    };
  }, [messages, moments]);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="absolute top-12 text-center z-10"
      >
        <h2 className="text-3xl md:text-5xl font-light mb-3 bg-gradient-to-r from-amber-200 via-rose-300 to-amber-200 bg-clip-text text-transparent">
          Our Universe
        </h2>
        <p className="text-white/50 text-sm mb-4">
          {stats.totalDays.toLocaleString()} days of connection
        </p>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 text-xs text-white/40">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-white/60" />
            <span>Days we talked</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-pink-400 shadow-[0_0_8px_rgba(255,107,157,0.8)]" />
            <span>Tap for a love note</span>
          </div>
        </div>
      </motion.div>

      {/* Stars container */}
      <div className="relative w-full h-full">
        {/* Stars */}
        {stars.map((star, i) => (
          <motion.button
            key={star.date}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: star.brightness,
              scale: 1,
            }}
            transition={{
              delay: i * 0.003,
              duration: 0.5
            }}
            className={`absolute rounded-full ${star.isSpecial && star.moment ? 'cursor-pointer hover:scale-150 transition-transform z-10' : ''}`}
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: star.size * 4,
              height: star.size * 4,
              background: star.isSpecial
                ? 'radial-gradient(circle, #ff6b9d 0%, #ff6b9d 50%, transparent 100%)'
                : 'radial-gradient(circle, white 0%, white 50%, transparent 100%)',
              boxShadow: star.isSpecial
                ? `0 0 ${star.size * 8}px rgba(255, 107, 157, ${star.brightness})`
                : `0 0 ${star.size * 4}px rgba(255, 255, 255, ${star.brightness * 0.5})`,
              transform: 'translate(-50%, -50%)',
            }}
            onClick={() => star.moment && onStarClick(star.moment)}
            onMouseEnter={() => star.moment && setHoveredMoment({ moment: star.moment, x: star.x, y: star.y })}
            onMouseLeave={() => setHoveredMoment(null)}
          />
        ))}

        {/* Hover preview */}
        <AnimatePresence>
          {hoveredMoment && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="absolute z-50 pointer-events-none"
              style={{
                left: `${Math.min(Math.max(hoveredMoment.x, 20), 80)}%`,
                top: `${Math.min(hoveredMoment.y + 8, 75)}%`,
                transform: 'translateX(-50%)',
              }}
            >
              <div className="bg-black/90 backdrop-blur-md border border-white/10 rounded-2xl p-4 max-w-xs shadow-2xl">
                <p className="text-amber-200/60 text-xs mb-2">
                  {hoveredMoment.moment.messages[0]?.fromMe ? 'Mofe' : 'Gimbiya'} • {hoveredMoment.moment.date}
                </p>
                <p className="text-white/90 text-sm leading-relaxed">
                  &ldquo;{hoveredMoment.moment.messages[0]?.text?.substring(0, 120)}...&rdquo;
                </p>
                <p className="text-white/30 text-xs mt-2">Click to read more</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-20 text-center"
      >
        <p className="text-white/30 text-sm">
          {stats.totalMessages.toLocaleString()} messages exchanged
        </p>
      </motion.div>
    </div>
  );
}
