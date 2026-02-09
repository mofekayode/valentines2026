'use client';

import { motion } from 'framer-motion';
import { useState, useEffect, useMemo } from 'react';
import { Stats, RawMessage } from '@/types';

interface LoveStatsProps {
  stats: Stats;
  messages: RawMessage[];
}

export default function LoveStats({ stats, messages }: LoveStatsProps) {
  const [currentSampleIndex, setCurrentSampleIndex] = useState(0);

  // Get sample messages for different categories
  const samples = useMemo(() => {
    const loveMessages: string[] = [];
    const funnyMessages: string[] = [];
    const lateNightMessages: string[] = [];

    messages.forEach(m => {
      if (!m.text || m.text.length < 20) return;

      const text = m.text;
      const lower = text.toLowerCase();

      // Love messages
      if (lower.includes('i love you') && loveMessages.length < 10) {
        loveMessages.push(text.substring(0, 60) + (text.length > 60 ? '...' : ''));
      }

      // Messages with laughing emojis
      if ((text.includes('😂') || text.includes('🤣') || text.includes('😭')) && funnyMessages.length < 10) {
        funnyMessages.push(text.substring(0, 60) + (text.length > 60 ? '...' : ''));
      }

      // Late night
      if (m.timestamp) {
        const hour = new Date(m.timestamp).getHours();
        if ((hour >= 0 && hour <= 3) && lateNightMessages.length < 10 && text.length > 15) {
          lateNightMessages.push(text.substring(0, 60) + (text.length > 60 ? '...' : ''));
        }
      }
    });

    return { loveMessages, funnyMessages, lateNightMessages };
  }, [messages]);

  // Rotate through samples
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSampleIndex(prev => prev + 1);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const statItems = [
    {
      key: 'messages',
      label: "Messages Exchanged",
      value: stats.totalMessages.toLocaleString(),
      icon: "💬",
      detail: `${stats.fromMe.toLocaleString()} from Mofe, ${stats.fromThem.toLocaleString()} from Gimbiya`,
    },
    {
      key: 'days',
      label: "Days Connected",
      value: stats.daysTexted,
      icon: "📅",
      detail: `Since ${formatDate(stats.firstDate)}`,
    },
    {
      key: 'streak',
      label: "Longest Streak",
      value: `${stats.longestStreak} days`,
      icon: "🔥",
      detail: "Consecutive days texting",
    },
    {
      key: 'love',
      label: "\"I Love You\"",
      value: stats.loveYouCount,
      icon: "💕",
      detail: "Times these words were shared",
    },
    {
      key: 'hour',
      label: "Most Active Hour",
      value: stats.mostActiveHour.hour,
      icon: "⏰",
      detail: `${stats.mostActiveHour.count.toLocaleString()} messages at this hour`,
    },
    {
      key: 'latenight',
      label: "Late Night Talks",
      value: stats.lateNightMessages.toLocaleString(),
      icon: "🌙",
      detail: "Messages after midnight",
    },
    {
      key: 'photos',
      label: "Photos Shared",
      value: stats.photosShared.toLocaleString(),
      icon: "📸",
      detail: "Captured moments",
    },
    {
      key: 'words',
      label: "Words Written",
      value: stats.totalWords.toLocaleString(),
      icon: "✍️",
      detail: `~${stats.avgPerDay.toFixed(0)} messages per day`,
    }
  ];

  // Get emoji sample messages
  const getEmojiSample = (emoji: string): string => {
    const matching = messages.filter(m =>
      m.text && m.text.includes(emoji) && m.text.length > 10 && m.text.length < 100
    );
    if (matching.length === 0) return '';
    const msg = matching[currentSampleIndex % matching.length];
    return msg?.text?.substring(0, 50) + (msg?.text && msg.text.length > 50 ? '...' : '') || '';
  };

  return (
    <section className="py-16 px-4 relative overflow-hidden">
      {/* Luxury background */}
      <div className="absolute inset-0 bg-gradient-to-b from-amber-900/5 via-rose-900/5 to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,215,0,0.03),transparent_70%)]" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="text-center mb-12 relative"
      >
        <div className="flex items-center justify-center gap-4 mb-4">
          <div className="h-px w-16 bg-gradient-to-r from-transparent via-amber-200/30 to-amber-200/50" />
          <span className="text-amber-200/60 text-sm tracking-[0.3em] uppercase">Our Story in Numbers</span>
          <div className="h-px w-16 bg-gradient-to-l from-transparent via-amber-200/30 to-amber-200/50" />
        </div>
        <h2 className="text-3xl md:text-4xl font-light">
          <span className="text-white">Love</span>{' '}
          <span className="bg-gradient-to-r from-amber-200 via-rose-300 to-amber-200 bg-clip-text text-transparent">Wrapped</span>
        </h2>
      </motion.div>

      {/* Top Emojis with rotating samples */}
      {stats.topEmojis.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <div className="flex justify-center gap-6 mb-4">
            {stats.topEmojis.slice(0, 5).map((e, i) => (
              <motion.div
                key={e.emoji}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl mb-1">{e.emoji}</div>
                <div className="text-xs text-amber-200/50">{e.count.toLocaleString()}x</div>
              </motion.div>
            ))}
          </div>

          {/* Rotating sample message */}
          <motion.div
            key={currentSampleIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-center max-w-lg mx-auto"
          >
            <p className="text-white/40 text-xs italic">
              &ldquo;{getEmojiSample(stats.topEmojis[currentSampleIndex % stats.topEmojis.length]?.emoji || '😂')}&rdquo;
            </p>
          </motion.div>
        </motion.div>
      )}

      {/* Rotating love message showcase */}
      {samples.loveMessages.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto mb-12 text-center"
        >
          <motion.p
            key={`love-${currentSampleIndex}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-white/50 text-sm italic leading-relaxed"
          >
            &ldquo;{samples.loveMessages[currentSampleIndex % samples.loveMessages.length]}&rdquo;
          </motion.p>
        </motion.div>
      )}

      {/* Stats Grid */}
      <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
        {statItems.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08, duration: 0.5 }}
            className="relative group"
          >
            <div className="stat-card h-full relative overflow-hidden">
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

              <div className="text-2xl mb-2">{stat.icon}</div>
              <div className="text-2xl md:text-3xl font-light text-white mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-amber-200/70 font-medium mb-1">
                {stat.label}
              </div>
              <div className="text-xs text-white/30">
                {stat.detail}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
