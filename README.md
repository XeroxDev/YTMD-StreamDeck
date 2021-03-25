# 1. Table of content
- [1. Table of content](#1-table-of-content)
- [2. Badges](#2-badges)
- [3. What is this Plugin?](#3-what-is-this-plugin)
- [4. Actions](#4-actions)
- [5. How to use it?](#5-how-to-use-it)
- [6. How to contribute?](#6-how-to-contribute)

# 2. Badges
[![Forks](https://img.shields.io/github/forks/XeroxDev/YTMD-StreamDeck?color=blue&style=for-the-badge)](https://github.com/XeroxDev/YTMD-StreamDeck/network/members)
[![Stars](https://img.shields.io/github/stars/XeroxDev/YTMD-StreamDeck?color=yellow&style=for-the-badge)](https://github.com/XeroxDev/YTMD-StreamDeck/stargazers)
[![Watchers](https://img.shields.io/github/watchers/XeroxDev/YTMD-StreamDeck?color=lightgray&style=for-the-badge)](https://github.com/XeroxDev/YTMD-StreamDeck/watchers)
[![Contributors](https://img.shields.io/github/contributors/XeroxDev/YTMD-StreamDeck?color=green&style=for-the-badge)](https://github.com/XeroxDev/YTMD-StreamDeck/graphs/contributors)

[![Issues](https://img.shields.io/github/issues/XeroxDev/YTMD-StreamDeck?color=yellow&style=for-the-badge)](https://github.com/XeroxDev/YTMD-StreamDeck/issues)
[![Issues closed](https://img.shields.io/github/issues-closed/XeroxDev/YTMD-StreamDeck?color=yellow&style=for-the-badge)](https://github.com/XeroxDev/YTMD-StreamDeck/issues?q=is%3Aissue+is%3Aclosed)

[![Issues-pr](https://img.shields.io/github/issues-pr/XeroxDev/YTMD-StreamDeck?color=yellow&style=for-the-badge)](https://github.com/XeroxDev/YTMD-StreamDeck/pulls)
[![Issues-pr closed](https://img.shields.io/github/issues-pr-closed/XeroxDev/YTMD-StreamDeck?color=yellow&style=for-the-badge)](https://github.com/XeroxDev/YTMD-StreamDeck/pulls?q=is%3Apr+is%3Aclosed)
[![PRs welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=for-the-badge)](https://github.com/XeroxDev/YTMD-StreamDeck/compare)

[![Build](https://img.shields.io/github/workflow/status/XeroxDev/YTMD-StreamDeck/CI-CD?style=for-the-badge)](https://github.com/XeroxDev/YTMD-StreamDeck/actions?query=workflow%3A%22CI-CD%22)
[![Release](https://img.shields.io/github/release/XeroxDev/YTMD-StreamDeck?color=black&style=for-the-badge)](https://github.com/XeroxDev/YTMD-StreamDeck/releases)
![Codecov](https://img.shields.io/codecov/c/github/XeroxDev/YTMD-StreamDeck?style=for-the-badge)

[![Downloads](https://img.shields.io/github/downloads/XeroxDev/YTMD-StreamDeck/total.svg?color=cyan&style=for-the-badge&logo=github)]()
[![Downloads Elgato](https://img.shields.io/badge/dynamic/json?color=cyan&label=Elgato%20Downloads&query=ytmd&style=for-the-badge&url=https%3A%2F%2Fapi.xeroxdev.de%2Fpublic%2Felgato-downloads.json)]()

[![Awesome Badges](https://img.shields.io/badge/badges-awesome-green?style=for-the-badge)](https://shields.io)

# 3. What is this Plugin?
This Stream Deck Plugin allows you to control the YouTube Music Desktop
App [YouTube Music Desktop App](https://github.com/ytmdesktop/ytmdesktop)

# 4. Actions

- Play / Pause Track
- Next Track
- Previous Track
- Like Track
- Dislike Track
- Volume Mute
- Volume Down
- Volume Up
- Track Info
    - Shows a scrolling text for album, title and author
    - Shows the thumbnail of the track

# 5. How to use it?

1. Install the [YouTube Music Desktop App](https://github.com/ytmdesktop/ytmdesktop).
2. Install the Plugin from [Releases](https://github.com/XeroxDev/YTMD-StreamDeck/releases) or from the official Stream
   Deck Store.
3. Add Actions to Stream Deck.
4. Activate the Companion Server / Remote control from YTMD App
    - Settings > Integration > "Enable Companion Server" or "Remote control" (Should be the first entry with an open icon)
6. Click on the open Icon or go to http://localhost:9863/ (Default)
7. Optional: Activate password protection. else go to 7.
8. Click on Play/Pause button.
9. Add all settings. (Host, Port, Password)
10. Click save

# 6. How to contribute?

Just fork the repository and create PR's, but we use
[standard-version](https://github.com/conventional-changelog/standard-version) to optimal release the plugin.

standard-version is following the [conventionalcommits](https://www.conventionalcommits.org) specification which follows
the
[angular commit guidelines](https://github.com/angular/angular/blob/22b96b9/CONTRIBUTING.md#-commit-message-guidelines)

[Here](https://kapeli.com/cheat_sheets/Conventional_Commits.docset/Contents/Resources/Documents/index) is a neat little cheatsheet for Conventional Commits