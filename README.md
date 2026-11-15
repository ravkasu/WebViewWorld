# WebView World

WebView World is a responsive website studio dashboard. The home page keeps website projects in one place, opens the live photography portfolio, and lets you add and edit draft website cards by category. Draft cards are saved in the browser's local storage.

## Run locally

```bash
npm install
npm start
```

Open `http://localhost:4200/` for the dashboard. The current live Website 1 portfolio is available at `http://localhost:4200/website-1`.
New website cards can include an optional `http://` or `https://` link, which opens in a new tab.

## Build and test

```bash
npm run build
npm test -- --watch=false
```

## Images

Photos are stored locally in [`public/images`](./public/images). The current portfolio is implemented in `src/app/portfolio-page.component.ts` and `src/app/portfolio-page.component.html`.

## Deployment

Pushing to `master` builds and deploys the site to GitHub Pages at `https://ravkasu.github.io/WebViewWorld/`.
