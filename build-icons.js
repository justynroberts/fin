const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

async function generateIcons() {
  const svgPath = 'build/icon.svg';

  console.log('Converting SVG to PNG...');

  // Generate 1024x1024 PNG
  await sharp(svgPath)
    .resize(1024, 1024)
    .png()
    .toFile('build/icon-1024.png');

  console.log('Generated icon-1024.png');

  // Generate different sizes for icns
  const sizes = [16, 32, 64, 128, 256, 512, 1024];
  for (const size of sizes) {
    await sharp(svgPath)
      .resize(size, size)
      .png()
      .toFile(`build/icons/${size}x${size}.png`);
    console.log(`Generated ${size}x${size}.png`);
  }

  console.log('PNG generation complete!');
  console.log('Now use electron-builder to generate platform icons...');
}

generateIcons().catch(console.error);
