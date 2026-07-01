# Contagem

PWA simples para contar há quantos dias uma pessoa está sem consumir açúcar.

## Funcionalidades

- Campo para informar quantos dias está sem consumir açúcar.
- Botão para adicionar mais um dia.
- Botão para recomeçar a contagem.
- Persistência local no aparelho com `localStorage`.
- Celebrações progressivas em marcos de 5, 10, 50 e 100 dias.
- Contagem regressiva rápida ao recomeçar.
- Três frases motivacionais por dia, com histórico para evitar repetições recentes.
- Manifest e service worker para instalação como PWA.

## Tecnologias

- HTML
- CSS
- JavaScript
- PWA APIs: Web App Manifest, Service Worker e Cache API
- Canvas Confetti 1.9.4 para a animação de celebração

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

## Frases motivacionais

Edite o arquivo `motivational-quotes.js` para adicionar, remover ou ajustar as frases exibidas no rodapé do app.

## Deploy

O projeto é estático e pode ser publicado na Vercel sem build.
