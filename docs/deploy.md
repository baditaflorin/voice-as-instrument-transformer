# Deploy

Live site:

https://baditaflorin.github.io/voice-as-instrument-transformer/

Repository:

https://github.com/baditaflorin/voice-as-instrument-transformer

## Publish

```bash
npm run deploy:pages
```

This builds `dist/`, creates `404.html` for SPA fallback, writes `.nojekyll`, and publishes `dist/` to the `gh-pages` branch.

## GitHub Pages Settings

Pages source: `gh-pages` branch, `/` root.

Base path: `/voice-as-instrument-transformer/`.

## Rollback

Find the previous `gh-pages` commit and force-publish that tree, or revert the Pages publish commit:

```bash
git fetch origin gh-pages
git checkout gh-pages
git revert <publish_commit_sha>
git push origin gh-pages
git checkout main
```

## Custom Domain

No custom domain is configured in v0.1.0. If one is added, place `CNAME` in `public/` so it is copied into the Pages build and configure DNS with GitHub Pages according to:

https://docs.github.com/pages/configuring-a-custom-domain-for-your-github-pages-site
