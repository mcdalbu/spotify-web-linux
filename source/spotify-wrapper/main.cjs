'use strict';

const { app } = require('electron');
const launch = require('../electron-wrapper/launch.cjs');
const { home, allowsNavigation, isPlayerURL, artworkURL } = require('./policy.cjs');

// The Spotify site serves its mobile landing page when it sees Electron's
// product tokens. Keep the real Chromium version and desktop platform.
app.userAgentFallback = app.userAgentFallback.replace(
  /^(.*?\(KHTML, like Gecko\)).*? (Chrome\/\S+).*? (Safari\/\S+)$/,
  '$1 $2 $3',
);

launch(require('./package.json'), {
  home,
  iconName: 'io.github.amzml.SpotifyWeb',
  busName: 'org.mpris.MediaPlayer2.spotify_web_electron',
  allowsNavigation,
  isPlayerURL,
  artworkURL,
});
