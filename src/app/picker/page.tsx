'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface PhotoItem {
  filename: string;
  date: string;
  src: string;
}

export default function PhotoPicker() {
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);
  const [rejected, setRejected] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    // Load photos from API
    fetch('/api/photos')
      .then(res => res.json())
      .then(data => {
        setPhotos(data.photos || []);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  const currentPhoto = photos[currentIndex];
  const progress = photos.length > 0 ? ((currentIndex) / photos.length) * 100 : 0;

  const handleSelect = (approved: boolean) => {
    if (!currentPhoto) return;

    if (approved) {
      setSelected(prev => [...prev, currentPhoto.filename]);
    } else {
      setRejected(prev => [...prev, currentPhoto.filename]);
    }

    if (currentIndex >= photos.length - 1) {
      setIsDone(true);
    } else {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handleSave = async () => {
    try {
      const res = await fetch('/api/photos/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selected })
      });
      const data = await res.json();
      if (data.success) {
        alert(`Saved ${selected.length} photos! Refresh the main page to see them.`);
      }
    } catch (err) {
      alert('Failed to save. Check console.');
      console.error(err);
    }
  };

  const handleUndo = () => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      const prevPhoto = photos[prevIndex];

      // Remove from selected or rejected
      setSelected(prev => prev.filter(f => f !== prevPhoto.filename));
      setRejected(prev => prev.filter(f => f !== prevPhoto.filename));

      setCurrentIndex(prevIndex);
      setIsDone(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-white">Loading photos...</p>
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-white">No photos found. Make sure images are in the attachments folder.</p>
      </div>
    );
  }

  if (isDone) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-6xl mb-6"
        >
          🎉
        </motion.div>
        <h1 className="text-3xl text-white mb-4">All done!</h1>
        <p className="text-white/60 mb-2">You selected {selected.length} photos</p>
        <p className="text-white/40 mb-8">Rejected {rejected.length} photos</p>

        <div className="flex gap-4">
          <button
            onClick={handleSave}
            className="px-8 py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-full font-medium hover:opacity-90 transition"
          >
            Save & Use These Photos
          </button>
          <button
            onClick={() => {
              setCurrentIndex(0);
              setSelected([]);
              setRejected([]);
              setIsDone(false);
            }}
            className="px-8 py-3 bg-white/10 text-white rounded-full hover:bg-white/20 transition"
          >
            Start Over
          </button>
        </div>

        {selected.length > 0 && (
          <div className="mt-12 w-full max-w-4xl">
            <h2 className="text-white/60 text-sm mb-4">Selected photos preview:</h2>
            <div className="grid grid-cols-4 gap-2">
              {selected.slice(0, 12).map((filename, i) => (
                <div key={i} className="aspect-square bg-white/10 rounded-lg overflow-hidden relative">
                  <Image
                    src={`/api/photo/${encodeURIComponent(filename)}`}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="100px"
                  />
                </div>
              ))}
              {selected.length > 12 && (
                <div className="aspect-square bg-white/10 rounded-lg flex items-center justify-center">
                  <span className="text-white/40">+{selected.length - 12} more</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-white/10 z-50">
        <div
          className="h-full bg-gradient-to-r from-rose-500 to-pink-500 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Header */}
      <div className="p-4 text-center">
        <h1 className="text-xl text-white font-light">Photo Picker</h1>
        <p className="text-white/40 text-sm">{currentIndex + 1} of {photos.length} • {selected.length} selected</p>
      </div>

      {/* Photo */}
      <div className="flex-1 flex items-center justify-center p-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPhoto?.filename}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, x: -100 }}
            className="relative w-full max-w-md aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl"
          >
            {currentPhoto && (
              <Image
                src={`/api/photo/${encodeURIComponent(currentPhoto.filename)}`}
                alt=""
                fill
                className="object-cover"
                sizes="400px"
                priority
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <p className="text-amber-200/80 text-sm">{currentPhoto?.date}</p>
              <p className="text-white/60 text-xs mt-1 truncate">{currentPhoto?.filename}</p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="p-8 flex justify-center items-center gap-6">
        {/* Undo */}
        <button
          onClick={handleUndo}
          disabled={currentIndex === 0}
          className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:bg-white/20 transition disabled:opacity-30"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 10h10a5 5 0 0 1 5 5v2M3 10l4-4M3 10l4 4" />
          </svg>
        </button>

        {/* Reject */}
        <button
          onClick={() => handleSelect(false)}
          className="w-16 h-16 rounded-full bg-white/10 border-2 border-red-400/50 flex items-center justify-center text-red-400 hover:bg-red-400/20 transition"
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        {/* Accept */}
        <button
          onClick={() => handleSelect(true)}
          className="w-20 h-20 rounded-full bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-rose-500/30 hover:scale-105 transition"
        >
          <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        </button>

        {/* Skip (same as reject for now) */}
        <button
          onClick={() => handleSelect(false)}
          className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:bg-white/20 transition"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Keyboard hints */}
      <p className="text-center text-white/20 text-xs pb-4">
        Keyboard: ← Reject • → Accept • Backspace Undo
      </p>
    </div>
  );
}
