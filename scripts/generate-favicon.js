const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Ensure the favicon directory exists
const faviconDir = path.join(__dirname, '../public/favicon');
if (!fs.existsSync(faviconDir)) {
  fs.mkdirSync(faviconDir, { recursive: true });
}

// Source logo
const sourceImage = path.join(__dirname, '../public/bibscrip-logo.png');

// Generate different sizes
const sizes = [16, 32, 48, 64, 128, 192, 256, 512];

// Generate PNG favicons of different sizes
async function generatePngIcons() {
  for (const size of sizes) {
    await sharp(sourceImage)
      .resize(size, size)
      .toFile(path.join(faviconDir, `favicon-${size}x${size}.png`));
    console.log(`Generated ${size}x${size} PNG favicon`);
  }
}

// Generate the apple touch icon
async function generateAppleTouchIcon() {
  await sharp(sourceImage)
    .resize(180, 180)
    .toFile(path.join(__dirname, '../public/apple-touch-icon.png'));
  console.log('Generated apple-touch-icon.png');
}

// Generate the favicon.ico (16x16, 32x32, 48x48)
async function generateFaviconIco() {
  // Since we can't easily generate .ico files with sharp,
  // we'll just copy the 32x32 PNG to favicon.ico
  // In a real project, you'd use a dedicated .ico generator
  await sharp(sourceImage)
    .resize(32, 32)
    .toFile(path.join(__dirname, '../public/favicon.ico'));
  console.log('Generated favicon.ico');
}

// Run the generation
async function main() {
  try {
    await generatePngIcons();
    await generateAppleTouchIcon();
    await generateFaviconIco();
    
    console.log('✅ All favicon assets generated successfully!');
  } catch (error) {
    console.error('❌ Error generating favicons:', error);
  }
}

main();
