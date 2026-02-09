'use client';

import { motion } from 'framer-motion';
import { useState, useMemo } from 'react';
import Image from 'next/image';
import { Moment } from '@/types';

interface TimeSliderProps {
  moments: Moment[];
}

export default function TimeSlider({ moments }: TimeSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const sortedMoments = useMemo(() => {
    return [...moments].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [moments]);

  const momentsWithImages = useMemo(() => {
    return sortedMoments.filter(m => m.image);
  }, [sortedMoments]);

  if (momentsWithImages.length === 0) {
    return null;
  }

  const currentMoment = momentsWithImages[currentIndex];

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    });
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentIndex(parseInt(e.target.value));
  };

  return (
    <section className="py-16 px-4 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-rose-900/5 to-transparent" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-8"
      >
        <div className="flex items-center justify-center gap-4 mb-4">
          <div className="h-px w-16 bg-gradient-to-r from-transparent via-amber-200/30 to-amber-200/50" />
          <span className="text-amber-200/60 text-sm tracking-[0.3em] uppercase">Journey Through Time</span>
          <div className="h-px w-16 bg-gradient-to-l from-transparent via-amber-200/30 to-amber-200/50" />
        </div>
      </motion.div>

      <div className="max-w-md mx-auto">
        {/* Photo display */}
        <motion.div
          key={currentMoment?.id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="relative aspect-square rounded-3xl overflow-hidden mb-6 ring-1 ring-amber-200/20"
        >
          {currentMoment?.image && (
            <Image
              src={currentMoment.image.src}
              alt={currentMoment.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 400px"
            />
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Caption */}
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <p className="text-amber-200/80 text-sm mb-1">{formatDate(currentMoment?.date || '')}</p>
            <h3 className="text-white text-lg font-light">{currentMoment?.title}</h3>
          </div>

          {/* Luxury frame */}
          <div className="absolute inset-0 ring-1 ring-inset ring-amber-200/10 rounded-3xl pointer-events-none" />
        </motion.div>

        {/* Timeline slider */}
        <div className="relative px-4">
          <input
            type="range"
            min="0"
            max={momentsWithImages.length - 1}
            value={currentIndex}
            onChange={handleSliderChange}
            className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:w-4
              [&::-webkit-slider-thumb]:h-4
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-gradient-to-r
              [&::-webkit-slider-thumb]:from-amber-200
              [&::-webkit-slider-thumb]:to-rose-300
              [&::-webkit-slider-thumb]:shadow-lg
              [&::-webkit-slider-thumb]:shadow-rose-500/30
              [&::-webkit-slider-thumb]:cursor-pointer
              [&::-webkit-slider-thumb]:transition-transform
              [&::-webkit-slider-thumb]:hover:scale-125"
          />

          {/* Progress bar */}
          <div
            className="absolute top-0 left-4 h-1 rounded-full bg-gradient-to-r from-amber-200/50 to-rose-300/50 pointer-events-none"
            style={{ width: `${(currentIndex / (momentsWithImages.length - 1)) * 100}%` }}
          />

          {/* Date labels */}
          <div className="flex justify-between mt-3 text-xs text-white/30">
            <span>{formatDate(momentsWithImages[0]?.date || '')}</span>
            <span>{formatDate(momentsWithImages[momentsWithImages.length - 1]?.date || '')}</span>
          </div>
        </div>

        {/* Thumbnail dots */}
        <div className="flex justify-center gap-1.5 mt-6">
          {momentsWithImages.slice(0, 10).map((m, i) => (
            <button
              key={m.id}
              onClick={() => setCurrentIndex(i)}
              className={`w-2 h-2 rounded-full transition-all ${
                i === currentIndex
                  ? 'bg-gradient-to-r from-amber-200 to-rose-300 scale-125'
                  : 'bg-white/20 hover:bg-white/40'
              }`}
            />
          ))}
          {momentsWithImages.length > 10 && (
            <span className="text-white/30 text-xs ml-2">+{momentsWithImages.length - 10}</span>
          )}
        </div>
      </div>
    </section>
  );
}
