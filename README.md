# Wilder Customs

Static marketing site for Wilder Customs (vintage 4x4 sales).

## Structure
```
index.html      Page markup
css/style.css   All styles
js/main.js      Listings data + interactivity (gallery, filters, detail view)
```

All vehicle photos are embedded as base64 data URIs directly inside `js/main.js`
(in the `LISTINGS` array), so there are no external image files to manage —
the site is fully self-contained.

## Running locally
Just open `index.html` in a browser, or serve the folder:
```
npx serve .
```

## Deploying to GitHub Pages
1. Push this repo to GitHub (make sure `index.html` sits at the repo root, or
   in a `/docs` folder if you configure Pages that way).
2. In your repo: **Settings → Pages**.
3. Under "Build and deployment", set **Source** to `Deploy from a branch`.
4. Pick the branch (usually `main`) and folder (`/root` or `/docs`), then **Save**.
5. GitHub will publish at `https://<your-username>.github.io/<repo-name>/`
   within a minute or two.

No build step, no dependencies — it's plain HTML/CSS/JS.
