#!/usr/bin/env node

const sharp = require('sharp');
const png2icons = require('png2icons');
const path = require('path');
const fs = require('fs');

const buildDir = path.join(__dirname, '..', 'build');
const iconsDir = path.join(buildDir, 'icons');
const svgPath = path.join(buildDir, 'icon.svg');
const pngPath = path.join(buildDir, 'icon-1024.png');

async function generateIcons() {
  console.log('🎨 Converting SVG to PNG (1024x1024)...');
  
  await sharp(svgPath)
    .resize(1024, 1024)
    .png()
    .toFile(pngPath);
  
  console.log('✅ PNG created');

  // Read PNG
  const pngBuffer = fs.readFileSync(pngPath);

  // Generate ICNS for macOS
  console.log('🍎 Generating macOS icon (ICNS)...');
  const icnsBuffer = png2icons.createICNS(pngBuffer, png2icons.BICUBIC, 0);
  fs.writeFileSync(path.join(buildDir, 'icon.icns'), icnsBuffer);
  console.log('✅ icon.icns created');

  // Generate ICO for Windows
  console.log('🪟 Generating Windows icon (ICO)...');
  const icoBuffer = png2icons.createICO(pngBuffer, png2icons.BICUBIC, 0, false);
  fs.writeFileSync(path.join(buildDir, 'icon.ico'), icoBuffer);
  console.log('✅ icon.ico created');

  // Generate Linux PNG icons
  console.log('🐧 Generating Linux icons...');
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }

  const sizes = [16, 24, 32, 48, 64, 96, 128, 256, 512, 1024];
  for (const size of sizes) {
    await sharp(svgPath)
      .resize(size, size)
      .png()
      .toFile(path.join(iconsDir, `${size}x${size}.png`));
  }
  console.log('✅ Linux PNG icons created');

  console.log('\n🎉 All icons generated successfully!');
  console.log('  📁 macOS: build/icon.icns');
  console.log('  📁 Windows: build/icon.ico');
  console.log('  📁 Linux: build/icons/*.png');
}

generateIcons().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
