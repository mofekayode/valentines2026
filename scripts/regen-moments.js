const fs = require('fs');
const path = require('path');

const mediaDir = path.join(__dirname, '..', 'public', 'media');
const dataDir = path.join(__dirname, '..', 'src', 'data');
const momentsPath = path.join(dataDir, 'moments.json');

// Get actual photo files
const photos = fs.readdirSync(mediaDir)
  .filter(f => /^photo_\d+\.jpg$/.test(f))
  .sort((a, b) => {
    const numA = parseInt(a.match(/\d+/)[0]);
    const numB = parseInt(b.match(/\d+/)[0]);
    return numA - numB;
  });

console.log('Found', photos.length, 'photos');
console.log('First 5:', photos.slice(0, 5).join(', '));

// Keep text moments only
let textMoments = [];
if (fs.existsSync(momentsPath)) {
  const existing = JSON.parse(fs.readFileSync(momentsPath, 'utf8'));
  textMoments = existing.filter(m => !m.image);
}
console.log('Keeping', textMoments.length, 'text moments');

// Create fresh photo moments IN ORDER
const photoMoments = photos.map((filename, i) => ({
  id: 'photo_' + String(i + 1).padStart(3, '0'),
  title: 'Moments',
  date: '2024-01-01',
  timestamp: 'Feb 2026',
  messages: [{ fromMe: false, text: '', time: '' }],
  image: {
    src: '/media/' + filename,
    filename: filename
  },
  tags: ['photo']
}));

// Save - text moments first, then photos in order
const allMoments = [...textMoments, ...photoMoments];
fs.writeFileSync(momentsPath, JSON.stringify(allMoments, null, 2));
console.log('Saved:', textMoments.length, 'text +', photoMoments.length, 'photos =', allMoments.length, 'total');
