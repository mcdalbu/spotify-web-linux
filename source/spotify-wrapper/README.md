# Spotify Web para Linux

Cliente independente com o player oficial em `open.spotify.com`, Electron incluído e
perfil próprio. O aplicativo aparece no lançador como **Spotify Web** e usa o
[ícone verde oficial do Spotify](https://developer.spotify.com/documentation/design#using-our-logo).

- Fechar a janela mantém a reprodução em segundo plano. Use **Sair** ou `Ctrl+Q`
  para encerrar o aplicativo.
- A bandeja permite abrir a janela, reproduzir ou pausar, avançar, voltar e
  silenciar. No GNOME, o ícone depende de um indicador disponível, como a
  extensão **AppIndicator and KStatusNotifierItem Support**.
- A integração MPRIS mostra a faixa e a capa no GNOME e disponibiliza os
  controles de reprodução.
- A janela e os menus acompanham a preferência clara ou escura do sistema.

## Fedora

```bash
sudo dnf install ./dist/spotify-web-electron-0.1.1-1.fc45.x86_64.rpm
spotify-web-electron
```

O RPM inclui CastLabs Electron. O runtime obtém o componente Widevine para
conteúdo protegido. A reprodução de música depende da conta Spotify e do
funcionamento do Widevine. Cliente não oficial.

## Desenvolvimento

Na raiz do projeto, com as dependências instaladas e os runtimes preparados:

```bash
./scripts/run-electron.sh --spotify
pnpm run test
./scripts/node.sh tests/electron-live.cjs --spotify
./scripts/node.sh scripts/build-electron.cjs --spotify
```
