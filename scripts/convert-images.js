const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const svgDir = path.join(__dirname, '../frontend/frontend/public/images/glyphs');
const svgFiles = fs.readdirSync(svgDir).filter(file => file.endsWith('.svg'));

async function convertSvgToPng() {
  for (const file of svgFiles) {
    const inputPath = path.join(svgDir, file);
    const outputPath = path.join(svgDir, file.replace('.svg', '.png'));
    
    try {
      await sharp(inputPath)
        .resize(256, 256) // Set a reasonable size for the glyphs
        .png()
        .toFile(outputPath);
      
      console.log(`Converted ${file} to PNG`);
    } catch (error) {
      console.error(`Error converting ${file}:`, error);
    }
  }
}

convertSvgToPng(); 