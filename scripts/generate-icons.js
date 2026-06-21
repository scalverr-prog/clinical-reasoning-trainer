import sharp from 'sharp';
import { mkdir } from 'fs/promises';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');

// Create a simple gradient icon with brain symbol
const createIconSvg = (size) => `
<svg width="${size}" height="${size}" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#7c3aed"/>
      <stop offset="100%" style="stop-color:#10b981"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="96" fill="url(#grad)"/>
  <g transform="translate(128, 128) scale(0.5)">
    <path d="M256 64C150 64 64 150 64 256s86 192 192 192 192-86 192-192S362 64 256 64zm0 320c-70.7 0-128-57.3-128-128s57.3-128 128-128c35.3 0 67.3 14.3 90.5 37.5L301.3 211c-11.3-11.3-26.9-18.3-45.3-18.3-35.3 0-64 28.7-64 64s28.7 64 64 64c18.4 0 34-8.3 45.3-18.3l45.2 45.1C323.3 369.7 291.3 384 256 384z" fill="white"/>
    <circle cx="256" cy="256" r="32" fill="white"/>
  </g>
</svg>
`;

const sizes = [
  { name: 'favicon-16x16.png', size: 16 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'pwa-192x192.png', size: 192 },
  { name: 'pwa-512x512.png', size: 512 },
];

async function generateIcons() {
  console.log('Generating PWA icons...');

  for (const { name, size } of sizes) {
    const svg = Buffer.from(createIconSvg(512));
    await sharp(svg)
      .resize(size, size)
      .png()
      .toFile(join(publicDir, name));
    console.log(`Created ${name}`);
  }

  // Also create favicon.ico from 32x32
  const svg = Buffer.from(createIconSvg(512));
  await sharp(svg)
    .resize(32, 32)
    .png()
    .toFile(join(publicDir, 'favicon.ico'));
  console.log('Created favicon.ico');

  console.log('Done!');
}

generateIcons().catch(console.error);
