const fs = require('fs');
const path = require('path');

const manifestPath = path.join('build', 'fun.shiro.ytmd.sdPlugin', 'manifest.json');

if (!fs.existsSync(manifestPath)) {
  console.error(`Manifest not found at ${manifestPath}`);
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
if ('URL' in manifest) {
  delete manifest.URL;
}
if (typeof manifest.Version === 'string') {
  const parts = manifest.Version.split('.');
  while (parts.length < 4) {
    parts.push('0');
  }
  manifest.Version = parts.slice(0, 4).join('.');
}

fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log('Prepared manifest for Stream Deck CLI (URL removed, version padded).');
