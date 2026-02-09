'use client';

import { useState, useEffect, useRef } from 'react';

interface PhotoItem {
  filename: string;
  src: string;
}

export default function SortPhotos() {
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fetch both photos and saved order
    Promise.all([
      fetch('/api/media').then(r => r.json()),
      fetch('/api/media/order').then(r => r.json())
    ]).then(([mediaData, orderData]) => {
      const allPhotos = mediaData.photos || [];
      const savedOrder = orderData.order || [];

      // Apply saved order
      if (savedOrder.length > 0) {
        const sorted = [...allPhotos].sort((a, b) => {
          const aIdx = savedOrder.indexOf(a.filename);
          const bIdx = savedOrder.indexOf(b.filename);
          if (aIdx === -1 && bIdx === -1) return 0;
          if (aIdx === -1) return 1;
          if (bIdx === -1) return -1;
          return aIdx - bIdx;
        });
        setPhotos(sorted);
      } else {
        setPhotos(allPhotos);
      }
      setIsLoading(false);
    }).catch(() => setIsLoading(false));
  }, []);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    const dragIndex = draggedIndex;

    if (dragIndex === null || dragIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const newPhotos = [...photos];
    const [draggedItem] = newPhotos.splice(dragIndex, 1);
    newPhotos.splice(dropIndex, 0, draggedItem);

    setPhotos(newPhotos);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Save the new order
      const orderedFilenames = photos.map(p => p.filename);
      const res = await fetch('/api/media/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: orderedFilenames })
      });
      const data = await res.json();
      if (data.success) {
        alert(`Saved! ${photos.length} photos reordered.`);
      } else {
        alert('Error: ' + data.error);
      }
    } catch (err) {
      alert('Failed to save. Check console.');
      console.error(err);
    }
    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-white">Loading photos...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-4">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-black/90 backdrop-blur-sm py-4 mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl text-white font-light">Sort Your Photos</h1>
          <p className="text-white/40 text-sm">{photos.length} photos • Drag to reorder</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-full font-medium hover:opacity-90 transition disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : 'Save Order'}
        </button>
      </div>

      {/* Photo Grid */}
      <div
        ref={containerRef}
        className="grid gap-2"
        style={{
          gridTemplateColumns: `repeat(auto-fill, minmax(${photos.length > 100 ? '60px' : photos.length > 50 ? '80px' : '100px'}, 1fr))`
        }}
      >
        {photos.map((photo, index) => (
          <div
            key={photo.filename}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={handleDragEnd}
            className={`
              aspect-square relative rounded-lg overflow-hidden cursor-grab active:cursor-grabbing
              transition-all duration-200
              ${draggedIndex === index ? 'opacity-50 scale-95' : ''}
              ${dragOverIndex === index ? 'ring-2 ring-rose-500 scale-105' : ''}
              hover:ring-1 hover:ring-white/30
            `}
          >
            <img
              src={`/media/thumbs/${photo.filename}`}
              alt=""
              className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white/60 text-[8px] px-1 py-0.5 text-center truncate">
              {index + 1}
            </div>
          </div>
        ))}
      </div>

      {/* Instructions */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-sm rounded-full px-6 py-3 text-white/60 text-sm">
        Drag photos to reorder • First photo appears first in gallery
      </div>
    </div>
  );
}
