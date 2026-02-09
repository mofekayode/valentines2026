'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Moment } from '@/types';

interface MomentCardProps {
  moment: Moment;
  index: number;
  onClick: () => void;
}

export default function MomentCard({ moment, index, onClick }: MomentCardProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Get preview messages (first 3)
  const previewMessages = moment.messages.slice(0, 3);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      viewport={{ once: true, margin: "-50px" }}
      className="moment-card cursor-pointer"
      onClick={onClick}
    >
      {/* Image if available */}
      {moment.image && (
        <div className="relative w-full aspect-square overflow-hidden">
          <Image
            src={moment.image.src}
            alt={moment.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 400px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
      )}

      {/* Content */}
      <div className="p-5">
        {/* Date & Tags */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-white/40 text-xs">
            {formatDate(moment.date)}
          </span>
          <div className="flex gap-1">
            {moment.tags.slice(0, 2).map(tag => (
              <span
                key={tag}
                className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/60"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Title */}
        <h3 className="text-lg font-medium mb-4 gradient-text">
          {moment.title}
        </h3>

        {/* Message preview */}
        <div className="space-y-2">
          {previewMessages.map((msg, i) => (
            <div
              key={i}
              className={`message-bubble ${msg.fromMe ? 'from-me' : 'from-them'}`}
            >
              <p className="text-sm">{msg.text || '[Photo]'}</p>
            </div>
          ))}
          {moment.messages.length > 3 && (
            <p className="text-center text-white/30 text-xs pt-2">
              +{moment.messages.length - 3} more messages
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
