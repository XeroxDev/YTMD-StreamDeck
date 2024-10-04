# Changelog

## [3.0.0](https://github.com/XeroxDev/YTMD-StreamDeck/compare/v2.2.0...v3.0.0) (2024-10-04)


### ⚠ BREAKING CHANGES

* migrate to v2 of ytmdesktop ([#98](https://github.com/XeroxDev/YTMD-StreamDeck/issues/98))

### Features

* add automatic vol change while key pressed ([a925cd0](https://github.com/XeroxDev/YTMD-StreamDeck/commit/a925cd0a5060c10dbaf7072fb455950452565a84))
* add better error logging ([6408555](https://github.com/XeroxDev/YTMD-StreamDeck/commit/6408555e11cd6bbc16c70a6608bbd1208cf95ca4))
* add display settings ([95aecfd](https://github.com/XeroxDev/YTMD-StreamDeck/commit/95aecfde6b8b0b8333a4bd231c0b41ea9e022a8e))
* add english translation file ([ebc6243](https://github.com/XeroxDev/YTMD-StreamDeck/commit/ebc6243007e1b45a94624591865154e24496e550))
* add French translation ([#102](https://github.com/XeroxDev/YTMD-StreamDeck/issues/102)) ([cfca17a](https://github.com/XeroxDev/YTMD-StreamDeck/commit/cfca17a615a429eb3189e095fe037e6b93d1c784))
* add German translation for manifest ([b09fddc](https://github.com/XeroxDev/YTMD-StreamDeck/commit/b09fddcc6b9bb046c99a73ad087530c575c538c0))
* add library action ([574cb55](https://github.com/XeroxDev/YTMD-StreamDeck/commit/574cb552fab057517a8de1e91cf7cf746fa0056e)), closes [#50](https://github.com/XeroxDev/YTMD-StreamDeck/issues/50)
* add localization support for PI ([dd728a3](https://github.com/XeroxDev/YTMD-StreamDeck/commit/dd728a3c33252b41f47f0a5768ed9c5ba4348ddf))
* add repeat action ([3fc6c11](https://github.com/XeroxDev/YTMD-StreamDeck/commit/3fc6c11c19671d3622e0a2e57decc2db68b17bbf))
* add select dropdown to play-pause action ([d9590cd](https://github.com/XeroxDev/YTMD-StreamDeck/commit/d9590cdf510d23fbcda557b7987ea2d51a89628f)), closes [#44](https://github.com/XeroxDev/YTMD-StreamDeck/issues/44)
* add shuffle action ([3ddd44a](https://github.com/XeroxDev/YTMD-StreamDeck/commit/3ddd44a64adf595f1bd3e40ec16b9cde519cc074))
* add streamdeck+ support ([ba5e573](https://github.com/XeroxDev/YTMD-StreamDeck/commit/ba5e5736898c8e296f8900c5c432afcf9a969dcd))
* migrate to v2 of ytmdesktop ([#98](https://github.com/XeroxDev/YTMD-StreamDeck/issues/98)) ([67b67ad](https://github.com/XeroxDev/YTMD-StreamDeck/commit/67b67ad9a5a916c45e1ab933af55f7084540964e))
* now show "Paused" or "N/A" if paused or N/A ([d821e08](https://github.com/XeroxDev/YTMD-StreamDeck/commit/d821e087be89ca07ddbe27a9d3fd2e4a0b2c76da))
* show cover while paused ([d386607](https://github.com/XeroxDev/YTMD-StreamDeck/commit/d3866074767d58cd55d5e26f9698c92a1b11041d)), closes [#43](https://github.com/XeroxDev/YTMD-StreamDeck/issues/43)


### Bug Fixes

* add missing noopener ([d5eb8d7](https://github.com/XeroxDev/YTMD-StreamDeck/commit/d5eb8d700e148f5a21c97b91da5efa942f1f9e22))
* add monospaced font to song info ([840e8f3](https://github.com/XeroxDev/YTMD-StreamDeck/commit/840e8f3018a6c4b7eb59255fef5cefa3d8f5b5d9))
* english grammar issues. ([6b6b8b4](https://github.com/XeroxDev/YTMD-StreamDeck/commit/6b6b8b4d933821da0f29f1f505e6779e2b60ee8a))
* **likedislike:** ignore unknown state for like/dislike state due to ytmd native issues ([#121](https://github.com/XeroxDev/YTMD-StreamDeck/issues/121)) ([36b44eb](https://github.com/XeroxDev/YTMD-StreamDeck/commit/36b44eb7252c63c523ba52809199bae0b1d0f5f1)), closes [#116](https://github.com/XeroxDev/YTMD-StreamDeck/issues/116)
* missing actions in property inspector ([ad39dd8](https://github.com/XeroxDev/YTMD-StreamDeck/commit/ad39dd8677306601f0d5b169a99b39856d643fd9))
* missing translation file causes crash ([716c464](https://github.com/XeroxDev/YTMD-StreamDeck/commit/716c464578b291cfdff41f52fb88fbc074541373))
* mute/unmute just mutes ([64d546d](https://github.com/XeroxDev/YTMD-StreamDeck/commit/64d546dab289078e9c58c5760c1ac727261fa85e))
* now the like action likes the track and not dislikes it ([61dd86f](https://github.com/XeroxDev/YTMD-StreamDeck/commit/61dd86f09f129afbde69878601d834c1531d8a06))
* **pi:** settings don't get auto-populated ([7e4d781](https://github.com/XeroxDev/YTMD-StreamDeck/commit/7e4d7818c4854fdf09c644564dec3f7aa7895c6e)), closes [#115](https://github.com/XeroxDev/YTMD-StreamDeck/issues/115)
* remove leak in mute action ([9c1c6a6](https://github.com/XeroxDev/YTMD-StreamDeck/commit/9c1c6a64e920bc126e3faf1ad9c0b77f597ae980))
* repeat mode only disables ([20c89d1](https://github.com/XeroxDev/YTMD-StreamDeck/commit/20c89d1e0d4f29bcf6ad64977dbeef9926972623))
* track info breaks when adding two instances ([cd33b8d](https://github.com/XeroxDev/YTMD-StreamDeck/commit/cd33b8da4ad36c46bd14324cab0ebe7afc9acf8f))
* update information correctly on profile switch ([6f56ca0](https://github.com/XeroxDev/YTMD-StreamDeck/commit/6f56ca0243fd1b83439cd41c397ea935da98866c))
* variables are wrong calculated ([083a2dd](https://github.com/XeroxDev/YTMD-StreamDeck/commit/083a2dd40bcd6d461e806b3d52a972c25637e1cf))
* volume should update correclty ([632bf34](https://github.com/XeroxDev/YTMD-StreamDeck/commit/632bf342864169e3c84b7f2b20494698a7b167ec))


### Reverts

* commit 1e449b217c822587c28ba54110f68ea9bd7ad013 ([a3e78a9](https://github.com/XeroxDev/YTMD-StreamDeck/commit/a3e78a99e3ac436e44cd70346eaeccf7610455ac))

## [2.2.0](https://github.com/XeroxDev/YTMD-StreamDeck/compare/v2.1.1...v2.2.0) (2024-08-18)


### Features

* add streamdeck+ support ([ba5e573](https://github.com/XeroxDev/YTMD-StreamDeck/commit/ba5e5736898c8e296f8900c5c432afcf9a969dcd))


### Bug Fixes

* english grammar issues. ([6b6b8b4](https://github.com/XeroxDev/YTMD-StreamDeck/commit/6b6b8b4d933821da0f29f1f505e6779e2b60ee8a))

## [2.1.1](https://github.com/XeroxDev/YTMD-StreamDeck/compare/v2.1.0...v2.1.1) (2024-06-06)


### Bug Fixes

* **likedislike:** ignore unknown state for like/dislike state due to ytmd native issues ([#121](https://github.com/XeroxDev/YTMD-StreamDeck/issues/121)) ([36b44eb](https://github.com/XeroxDev/YTMD-StreamDeck/commit/36b44eb7252c63c523ba52809199bae0b1d0f5f1)), closes [#116](https://github.com/XeroxDev/YTMD-StreamDeck/issues/116)
* **pi:** settings don't get auto-populated ([7e4d781](https://github.com/XeroxDev/YTMD-StreamDeck/commit/7e4d7818c4854fdf09c644564dec3f7aa7895c6e)), closes [#115](https://github.com/XeroxDev/YTMD-StreamDeck/issues/115)

## [2.1.0](https://github.com/XeroxDev/YTMD-StreamDeck/compare/v2.0.0...v2.1.0) (2024-02-14)


### Features

* add better error logging ([6408555](https://github.com/XeroxDev/YTMD-StreamDeck/commit/6408555e11cd6bbc16c70a6608bbd1208cf95ca4))
* add French translation ([#102](https://github.com/XeroxDev/YTMD-StreamDeck/issues/102)) ([cfca17a](https://github.com/XeroxDev/YTMD-StreamDeck/commit/cfca17a615a429eb3189e095fe037e6b93d1c784))


### Bug Fixes

* missing actions in property inspector ([ad39dd8](https://github.com/XeroxDev/YTMD-StreamDeck/commit/ad39dd8677306601f0d5b169a99b39856d643fd9))
* missing translation file causes crash ([716c464](https://github.com/XeroxDev/YTMD-StreamDeck/commit/716c464578b291cfdff41f52fb88fbc074541373))
* mute/unmute just mutes ([64d546d](https://github.com/XeroxDev/YTMD-StreamDeck/commit/64d546dab289078e9c58c5760c1ac727261fa85e))
* repeat mode only disables ([20c89d1](https://github.com/XeroxDev/YTMD-StreamDeck/commit/20c89d1e0d4f29bcf6ad64977dbeef9926972623))
* track info breaks when adding two instances ([cd33b8d](https://github.com/XeroxDev/YTMD-StreamDeck/commit/cd33b8da4ad36c46bd14324cab0ebe7afc9acf8f))
* variables are wrong calculated ([083a2dd](https://github.com/XeroxDev/YTMD-StreamDeck/commit/083a2dd40bcd6d461e806b3d52a972c25637e1cf))

## [2.0.0](https://github.com/XeroxDev/YTMD-StreamDeck/compare/v1.7.0...v2.0.0) (2024-02-12)


### ⚠ BREAKING CHANGES

* remove library action (not available anymore)
* migrate to v2 of ytmdesktop

### Features

* add discord link to help section ([67b67ad](https://github.com/XeroxDev/YTMD-StreamDeck/commit/67b67ad9a5a916c45e1ab933af55f7084540964e))
* add more translations ([67b67ad](https://github.com/XeroxDev/YTMD-StreamDeck/commit/67b67ad9a5a916c45e1ab933af55f7084540964e))
* migrate to v2 of ytmdesktop ([67b67ad](https://github.com/XeroxDev/YTMD-StreamDeck/commit/67b67ad9a5a916c45e1ab933af55f7084540964e))


### Bug Fixes

* remove library action (not available anymore) ([67b67ad](https://github.com/XeroxDev/YTMD-StreamDeck/commit/67b67ad9a5a916c45e1ab933af55f7084540964e))

## [1.7.0](https://github.com/XeroxDev/YTMD-StreamDeck/compare/v1.6.0...v1.7.0) (2023-04-03)


### Features

* add display settings ([95aecfd](https://github.com/XeroxDev/YTMD-StreamDeck/commit/95aecfde6b8b0b8333a4bd231c0b41ea9e022a8e)), closes [#48](https://github.com/XeroxDev/YTMD-StreamDeck/issues/48)
* add library action ([574cb55](https://github.com/XeroxDev/YTMD-StreamDeck/commit/574cb552fab057517a8de1e91cf7cf746fa0056e)), closes [#50](https://github.com/XeroxDev/YTMD-StreamDeck/issues/50)

## [1.6.0](https://github.com/XeroxDev/YTMD-StreamDeck/compare/v1.5.3...v1.6.0) (2022-03-31)


### Features

* add select dropdown to play-pause action ([d9590cd](https://github.com/XeroxDev/YTMD-StreamDeck/commit/d9590cdf510d23fbcda557b7987ea2d51a89628f)), closes [#44](https://github.com/XeroxDev/YTMD-StreamDeck/issues/44)
* show cover while paused ([d386607](https://github.com/XeroxDev/YTMD-StreamDeck/commit/d3866074767d58cd55d5e26f9698c92a1b11041d)), closes [#43](https://github.com/XeroxDev/YTMD-StreamDeck/issues/43)


### Bug Fixes

* add missing noopener ([d5eb8d7](https://github.com/XeroxDev/YTMD-StreamDeck/commit/d5eb8d700e148f5a21c97b91da5efa942f1f9e22))

### [1.5.3](https://github.com/XeroxDev/YTMD-StreamDeck/compare/v1.5.2...v1.5.3) (2021-11-27)


### Bug Fixes

* update information correctly on profile switch ([6f56ca0](https://github.com/XeroxDev/YTMD-StreamDeck/commit/6f56ca0243fd1b83439cd41c397ea935da98866c))

### [1.5.2](https://github.com/XeroxDev/YTMD-StreamDeck/compare/v1.5.1...v1.5.2) (2021-08-20)


### Bug Fixes

* volume should update correclty ([632bf34](https://github.com/XeroxDev/YTMD-StreamDeck/commit/632bf342864169e3c84b7f2b20494698a7b167ec))

### [1.5.1](https://github.com/XeroxDev/YTMD-StreamDeck/compare/v1.5.0...v1.5.1) (2021-06-01)

## [1.5.0](https://github.com/XeroxDev/YTMD-StreamDeck/compare/v1.4.0...v1.5.0) (2021-03-27)


### Features

* add automatic vol change while key pressed ([a925cd0](https://github.com/XeroxDev/YTMD-StreamDeck/commit/a925cd0a5060c10dbaf7072fb455950452565a84))
* add repeat action ([3fc6c11](https://github.com/XeroxDev/YTMD-StreamDeck/commit/3fc6c11c19671d3622e0a2e57decc2db68b17bbf))
* add shuffle action ([3ddd44a](https://github.com/XeroxDev/YTMD-StreamDeck/commit/3ddd44a64adf595f1bd3e40ec16b9cde519cc074))


### Bug Fixes

* add monospaced font to song info ([840e8f3](https://github.com/XeroxDev/YTMD-StreamDeck/commit/840e8f3018a6c4b7eb59255fef5cefa3d8f5b5d9))
* now the like action likes the track and not dislikes it ([61dd86f](https://github.com/XeroxDev/YTMD-StreamDeck/commit/61dd86f09f129afbde69878601d834c1531d8a06))
* remove leak in mute action ([9c1c6a6](https://github.com/XeroxDev/YTMD-StreamDeck/commit/9c1c6a64e920bc126e3faf1ad9c0b77f597ae980))

## [1.4.0](https://github.com/XeroxDev/YTMD-StreamDeck/compare/v1.3.0...v1.4.0) (2021-03-07)


### Features

* add english translation file ([ebc6243](https://github.com/XeroxDev/YTMD-StreamDeck/commit/ebc6243007e1b45a94624591865154e24496e550))
* add German translation for manifest ([b09fddc](https://github.com/XeroxDev/YTMD-StreamDeck/commit/b09fddcc6b9bb046c99a73ad087530c575c538c0))
* add localization support for PI ([dd728a3](https://github.com/XeroxDev/YTMD-StreamDeck/commit/dd728a3c33252b41f47f0a5768ed9c5ba4348ddf))
* now show "Paused" or "N/A" if paused or N/A ([d821e08](https://github.com/XeroxDev/YTMD-StreamDeck/commit/d821e087be89ca07ddbe27a9d3fd2e4a0b2c76da))
