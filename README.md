# Devin Review extension

Cross-links PR pages between GitHub, Graphite, and Devin Review — each surface links to the other two:

- **GitHub** (`github.com/*/pull/*`): "Open in Graphite" + "Open in Devin" tabs in the PR tab bar, plus a fixed bottom-right pill with the same links and a Dismiss button
- **Graphite** (`app.graphite.com|dev/github/pr/*`): bottom-right pill with "Open in GitHub" + "Open in Devin"
- **Devin Review** (`devinreview.com` / `app.devin.ai/review/*` / `*.devinenterprise.com/review/*`): bottom-right pill with "Open in GitHub" + "Open in Graphite"

Dismiss hides the pill for 24 hours (stored in `chrome.storage.local`).

## Install

1. Open `chrome://extensions`
2. Enable Developer mode
3. "Load unpacked" → select this directory
