// Simple script to generate placeholder icons
const fs = require('fs');
const path = require('path');

// Create a simple SVG icon
const svgIcon = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <rect width="512" height="512" fill="#10b981"/>
  <text x="256" y="280" font-family="Arial" font-size="180" font-weight="bold" text-anchor="middle" fill="white">や</text>
</svg>
`;

// Save SVG
fs.writeFileSync(path.join(__dirname, '..', 'public', 'icon.svg'), svgIcon.trim());

console.log('Basic icon created as icon.svg');
console.log('For production, replace with proper icons');