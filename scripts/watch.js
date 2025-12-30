const esbuild = require('esbuild');

function watchBundle(entryPoint, outFile, label) {
  return esbuild.build({
    entryPoints: [entryPoint],
    outfile: outFile,
    bundle: true,
    format: 'iife',
    platform: 'browser',
    target: ['es2017'],
    sourcemap: true,
    watch: {
      onRebuild(error) {
        if (error) {
          console.error(`[${label}] rebuild failed`, error);
        } else {
          console.log(`[${label}] rebuild succeeded`);
        }
      }
    }
  });
}

Promise.all([
  watchBundle('src/ytmd-pi.ts', 'bundle-pi.js', 'property-inspector'),
  watchBundle('src/ytmd.ts', 'bundle.js', 'plugin')
])
  .then(() => {
    console.log('Watching for changes...');
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
