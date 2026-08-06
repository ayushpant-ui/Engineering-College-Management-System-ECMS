"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  Images,
  X,
  ZoomIn,
} from "lucide-react";
import {
  GalleryCategory,
  GalleryImage,
  galleryCategories,
  galleryImages,
} from "@/data/gallery";

export default function GalleryGrid() {
  const [activeCategory, setActiveCategory] =
    useState<GalleryCategory>("All");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const filteredImages = useMemo(() => {
    if (activeCategory === "All") return galleryImages;
    return galleryImages.filter((img) => img.category === activeCategory);
  }, [activeCategory]);

  const openLightbox = (id: string) => {
    const index = filteredImages.findIndex((img) => img.id === id);
    setLightboxIndex(index);
  };

  const closeLightbox = () => setLightboxIndex(null);

  const showPrev = () =>
    setLightboxIndex((prev) =>
      prev === null
        ? null
        : (prev - 1 + filteredImages.length) % filteredImages.length
    );

  const showNext = () =>
    setLightboxIndex((prev) =>
      prev === null ? null : (prev + 1) % filteredImages.length
    );

  // Keyboard navigation for the lightbox
  useEffect(() => {
    if (lightboxIndex === null) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") showPrev();
      if (e.key === "ArrowRight") showNext();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [lightboxIndex, filteredImages.length]);

  const activeImage: GalleryImage | null =
    lightboxIndex !== null ? filteredImages[lightboxIndex] : null;

  return (
    <section className="w-full">
      {/* Header */}
      <div className="mb-8">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 dark:border-slate-700 px-3 py-1 text-xs font-medium text-slate-600 dark:text-slate-300">
          <Images className="h-3.5 w-3.5" />
          Engineering College Portal
        </span>
        <h1 className="mt-4 text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
          Gallery
        </h1>
        <p className="mt-2 max-w-2xl text-slate-500 dark:text-slate-400">
          A glimpse into campus life — events, labs, workshops, and
          milestones from the School of Engineering.
        </p>
      </div>

      {/* Category filters */}
      <div className="mb-6 flex flex-wrap gap-2">
        {galleryCategories.map((category) => {
          const isActive = category === activeCategory;
          return (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors border ${
                isActive
                  ? "bg-blue-600 border-blue-600 text-white"
                  : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400"
              }`}
            >
              {category}
            </button>
          );
        })}
      </div>

      {/* Grid */}
      {filteredImages.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 py-16 text-center text-slate-400 dark:text-slate-500">
          No photos in this category yet.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredImages.map((img) => (
            <button
              key={img.id}
              onClick={() => openLightbox(img.id)}
              className="group relative aspect-square overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-left"
            >
              <Image
                src={img.src}
                alt={img.title}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <div className="p-3">
                  <p className="text-sm font-semibold text-white line-clamp-1">
                    {img.title}
                  </p>
                  <p className="text-xs text-slate-200">{img.date}</p>
                </div>
              </div>
              <span className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <ZoomIn className="h-4 w-4" />
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {activeImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={closeLightbox}
        >
          <button
            onClick={closeLightbox}
            className="absolute top-5 right-5 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              showPrev();
            }}
            className="absolute left-4 sm:left-8 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
            aria-label="Previous image"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <div
            className="relative max-h-[80vh] w-full max-w-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-slate-900">
              <Image
                src={activeImage.src}
                alt={activeImage.title}
                fill
                sizes="100vw"
                className="object-contain"
              />
            </div>
            <div className="mt-3 text-center">
              <p className="text-base font-semibold text-white">
                {activeImage.title}
              </p>
              <p className="text-sm text-slate-400">
                {activeImage.category} · {activeImage.date}
              </p>
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              showNext();
            }}
            className="absolute right-4 sm:right-8 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
            aria-label="Next image"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}
    </section>
  );
}
