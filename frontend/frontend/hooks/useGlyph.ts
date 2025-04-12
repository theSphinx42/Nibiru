import { useCallback, useMemo } from 'react';
import { ColorMode, ExportFormat, GlyphMetadata } from '../types/glyph';
import { TIER_CONFIG, createGlyphMetadata, formatGlyphFilename } from '../config/glyphConfig';
import { downloadFile, svgToPng } from '../utils/exportHelpers';
import QRCode from 'qrcode';

interface UseGlyphOptions {
  seed: string;
  tier?: 1 | 2 | 3;
  colorMode?: ColorMode;
  size?: number;
}

interface UseGlyphResult {
  metadata: GlyphMetadata;
  exportAsSVG: (svgElement: SVGSVGElement) => Promise<void>;
  exportAsPNG: (svgElement: SVGSVGElement) => Promise<void>;
  exportAsQR: () => Promise<void>;
  exportAsSVGString: (svgElement: SVGSVGElement) => Promise<string>;
  getConfig: () => typeof TIER_CONFIG[keyof typeof TIER_CONFIG] & { radius: number };
}

export const useGlyph = ({
  seed,
  tier = 1,
  colorMode = 'auto',
  size = 400
}: UseGlyphOptions): UseGlyphResult => {
  // Get tier configuration with dynamic radius
  const config = useMemo(() => ({
    ...TIER_CONFIG[tier],
    radius: size * (tier === 1 ? 0.35 : tier === 2 ? 0.3 : 0.25)
  }), [tier, size]);

  // Generate metadata
  const metadata = useMemo(() => createGlyphMetadata(
    seed,
    tier,
    colorMode,
    Math.min(8, config.symmetryMax),
    config.pointCount
  ), [seed, tier, colorMode, config.symmetryMax, config.pointCount]);

  // Export as SVG string
  const exportAsSVGString = useCallback(async (svgElement: SVGSVGElement): Promise<string> => {
    const svgClone = svgElement.cloneNode(true) as SVGSVGElement;
    const motionPaths = svgClone.querySelectorAll('path');
    motionPaths.forEach(path => {
      path.removeAttribute('style');
      path.removeAttribute('transform');
    });
    return new XMLSerializer().serializeToString(svgClone);
  }, []);

  // Export as SVG file
  const exportAsSVG = useCallback(async (svgElement: SVGSVGElement): Promise<void> => {
    const svgString = await exportAsSVGString(svgElement);
    const filename = formatGlyphFilename(seed, 'svg');
    downloadFile(svgString, filename);
  }, [seed, exportAsSVGString]);

  // Export as PNG file
  const exportAsPNG = useCallback(async (svgElement: SVGSVGElement): Promise<void> => {
    const pngBlob = await svgToPng(svgElement, size, size);
    const filename = formatGlyphFilename(seed, 'png');
    downloadFile(pngBlob, filename);
  }, [seed, size]);

  // Export as QR code
  const exportAsQR = useCallback(async (): Promise<void> => {
    const qrData = JSON.stringify({
      type: 'SpiritGlyph',
      ...metadata
    });
    
    const qrDataUrl = await QRCode.toDataURL(qrData, {
      errorCorrectionLevel: 'H',
      margin: 1,
      width: 512,
      color: {
        dark: '#000',
        light: '#fff'
      }
    });

    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `${metadata.hexHash}-qr.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [metadata]);

  return {
    metadata,
    exportAsSVG,
    exportAsPNG,
    exportAsQR,
    exportAsSVGString,
    getConfig: () => config
  };
}; 