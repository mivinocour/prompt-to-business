"use client";

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Maximize2, X } from 'lucide-react';

interface ImageGalleryProps {
  images: Array<{
    imageBytes: string;
    mimeType?: string;
  }>;
}

export function ImageGallery({ images }: ImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  if (!images || images.length === 0) return null;

  return (
    <motion.div 
      className="mt-4 space-y-3"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <motion.div 
        className={`grid gap-3 ${
          images.length === 1 ? 'grid-cols-1' : 
          images.length === 2 ? 'grid-cols-2' : 
          'grid-cols-2 md:grid-cols-4'
        }`}
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.15, // Stagger each image by 150ms
              delayChildren: 0.2, // Start animations after 200ms
            }
          }
        }}
      >
        {images.map((image, index) => (
          <motion.div 
            key={index}
            className="relative group cursor-pointer rounded-lg overflow-hidden bg-card border border-border hover:border-muted-foreground transition-colors"
            onClick={() => setSelectedImage(index)}
            variants={{
              hidden: { 
                opacity: 0, 
                scale: 0.8, 
                y: 20 
              },
              visible: { 
                opacity: 1, 
                scale: 1, 
                y: 0,
                transition: {
                  duration: 0.6,
                  ease: "easeOut"
                }
              }
            }}
            whileHover={{ 
              scale: 1.02,
              transition: { duration: 0.2 }
            }}
            whileTap={{ scale: 0.98 }}
          >
            <Image
              src={`data:${image.mimeType || 'image/png'};base64,${image.imageBytes}`}
              alt={`Generated image ${index + 1}`}
              width={1024}
              height={1024}
              unoptimized
              className="w-full h-auto object-cover"
              style={{ aspectRatio: '1/1' }}
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
              <Maximize2 className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </motion.div>
        ))}
      </motion.div>
      
      {/* Full-size image modal with animation */}
      <AnimatePresence>
        {selectedImage !== null && (
          <motion.div 
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div 
              className="relative max-w-4xl max-h-full"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <button
                type="button"
                aria-label="Close image preview"
                onClick={() => setSelectedImage(null)}
                className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              <Image
                src={`data:${images[selectedImage].mimeType || 'image/png'};base64,${images[selectedImage].imageBytes}`}
                alt={`Generated image ${selectedImage + 1}`}
                width={1536}
                height={1536}
                unoptimized
                className="max-w-full max-h-full object-contain rounded-lg"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
