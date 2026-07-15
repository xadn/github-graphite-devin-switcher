"use strict";

function parseGraphitePr(url) {
  try {
    const { pathname } = new URL(url);
    const match = pathname.match(/^\/github\/pr\/([^/]+)\/([^/]+)\/(\d+)/);
    if (!match) return null;
    return { owner: match[1], repo: match[2], number: match[3] };
  } catch {
    return null;
  }
}

observeAndRender(() => {
  const pr = parseGraphitePr(document.URL);
  if (!pr) {
    removeToast();
    return;
  }
  renderToast({ links: linksFor(pr, ["github", "devin"]) });
});
