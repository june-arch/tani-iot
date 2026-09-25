"use client";
import { useState } from "react";
import Image from "next/image";
import { Sprout } from "lucide-react";

// Gambar dengan fallback: kalau URL mati, tampilkan blok lilac + ikon.
export function CropImage({ src, alt, className = "", eager = false }: { src: string; alt: string; className?: string; eager?: boolean }) {
  const [broken, setBroken] = useState(false);
  const [seenSrc, setSeenSrc] = useState(src);
  // Reset saat src berganti — penyesuaian state saat render (pola resmi React,
  // tanpa effect) agar tidak memicu render beruntun.
  if (seenSrc !== src) {
    setSeenSrc(src);
    setBroken(false);
  }
  if (broken) {
    return (
      <div className={`flex items-center justify-center bg-lilac-mist ${className}`} aria-label={alt}>
        <Sprout className="h-10 w-10 text-midnight-wine/40" />
      </div>
    );
  }
  return <Image src={src} alt={alt} fill className={`object-cover ${className}`} unoptimized onError={() => setBroken(true)} priority={eager} />;
}
