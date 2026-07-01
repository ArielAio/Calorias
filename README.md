# Contagem

PWA simples para contar há quantos dias uma pessoa está sem consumir açúcar.

## Funcionalidades

- Campo para informar quantos dias está sem consumir açúcar.
- Botão para adicionar mais um dia.
- Botão para recomeçar a contagem.
- Persistência local no aparelho com `localStorage`.
- Manifest e service worker para instalação como PWA.

## Tecnologias

- HTML
- CSS
- JavaScript
- PWA APIs: Web App Manifest, Service Worker e Cache API

## Como executar

```bash
python3 -m http.server 4173
```

Depois abra:

```text
http://localhost:4173
```

## Como testar

```bash
npm test
```

## Deploy

O projeto é estático e pode ser publicado na Vercel sem build.
