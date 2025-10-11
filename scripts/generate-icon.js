#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Create SVG icon for Finton
const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#4F46E5;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#7C3AED;stop-opacity:1" />
    </linearGradient>
  </defs>

  <!-- Rounded rectangle background -->
  <rect width="1024" height="1024" rx="200" fill="url(#bgGradient)"/>

  <!-- Document icon -->
  <g transform="translate(0, 50)">
    <!-- Paper -->
    <rect x="250" y="150" width="524" height="674" rx="30" fill="white" opacity="0.95"/>

    <!-- Text lines -->
    <rect x="320" y="240" width="384" height="24" rx="12" fill="#4F46E5" opacity="0.7"/>
    <rect x="320" y="304" width="320" height="24" rx="12" fill="#4F46E5" opacity="0.5"/>
    <rect x="320" y="368" width="384" height="24" rx="12" fill="#4F46E5" opacity="0.7"/>
    <rect x="320" y="432" width="280" height="24" rx="12" fill="#4F46E5" opacity="0.5"/>

    <!-- Stylized "F" -->
    <path d="M 360 550 L 360 720 L 400 720 L 400 650 L 580 650 L 580 610 L 400 610 L 400 590 L 620 590 L 620 550 Z"
          fill="#7C3AED" opacity="0.9"/>
  </g>
</svg>`;

const buildDir = path.join(__dirname, '..', 'build');
const iconsDir = path.join(buildDir, 'icons');

if (!fs.existsSync(buildDir)) {
  fs.mkdirSync(buildDir, { recursive: true });
}

if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

fs.writeFileSync(path.join(buildDir, 'icon.svg'), svg);
console.log('✅ SVG icon created at build/icon.svg');
