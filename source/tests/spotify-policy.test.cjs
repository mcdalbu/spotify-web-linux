'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { cleanMedia } = require('../electron/policy.cjs');
const { home, allowsNavigation, isPlayerURL, artworkURL } = require('../spotify-wrapper/policy.cjs');

test('Spotify navigation trusts the player and first-party login, with DRM restricted to the player', () => {
  assert.ok(isPlayerURL(home));
  assert.ok(allowsNavigation('https://accounts.spotify.com/pt-BR/login'));
  assert.ok(!isPlayerURL('https://accounts.spotify.com/pt-BR/login'));
  for (const url of ['http://open.spotify.com', 'https://open.spotify.com:444', 'https://open.spotify.com.evil.invalid',
    'https://open.spotify.com@evil.invalid', 'https://user@open.spotify.com', 'https://www.spotify.com']) {
    assert.ok(!allowsNavigation(url), url);
  }
});

test('Spotify track covers are accepted using the Spotify artwork policy', () => {
  const artwork = 'https://i.scdn.co/image/cover';
  assert.equal(cleanMedia({ available: true, paused: false, artwork }, artworkURL).artwork, artwork);
  assert.equal(cleanMedia({ available: true, paused: false, artwork }).artwork, '');
  assert.equal(artworkURL('https://image-cdn-ak.spotifycdn.com/image/cover'), 'https://image-cdn-ak.spotifycdn.com/image/cover');
  assert.equal(artworkURL('https://i.scdn.co.evil.invalid/image/cover'), '');
  assert.equal(artworkURL('http://i.scdn.co/image/cover'), '');
});
