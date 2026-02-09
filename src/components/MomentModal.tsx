'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Moment } from '@/types';

interface MomentModalProps {
  moment: Moment | null;
  onClose: () => void;
}

export default function MomentModal({ moment, onClose }: MomentModalProps) {
  if (!moment) return null;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/90 backdrop-blur-xl z-50 overflow-y-auto"
        onClick={onClose}
      >
        {/* Luxury shimmer overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-rose-500/5 pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="min-h-screen flex items-center justify-center p-4"
          onClick={e => e.stopPropagation()}
        >
          <div className="w-full max-w-lg">
            {/* Close button */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              onClick={onClose}
              className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 backdrop-blur flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-all"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </motion.button>

            {/* Image */}
            {moment.image && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="relative w-full aspect-square rounded-3xl overflow-hidden mb-6 ring-1 ring-white/10"
              >
                <Image
                  src={moment.image.src}
                  alt={moment.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 500px"
                />
                {/* Luxury gold frame effect */}
                <div className="absolute inset-0 ring-1 ring-inset ring-amber-200/20 rounded-3xl pointer-events-none" />
              </motion.div>
            )}

            {/* Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass rounded-3xl p-6"
            >
              {/* Header */}
              <div className="text-center mb-6">
                <p className="text-amber-200/60 text-sm tracking-widest uppercase mb-2">
                  {formatDate(moment.date)}
                </p>
                <h2 className="text-2xl font-light text-white">
                  {moment.title}
                </h2>
              </div>

              {/* Elegant divider */}
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="h-px w-12 bg-gradient-to-r from-transparent to-amber-200/30" />
                <div className="w-1.5 h-1.5 rounded-full bg-amber-200/50" />
                <div className="h-px w-12 bg-gradient-to-l from-transparent to-amber-200/30" />
              </div>

              {/* Messages */}
              <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2">
                {moment.messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: msg.fromMe ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.05 }}
                    className={`flex ${msg.fromMe ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`message-bubble ${msg.fromMe ? 'from-me' : 'from-them'}`}
                    >
                      <p>{msg.text || '[Photo]'}</p>
                      {msg.time && (
                        <p className={`text-xs mt-1 ${msg.fromMe ? 'text-white/50' : 'text-white/30'}`}>
                          {msg.time}
                        </p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Tags */}
              <div className="flex flex-wrap justify-center gap-2 mt-6 pt-4 border-t border-white/5">
                {moment.tags.map(tag => (
                  <span
                    key={tag}
                    className="text-xs px-3 py-1 rounded-full bg-amber-200/10 text-amber-200/70 tracking-wide"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
