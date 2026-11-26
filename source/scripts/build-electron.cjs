'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { prepare, digest } = require('./runtimes.cjs');
require('./build-electron-theme.cjs');
const root = path.resolve(__dirname, '..');
const spotify = process.argv.includes('--spotify');
const wrapper = spotify ? 'spotify-wrapper' : 'electron-wrapper';
const manifest = require(path.join(root, wrapper, 'package.json'));
const desktopID = manifest.desktopName.slice(0, -'.desktop'.length);
const icon = spotify ? desktopID : 'io.github.amzml.AmazonMusic';
const name = manifest.name + '-' + manifest.version;
const base = path.join(root, 'build', spotify ? 'spotify-rpm' : 'electron-rpm');
const stage = path.join(base, 'stage', name);
const payload = path.join(stage, 'payload');
const runtime = prepare();
fs.rmSync(stage, { recursive: true, force: true });
fs.mkdirSync(payload, { recursive: true });
const copy = (from, to) => fs.cpSync(from, to, { recursive: true });
copy(path.join(root, wrapper), path.join(payload, wrapper));
if (spotify) {
  fs.mkdirSync(path.join(payload, 'electron-wrapper'));
  for (const file of ['launch.cjs', 'system-theme.cjs', 'gtk-theme.node'])
    copy(path.join(root, 'electron-wrapper', file), path.join(payload, 'electron-wrapper', file));
}
fs.mkdirSync(path.join(payload, 'assets'));
for (const extension of ['.svg', '.png']) {
  const file = icon + extension;
  copy(path.join(root, 'assets', file), path.join(payload, 'assets', file));
}
fs.mkdirSync(path.join(payload, 'app'));
copy(path.join(root, 'app/desktop.cjs'), path.join(payload, 'app/desktop.cjs'));
fs.mkdirSync(path.join(payload, 'electron'));
for (const file of ['policy.cjs', 'media-preload.cjs']) copy(path.join(root, 'electron', file), path.join(payload, 'electron', file));
fs.mkdirSync(path.join(payload, 'tests'));
copy(path.join(root, 'tests/player_fixture.html'), path.join(payload, 'tests/player_fixture.html'));
copy(path.join(root, 'LICENSE'), path.join(payload, 'LICENSE'));
copy(runtime.electron, path.join(payload, 'runtime'));
// Bundle only the pure-JS D-Bus production dependency tree. Neither node-gtk
// nor its ABI-specific native binary belongs in this direct Electron wrapper.
function dependency(name, from, modules) {
  const manifest = require.resolve(name + '/package.json', { paths: [from] });
  const source = path.dirname(manifest), target = path.join(modules, name);
  fs.cpSync(source, target, { recursive: true, filter: file => path.basename(file) !== 'node_modules' });
  const pkg = JSON.parse(fs.readFileSync(manifest));
  for (const child of Object.keys(pkg.dependencies || {})) dependency(child, source, path.join(target, 'node_modules'));
}
dependency('dbus-next', root, path.join(payload, 'node_modules'));
for (const dir of ['BUILD', 'BUILDROOT', 'RPMS', 'SOURCES', 'SPECS', 'SRPMS', 'tmp'])
  fs.mkdirSync(path.join(base, dir), { recursive: true });
execFileSync('tar', ['-czf', path.join(base, 'SOURCES', name + '.tar.gz'), '-C', path.dirname(stage), name]);
const spec = path.join(base, 'SPECS', manifest.name + '.spec');
const substitutions = {
  NAME: manifest.name, PRODUCT: manifest.productName, VERSION: manifest.version,
  WRAPPER: wrapper, DESKTOP_ID: desktopID, ICON: icon,
  CHANGELOG: spotify
    ? `%changelog
* Wed Nov 25 2026 Spotify Web contributors - ${manifest.version}-1
- Use the official Spotify icon in the launcher and tray.

* Wed Nov 25 2026 Spotify Web contributors - 0.1.0-1
- Add the standalone Spotify web player with background audio and MPRIS.`
    : `%changelog
* Sat Oct 31 2026 Amazon Music Linux contributors - ${manifest.version}-1
- Follow desktop portal color-scheme updates and use Amazon Music as display name.
- Add a direct Electron window, tray controls, background audio and MPRIS.
- Bundle the verified CastLabs runtime; no installed browser required.`,
};
const template = fs.readFileSync(path.join(root, 'electron-wrapper/electron-player.spec.in'), 'utf8');
fs.writeFileSync(spec, template.replace(/@([A-Z_]+)@/g, (_match, key) => substitutions[key]));
const arch = { x64: 'x86_64', arm64: 'aarch64' }[process.arch];
execFileSync('rpmbuild', ['-bb', '--define', '_topdir ' + base, '--define', '_tmppath ' + path.join(base, 'tmp'),
  '--define', '_binary_payload w6T2.zstdio', '--target', arch, spec], { stdio: 'inherit' });
const dist = path.join(root, 'dist');
fs.mkdirSync(dist, { recursive: true });
for (const file of fs.readdirSync(path.join(base, 'RPMS', arch)).filter(file => file.startsWith(name + '-') && file.endsWith('.rpm'))) {
  const output = path.join(dist, file);
  fs.copyFileSync(path.join(base, 'RPMS', arch, file), output);
  fs.writeFileSync(output + '.sha256', digest(output) + '  ' + file + '\n');
  console.log('RPM:', output);
}
