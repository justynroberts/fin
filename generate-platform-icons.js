const png2icons = require('png2icons');
const fs = require('fs');

async function generatePlatformIcons() {
  const input = fs.readFileSync('build/icon-1024.png');

  console.log('Generating macOS .icns file...');
  const icns = png2icons.createICNS(input, png2icons.BICUBIC, 0);
  fs.writeFileSync('build/icon.icns', icns);
  console.log('✅ Generated icon.icns');

  console.log('Generating Windows .ico file...');
  const ico = png2icons.createICO(input, png2icons.BICUBIC, 0, false);
  fs.writeFileSync('build/icon.ico', ico);
  console.log('✅ Generated icon.ico');

  console.log('\n🎉 All platform icons generated successfully!');
}

generatePlatformIcons().catch(console.error);
