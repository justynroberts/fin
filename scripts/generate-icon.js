/**
 * Generate app icons from Material Symbols 'pets' icon
 * Requires: node-fetch (or use native fetch in Node 18+)
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

const SIZES = [16, 32, 64, 128, 256, 512, 1024];
const BUILD_DIR = path.join(__dirname, '..', 'build');
const ICONSET_DIR = path.join(BUILD_DIR, 'icon.iconset');

// Material Symbols pets icon SVG (black)
const PETS_SVG = `<svg xmlns="http://www.w3.org/2000/svg" height="1024" viewBox="0 -960 960 960" width="1024" fill="#000000">
  <path d="M180-475q-42 0-71-29t-29-71q0-42 29-71t71-29q42 0 71 29t29 71q0 42-29 71t-71 29Zm180-160q-42 0-71-29t-29-71q0-42 29-71t71-29q42 0 71 29t29 71q0 42-29 71t-71 29Zm240 0q-42 0-71-29t-29-71q0-42 29-71t71-29q42 0 71 29t29 71q0 42-29 71t-71 29Zm180 160q-42 0-71-29t-29-71q0-42 29-71t71-29q42 0 71 29t29 71q0 42-29 71t-71 29ZM266-75q-45 0-75.5-34.5T160-191q0-52 35.5-91t70.5-77q29-31 50-67.5t50-68.5q22-26 51-43t63-17q34 0 63 16t51 42q28 32 49.5 69t50.5 69q35 38 70.5 77t35.5 91q0 47-30.5 81.5T694-75q-54 0-107-9t-107-9q-54 0-107 9t-107 9Z"/>
</svg>`;

async function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

async function generatePNGFromSVG(svgContent, outputPath, size) {
  console.log(`Generating ${size}x${size} PNG...`);

  // Save SVG temporarily
  const tempSvgPath = path.join(BUILD_DIR, 'temp-icon.svg');
  fs.writeFileSync(tempSvgPath, svgContent);

  try {
    // Try using sips (macOS built-in) - but it doesn't support SVG directly
    // We'll use ImageMagick if available, otherwise provide instructions
    try {
      await execAsync(`convert -background none -resize ${size}x${size} "${tempSvgPath}" "${outputPath}"`);
      console.log(`✓ Created ${path.basename(outputPath)}`);
    } catch (err) {
      console.log(`ImageMagick not found. Trying alternative method...`);

      // Try using qlmanage and sips (macOS)
      try {
        await execAsync(`qlmanage -t -s ${size} -o "${BUILD_DIR}" "${tempSvgPath}" && mv "${BUILD_DIR}/temp-icon.svg.png" "${outputPath}"`);
        console.log(`✓ Created ${path.basename(outputPath)}`);
      } catch (err2) {
        throw new Error('Could not convert SVG. Please install ImageMagick: brew install imagemagick');
      }
    }
  } finally {
    // Clean up temp SVG
    if (fs.existsSync(tempSvgPath)) {
      fs.unlinkSync(tempSvgPath);
    }
  }
}

async function createIconset() {
  console.log('Creating iconset directory...');
  await ensureDir(ICONSET_DIR);

  // Generate all required sizes for macOS iconset
  const iconsetSizes = [
    { size: 16, name: 'icon_16x16.png' },
    { size: 32, name: 'icon_16x16@2x.png' },
    { size: 32, name: 'icon_32x32.png' },
    { size: 64, name: 'icon_32x32@2x.png' },
    { size: 128, name: 'icon_128x128.png' },
    { size: 256, name: 'icon_128x128@2x.png' },
    { size: 256, name: 'icon_256x256.png' },
    { size: 512, name: 'icon_256x256@2x.png' },
    { size: 512, name: 'icon_512x512.png' },
    { size: 1024, name: 'icon_512x512@2x.png' },
  ];

  for (const { size, name } of iconsetSizes) {
    const outputPath = path.join(ICONSET_DIR, name);
    await generatePNGFromSVG(PETS_SVG, outputPath, size);
  }

  // Also generate standalone PNG for Linux
  const linuxIconPath = path.join(BUILD_DIR, 'icon.png');
  await generatePNGFromSVG(PETS_SVG, linuxIconPath, 512);

  console.log('\n✓ All PNG files generated!');
}

async function createICNS() {
  console.log('\nCreating .icns file for macOS...');
  try {
    const icnsPath = path.join(BUILD_DIR, 'icon.icns');
    await execAsync(`iconutil -c icns "${ICONSET_DIR}" -o "${icnsPath}"`);
    console.log(`✓ Created icon.icns`);
  } catch (err) {
    console.error('Failed to create .icns file:', err.message);
    throw err;
  }
}

async function createICO() {
  console.log('\nCreating .ico file for Windows...');
  try {
    // We need multiple sizes for ICO
    const sizes = [16, 32, 48, 64, 128, 256];
    const pngFiles = sizes.map(size => path.join(ICONSET_DIR, `icon_${size}x${size}.png`));

    // Generate missing sizes
    for (const size of sizes) {
      const pngPath = path.join(ICONSET_DIR, `icon_${size}x${size}.png`);
      if (!fs.existsSync(pngPath)) {
        await generatePNGFromSVG(PETS_SVG, pngPath, size);
      }
    }

    const icoPath = path.join(BUILD_DIR, 'icon.ico');
    const pngFilesList = pngFiles.filter(f => fs.existsSync(f)).join(' ');

    await execAsync(`convert ${pngFilesList} "${icoPath}"`);
    console.log(`✓ Created icon.ico`);
  } catch (err) {
    console.error('Failed to create .ico file:', err.message);
    console.log('Skipping .ico generation - you can create it manually later');
  }
}

async function main() {
  try {
    console.log('🐾 Generating app icons from Material Symbols "pets" icon...\n');

    await ensureDir(BUILD_DIR);
    await createIconset();
    await createICNS();
    await createICO();

    console.log('\n✓ Icon generation complete!');
    console.log('\nGenerated files:');
    console.log(`  - ${BUILD_DIR}/icon.icns (macOS)`);
    console.log(`  - ${BUILD_DIR}/icon.ico (Windows)`);
    console.log(`  - ${BUILD_DIR}/icon.png (Linux)`);
    console.log(`  - ${ICONSET_DIR}/ (PNG sources)`);

  } catch (err) {
    console.error('\n✗ Error:', err.message);
    console.log('\nPlease ensure you have ImageMagick installed:');
    console.log('  brew install imagemagick');
    process.exit(1);
  }
}

main();
