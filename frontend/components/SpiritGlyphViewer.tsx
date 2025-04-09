import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { SpiritGlyph } from '../types';

interface SpiritGlyphViewerProps {
  glyph: SpiritGlyph;
  mode: 'view' | 'analyze';
  onGenerate?: () => void;
  isGenerating?: boolean;
  className?: string;
}

const SpiritGlyphViewer = ({
  glyph,
  mode,
  onGenerate,
  isGenerating = false,
  className = '',
}: SpiritGlyphViewerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set canvas size
    canvas.width = 800;
    canvas.height = 800;

    // Draw glyph pattern
    const pattern = JSON.parse(glyph.pattern);
    const cellSize = canvas.width / pattern.length;

    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.scale(zoom, zoom);
    ctx.rotate((rotation * Math.PI) / 180);

    pattern.forEach((row: number[], y: number) => {
      row.forEach((cell: number, x: number) => {
        if (cell === 1) {
          ctx.fillStyle = `hsl(${glyph.resonance}, 70%, 50%)`;
          ctx.fillRect(
            (x - pattern.length / 2) * cellSize,
            (y - pattern.length / 2) * cellSize,
            cellSize,
            cellSize
          );
        }
      });
    });

    ctx.restore();
  }, [glyph, zoom, rotation]);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.2, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.2, 0.5));
  const handleRotateLeft = () => setRotation(prev => (prev - 15) % 360);
  const handleRotateRight = () => setRotation(prev => (prev + 15) % 360);

  return (
    <div className={`bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 ${className}`}>
      <div className="flex flex-col items-center">
        <div className="relative mb-8">
          <canvas
            ref={canvasRef}
            className="border border-gray-700 rounded-lg"
            style={{ width: '100%', height: 'auto' }}
          />
          <div className="absolute bottom-4 right-4 flex gap-2">
            <button
              onClick={handleZoomIn}
              className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
            <button
              onClick={handleZoomOut}
              className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>
            <button
              onClick={handleRotateLeft}
              className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={handleRotateRight}
              className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {mode === 'analyze' && (
          <div className="w-full max-w-md space-y-4">
            <div className="bg-gray-700/50 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-2">Glyph Analysis</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Resonance</span>
                  <span className="font-medium">{glyph.resonance.toFixed(1)}%</span>
                </div>
                {glyph.metadata && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Complexity</span>
                      <span className="font-medium">{glyph.metadata.complexity.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Harmony</span>
                      <span className="font-medium">{glyph.metadata.harmony.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Stability</span>
                      <span className="font-medium">{glyph.metadata.stability.toFixed(2)}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            <button
              onClick={onGenerate}
              disabled={isGenerating}
              className="w-full py-3 rounded-lg bg-purple-500 
                       hover:bg-purple-600 text-white font-medium
                       disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin mr-2"></div>
                  Generating...
                </div>
              ) : (
                'Generate New Glyph'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SpiritGlyphViewer; 