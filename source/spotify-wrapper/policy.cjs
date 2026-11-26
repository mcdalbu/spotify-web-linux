'use strict';

const { parseHttps, safeArtworkURL } = require('../electron/policy.cjs');
const home = 'https://open.spotify.com/';

function isPlayerURL(raw) {
  return parseHttps(raw)?.hostname === 'open.spotify.com';
}

function allowsNavigation(raw) {
  return isPlayerURL(raw) || parseHttps(raw)?.hostname === 'accounts.spotify.com';
}

function artworkURL(raw) {
  return safeArtworkURL(raw, ['scdn.co', 'spotifycdn.com']);
}

module.exports = { home, isPlayerURL, allowsNavigation, artworkURL };
