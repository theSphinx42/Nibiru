// Helper to download a file
export const downloadFile = (content: string | Blob, filename: string) => {
  const link = document.createElement('a');
  const url = content instanceof Blob 
    ? URL.createObjectURL(content)
    : `data:image/svg+xml;charset=utf-8,${encodeURIComponent(content)}`;
    
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  if (content instanceof Blob) {
    URL.revokeObjectURL(url);
  }
};

// Convert SVG to PNG
export const svgToPng = async (svgElement: SVGSVGElement, width: number, height: number): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    canvas.width = width;
    canvas.height = height;
    
    // Convert SVG to data URL
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    
    img.onload = () => {
      ctx?.drawImage(img, 0, 0);
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to convert SVG to PNG'));
        }
      }, 'image/png');
      URL.revokeObjectURL(url);
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load SVG'));
    };
    
    img.src = url;
  });
}; 