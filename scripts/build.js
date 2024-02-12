const fs = require('fs');
const browserify = require('../node_modules/browserify');
const tsify = require('../node_modules/tsify');
const {minify_sync} = require('../node_modules/terser');
const {execSync} = require('child_process');
// Create release folder
console.log('Creating release folder');
if (fs.existsSync('build')) {
    execSync('rmdir /s /q build');
}
fs.mkdirSync('build');

// Create plugin folder
console.log('Creating plugin folder');
if (fs.existsSync('build/fun.shiro.ytmd.sdPlugin')) {
    execSync('rmdir /s /q build/fun.shiro.ytmd.sdPlugin');
}
fs.mkdirSync('build/fun.shiro.ytmd.sdPlugin');

// Build plugin
console.log('Building plugin');

// I know, this is a mess, but it works.
browserify({entries: ['src/ytmd-pi.ts'], plugin: [tsify]}).bundle((err, buf) => {
    if (err) {
        console.error(err);
        return;
    }
    const minified = minify_sync(buf.toString(), {
        mangle: {
            toplevel: true
        },
        output: {
            comments: false
        }
    });
    if (minified.error) {
        console.error(minified.error);
        return;
    }
    fs.writeFileSync('build/fun.shiro.ytmd.sdPlugin/bundle-pi.js', minified.code);

    browserify({entries: ['src/ytmd.ts'], plugin: [tsify]}).bundle((err, buf) => {
        if (err) {
            console.error(err);
            return;
        }
        const minified = minify_sync(buf.toString(), {
            mangle: {
                toplevel: true
            },
            output: {
                comments: false
            }
        });
        if (minified.error) {
            console.error(minified.error);
            return;
        }
        fs.writeFileSync('build/fun.shiro.ytmd.sdPlugin/bundle.js', minified.code);

        // Copy files
        console.log('Copying files');
        fs.copyFileSync('sdpi.css', 'build/fun.shiro.ytmd.sdPlugin/sdpi.css');
        fs.copyFileSync('manifest.json', 'build/fun.shiro.ytmd.sdPlugin/manifest.json');
        fs.copyFileSync('property-inspector.html', 'build/fun.shiro.ytmd.sdPlugin/property-inspector.html');
        fs.copyFileSync('action.html', 'build/fun.shiro.ytmd.sdPlugin/action.html');
        fs.cpSync('icons', 'build/fun.shiro.ytmd.sdPlugin/icons', {recursive: true});

        // Run distribution tool
        console.log('Running distribution tool');
        execSync('DistributionTool.exe -b -i build/fun.shiro.ytmd.sdPlugin -o build');

        // Clean up
        console.log('Cleaning up');
        fs.rmSync('build/fun.shiro.ytmd.sdPlugin', {recursive: true});

        // Done building release, check the build folder
        console.log('Done building release, check the build folder');
    });
});
