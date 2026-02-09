'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Intro from '@/components/Intro';
import MomentModal from '@/components/MomentModal';
import LoveStats from '@/components/LoveStats';
import ValentineQuestion from '@/components/ValentineQuestion';
import Starfield from '@/components/Starfield';
import { Moment, RawMessage, Stats } from '@/types';
import Image from 'next/image';

// Import static data (messages and stats don't change at runtime)
import messagesData from '@/data/messages.json';
import statsData from '@/data/stats.json';
import momentsData from '@/data/moments.json';

// Simple photo type for the gallery
interface Photo {
  filename: string;
  src: string;
}

export default function Home() {
  const [showIntro, setShowIntro] = useState(true);
  const [selectedMoment, setSelectedMoment] = useState<Moment | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [showFinalMessage, setShowFinalMessage] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [photosLoaded, setPhotosLoaded] = useState(false);

  const messages = messagesData as RawMessage[];
  const stats = statsData as Stats;
  const moments = momentsData as Moment[];
  const textMoments = moments.filter(m => !m.image);

  // Fetch photos directly from /api/photos - this uses the saved order
  useEffect(() => {
    fetch('/api/photos', { cache: 'no-store' })
      .then(r => r.json())
      .then(data => {
        setPhotos(data.photos || []);
        setPhotosLoaded(true);
      })
      .catch(() => {
        setPhotos([]);
        setPhotosLoaded(true);
      });
  }, []);

  const sections = ['header', 'starfield', 'stats', 'timeline', 'moments', 'question'];

  const handleIntroComplete = () => {
    setShowIntro(false);
  };

  const handleYes = () => {
    setShowFinalMessage(true);
  };

  const handleStarClick = (moment: Moment) => {
    setSelectedMoment(moment);
  };

  // Handle scroll to change sections
  const handleWheel = useCallback((e: WheelEvent) => {
    if (isScrolling || showIntro || showFinalMessage) return;

    const delta = e.deltaY;
    const threshold = 30;

    if (Math.abs(delta) > threshold) {
      setIsScrolling(true);

      if (delta > 0 && currentSection < sections.length - 1) {
        setCurrentSection(prev => prev + 1);
      } else if (delta < 0 && currentSection > 0) {
        setCurrentSection(prev => prev - 1);
      }

      // Debounce scrolling - matches animation duration
      setTimeout(() => setIsScrolling(false), 900);
    }
  }, [currentSection, isScrolling, showIntro, showFinalMessage, sections.length]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (showIntro || showFinalMessage) return;

    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      if (currentSection < sections.length - 1) {
        setCurrentSection(prev => prev + 1);
      }
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      if (currentSection > 0) {
        setCurrentSection(prev => prev - 1);
      }
    }
  }, [currentSection, showIntro, showFinalMessage, sections.length]);

  useEffect(() => {
    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleWheel, handleKeyDown]);

  const nextSection = () => {
    if (currentSection < sections.length - 1) {
      setCurrentSection(prev => prev + 1);
    }
  };

  const prevSection = () => {
    if (currentSection > 0) {
      setCurrentSection(prev => prev - 1);
    }
  };

  const formatDate = (dateStr: string, includeDay = true) => {
    const date = new Date(dateStr);
    if (includeDay) {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    }
    return date.toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <main className="h-screen bg-black text-white overflow-hidden">
      {/* Intro */}
      <AnimatePresence>
        {showIntro && (
          <Intro onComplete={handleIntroComplete} />
        )}
      </AnimatePresence>

      {/* Main Horizontal Scroll Content */}
      <AnimatePresence>
        {!showIntro && !showFinalMessage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="h-full"
          >
            {/* Navigation dots */}
            <div className="fixed right-6 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-3">
              {sections.map((name, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSection(i)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === currentSection
                      ? 'bg-gradient-to-r from-amber-200 to-rose-300 scale-150'
                      : 'bg-white/30 hover:bg-white/50'
                  }`}
                  title={name}
                />
              ))}
            </div>

            {/* Arrow navigation */}
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 flex gap-4">
              {currentSection > 0 && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={prevSection}
                  className="w-12 h-12 rounded-full bg-white/10 backdrop-blur flex items-center justify-center hover:bg-white/20 transition-all"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                </motion.button>
              )}
              {currentSection < sections.length - 1 && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={nextSection}
                  className="w-12 h-12 rounded-full bg-white/10 backdrop-blur flex items-center justify-center hover:bg-white/20 transition-all"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </motion.button>
              )}
            </div>

            {/* Scroll hint */}
            {currentSection === 0 && (
              <motion.div
                className="fixed bottom-24 left-1/2 -translate-x-1/2 z-30 text-white/30 text-sm"
                animate={{ opacity: [0.3, 0.7, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                Scroll or use arrows to navigate
              </motion.div>
            )}

            {/* Horizontal sections container */}
            <motion.div
              className="h-full flex"
              animate={{ x: `-${currentSection * 100}vw` }}
              transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1] }}
            >
              {/* Section 1: Header */}
              <section className="w-screen h-full flex-shrink-0 flex flex-col items-center justify-center px-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center"
                >
                  <h1 className="text-5xl md:text-7xl font-light mb-4">
                    <span className="bg-gradient-to-r from-amber-200 via-rose-300 to-amber-200 bg-clip-text text-transparent">
                      Our Universe
                    </span>
                  </h1>
                  <p className="text-white/40 text-lg tracking-widest uppercase mb-8">
                    A love story in messages
                  </p>
                  <p className="text-white/60 text-sm">
                    {formatDate(stats.firstDate, false)} — {formatDate(stats.lastDate, false)}
                  </p>
                </motion.div>
              </section>

              {/* Section 2: Starfield */}
              <section className="w-screen h-full flex-shrink-0 flex items-center justify-center">
                <div className="w-full h-full">
                  <Starfield
                    messages={messages}
                    moments={moments}
                    onStarClick={handleStarClick}
                  />
                </div>
              </section>

              {/* Section 3: Stats */}
              <section className="w-screen h-full flex-shrink-0 flex items-center justify-center px-4 overflow-y-auto">
                <div className="max-w-4xl w-full py-8">
                  <LoveStats stats={stats} messages={messages} />
                </div>
              </section>

              {/* Section 4: Photo Moments - uses /api/photos with saved order */}
              <section className="w-screen h-full flex-shrink-0 flex flex-col items-center justify-center px-4 py-8">
                <motion.div className="text-center mb-6">
                  <div className="flex items-center justify-center gap-4 mb-4">
                    <div className="h-px w-16 bg-gradient-to-r from-transparent to-amber-200/50" />
                    <span className="text-amber-200/60 text-sm tracking-[0.3em] uppercase">Moments</span>
                    <div className="h-px w-16 bg-gradient-to-l from-transparent to-amber-200/50" />
                  </div>
                </motion.div>

                {!photosLoaded ? (
                  <div className="text-center py-20">
                    <p className="text-white/40">Loading photos...</p>
                  </div>
                ) : photos.length > 0 ? (
                  <>
                    {/* Photo grid - 2x2 layout, scrollable */}
                    <div
                      className="w-full max-w-3xl max-h-[75vh] overflow-y-auto pb-4 scrollbar-thin"
                      onWheel={(e) => e.stopPropagation()}
                    >
                      <div className="grid grid-cols-2 gap-3 px-4">
                        {photos.map((photo, i) => (
                          <motion.div
                            key={photo.filename}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: Math.min(i * 0.03, 0.3) }}
                            onClick={() => setSelectedPhoto(photo)}
                            className="cursor-pointer group"
                          >
                            <div className="relative aspect-square rounded-xl overflow-hidden ring-1 ring-white/10 group-hover:ring-amber-200/50 transition-all shadow-xl">
                              <Image
                                src={photo.src}
                                alt={`Memory ${i + 1}`}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                sizes="(max-width: 768px) 50vw, 300px"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                    <p className="text-white/30 text-sm mt-4">{photos.length} memories • Tap to view full size</p>
                  </>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-20"
                  >
                    <div className="text-6xl mb-6">📸</div>
                    <p className="text-white/60 text-lg mb-2">No photos yet</p>
                    <p className="text-white/30 text-sm">Add photos to public/media folder</p>
                  </motion.div>
                )}
              </section>

              {/* Section 5: Love Letters */}
              <section className="w-screen h-full flex-shrink-0 flex flex-col items-center justify-center px-8">
                <div className="max-w-2xl w-full">
                  <motion.div className="text-center mb-6">
                    <div className="flex items-center justify-center gap-4 mb-2">
                      <div className="h-px w-16 bg-gradient-to-r from-transparent to-amber-200/50" />
                      <span className="text-amber-200/60 text-sm tracking-[0.3em] uppercase">Words From The Heart</span>
                      <div className="h-px w-16 bg-gradient-to-l from-transparent to-amber-200/50" />
                    </div>
                    <p className="text-white/30 text-xs">Tap to read the full message</p>
                  </motion.div>

                  <div
                    className="space-y-4 max-h-[60vh] overflow-y-auto pr-2"
                    onWheel={(e) => e.stopPropagation()}
                  >
                    {textMoments.map((moment, i) => (
                      <motion.div
                        key={moment.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        onClick={() => setSelectedMoment(moment)}
                        className="glass rounded-2xl p-5 cursor-pointer hover:bg-white/10 transition-all border border-white/5"
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-rose-400 text-lg">{moment.messages[0]?.fromMe ? '💬' : '💕'}</span>
                          <span className="text-amber-200/60 text-xs">{formatDate(moment.date)}</span>
                          <span className="text-white/20 text-xs">•</span>
                          <span className="text-white/40 text-xs">{moment.messages[0]?.fromMe ? 'Mofe' : 'Gimbiya'}</span>
                        </div>
                        <p className="text-white/80 text-sm leading-relaxed line-clamp-3">
                          &ldquo;{moment.messages[0]?.text?.substring(0, 200)}{(moment.messages[0]?.text?.length || 0) > 200 ? '...' : ''}&rdquo;
                        </p>
                        <p className="text-amber-200/40 text-xs mt-3 font-light">{moment.title}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Section 6: Valentine Question */}
              <section className="w-screen h-full flex-shrink-0">
                <ValentineQuestion onYes={handleYes} />
              </section>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Final Message after Yes */}
      <AnimatePresence>
        {showFinalMessage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black flex flex-col items-center justify-center px-8 z-50"
          >
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(30)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute text-2xl"
                  style={{ left: `${(i * 3.3) % 100}%` }}
                  initial={{ y: '100vh' }}
                  animate={{ y: '-100px' }}
                  transition={{
                    duration: 4 + (i % 3),
                    repeat: Infinity,
                    delay: i * 0.2,
                    ease: "linear"
                  }}
                >
                  {['💕', '💖', '💗', '💝', '✨'][i % 5]}
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.3 }}
              className="text-8xl mb-8 relative z-10"
            >
              💖
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-3xl md:text-5xl font-light text-center mb-6 bg-gradient-to-r from-amber-200 via-rose-300 to-amber-200 bg-clip-text text-transparent relative z-10"
            >
              Forever Starts Now
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="text-xl text-white/60 text-center max-w-md relative z-10"
            >
              Thank you for being my everything.
              <br />
              Here&apos;s to us and all our tomorrows.
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
              className="mt-12 text-white/30 text-sm relative z-10"
            >
              Happy Valentine&apos;s Day 2026 💕
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Moment Modal */}
      {selectedMoment && (
        <MomentModal
          moment={selectedMoment}
          onClose={() => setSelectedMoment(null)}
        />
      )}

      {/* Photo Modal - simple fullscreen view */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedPhoto(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-w-4xl max-h-[90vh] w-full h-full"
            >
              <Image
                src={selectedPhoto.src}
                alt="Memory"
                fill
                className="object-contain"
                sizes="100vw"
              />
            </motion.div>
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
