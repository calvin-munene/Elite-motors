import { useState, useRef, useCallback, useEffect } from "react";
import { RotateCcw, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";

interface Car360ViewerProps {
  images: string[];
  title?: string;
}

export function Car360Viewer({ images, title }: Car360ViewerProps) {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [lastX, setLastX] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set([0]));
  const containerRef = useRef<HTMLDivElement>(null);
  const autoRotateRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const totalFrames = images.length;

  // Auto-rotate
  useEffect(() => {
    if (autoRotate && !isDragging && totalFrames > 1) {
      autoRotateRef.current = setInterval(() => {
        setCurrentFrame(prev => (prev + 1) % totalFrames);
      }, 150);
    }
    return () => { if (autoRotateRef.current) clearInterval(autoRotateRef.current); };
  }, [autoRotate, isDragging, totalFrames]);

  // Preload images
  useEffect(() => {
    images.forEach((src, i) => {
      const img = new Image();
      img.onload = () => setLoadedImages(prev => new Set([...prev, i]));
      img.src = src;
    });
  }, [images]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    setAutoRotate(false);
    setLastX(e.clientX);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    const delta = e.clientX - lastX;
    if (Math.abs(delta) > 5) {
      const frameDelta = delta > 0 ? -1 : 1;
      setCurrentFrame(prev => (prev + frameDelta + totalFrames) % totalFrames);
      setLastX(e.clientX);
    }
  }, [isDragging, lastX, totalFrames]);

  const handleMouseUp = useCallback(() => setIsDragging(false), []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setIsDragging(true);
    setAutoRotate(false);
    setLastX(e.touches[0].clientX);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging) return;
    const delta = e.touches[0].clientX - lastX;
    if (Math.abs(delta) > 5) {
      const frameDelta = delta > 0 ? -1 : 1;
      setCurrentFrame(prev => (prev + frameDelta + totalFrames) % totalFrames);
      setLastX(e.touches[0].clientX);
    }
  }, [isDragging, lastX, totalFrames]);

  if (totalFrames <= 1) {
    return (
      <div className="relative aspect-[4/3] bg-black rounded-lg overflow-hidden">
        <img src={images[0]} alt={title} className="w-full h-full object-cover" />
      </div>
    );
  }

  return (
    <div className={`${isFullscreen ? "fixed inset-0 z-50 bg-black flex items-center justify-center p-4" : "relative"}`}>
      <div
        ref={containerRef}
        className={`relative ${isFullscreen ? "w-full max-w-4xl" : "aspect-[4/3]"} bg-gradient-to-b from-black to-gray-950 rounded-lg overflow-hidden cursor-grab active:cursor-grabbing select-none`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={() => setIsDragging(false)}
      >
        {/* Image */}
        <div
          style={{ transform: `scale(${zoom})`, transition: isDragging ? "none" : "transform 0.2s" }}
          className="w-full h-full"
        >
          <img
            src={images[currentFrame]}
            alt={`${title} - frame ${currentFrame + 1}`}
            className="w-full h-full object-cover"
            draggable={false}
          />
        </div>

        {/* 360 Badge */}
        <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full border border-white/20 flex items-center gap-1.5">
          <RotateCcw className="w-3 h-3" />
          360° VIEW
        </div>

        {/* Frame indicator */}
        <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm text-white/60 text-xs px-3 py-1.5 rounded-full border border-white/10">
          {currentFrame + 1}/{totalFrames}
        </div>

        {/* Drag hint */}
        {!isDragging && autoRotate && (
          <div className="absolute bottom-14 left-1/2 -translate-x-1/2 text-white/50 text-xs text-center pointer-events-none">
            <div className="flex items-center gap-2 bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10">
              <span className="animate-pulse">⟵</span>
              Drag to rotate
              <span className="animate-pulse">⟶</span>
            </div>
          </div>
        )}

        {/* Progress bar */}
        <div className="absolute bottom-10 left-4 right-4">
          <div className="h-0.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-150"
              style={{ width: `${((currentFrame + 1) / totalFrames) * 100}%` }}
            />
          </div>
        </div>

        {/* Controls */}
        <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setZoom(z => Math.max(1, z - 0.25))}
              className="w-7 h-7 bg-black/60 backdrop-blur-sm rounded-full border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
            >
              <ZoomOut className="w-3 h-3" />
            </button>
            <button
              onClick={() => setZoom(z => Math.min(3, z + 0.25))}
              className="w-7 h-7 bg-black/60 backdrop-blur-sm rounded-full border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
            >
              <ZoomIn className="w-3 h-3" />
            </button>
            <button
              onClick={() => setAutoRotate(a => !a)}
              className={`px-3 h-7 bg-black/60 backdrop-blur-sm rounded-full border text-xs font-medium transition-colors ${
                autoRotate ? "border-primary text-primary" : "border-white/10 text-white hover:bg-white/10"
              }`}
            >
              {autoRotate ? "Auto ●" : "Auto ○"}
            </button>
          </div>
          <button
            onClick={() => setIsFullscreen(f => !f)}
            className="w-7 h-7 bg-black/60 backdrop-blur-sm rounded-full border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
          >
            <Maximize2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {isFullscreen && (
        <button
          onClick={() => setIsFullscreen(false)}
          className="absolute top-6 right-6 w-10 h-10 bg-black/80 border border-white/20 rounded-full flex items-center justify-center text-white text-xl hover:bg-white/10"
        >
          ×
        </button>
      )}
    </div>
  );
}
