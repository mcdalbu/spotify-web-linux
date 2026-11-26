# Build do Spotify Web

O build gera o RPM do cliente independente Spotify Web com Electron incluído.
Use um ambiente Fedora com Node.js 24, pnpm 11.25.0 e as ferramentas de
empacotamento abaixo. O pacote publicado foi construído no Fedora 45 x86_64.

## Dependências no Fedora

```sh
sudo dnf install git gcc gtk3-devel pkgconf-pkg-config rpm-build redhat-rpm-config curl tar gzip xz unzip
```

## Gerar o RPM

Na raiz do repositório clonado:

```sh
cd source
pnpm install --frozen-lockfile
pnpm run test
pnpm run build:rpm
```

O script baixa as versões fixadas do Node.js e do CastLabs Electron, verifica
os SHA-256 e compila a ponte GTK. O RPM e seu checksum ficam em `source/dist/`
(a pasta `dist/` a partir do diretório de build). Para validar o checksum:

```sh
cd dist
sha256sum -c ./*.sha256
```

Para iniciar o aplicativo durante o desenvolvimento, execute `pnpm run start`
no diretório `source` após o build, ou execute antes `pnpm run setup:runtimes`.
O teste de integração `pnpm run test:live` usa um perfil temporário e requer
uma sessão GNOME Wayland com suporte a ícones de bandeja e áudio.
