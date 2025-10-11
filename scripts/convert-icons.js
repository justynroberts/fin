#!/usr/bin/env node

const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const iconMaker = require('electron-icon-maker');

const buildDir = path.join(__dirname, '..', 'build');
const svgPath = path.join(buildDir, 'icon.svg');
const pngPath = path.join(buildDir, 'icon-1024.png');

console.log('🎨 Converting SVG to PNG...');

sharp(svgPath)
  .resize(1024, 1024)
  .png()
  .toFile(pngPath)
  .then(() => {
    console.log('✅ PNG created at build/icon-1024.png');
    console.log('🔧 Generating platform-specific icons...');

    iconMaker({
      input: pngPath,
      output: buildDir
    }).then(() => {
      console.log('✅ All platform icons generated!');
      console.log('  - macOS: build/icon.icns');
      console.log('  - Windows: build/icon.ico');
      console.log('  - Linux: build/icons/*.png');
    }).catch(err => {
      console.error('❌ Error generating icons:', err);
      process.exit(1);
    });
  })
  .catch(err => {
    console.error('❌ Error converting SVG:', err);
    process.exit(1);
  });
