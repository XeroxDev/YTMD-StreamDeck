module.exports = {
    'sign': true,
    'commit-all': true,
    'bumpFiles': [
        {
            'filename': 'manifest.json',
            'updater': 'standard-version-updater/elgato-manifest.js',
        },
        {
            'filename': './package.json',
            'type': 'json'
        }
    ]
};
