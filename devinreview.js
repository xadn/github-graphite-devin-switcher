"use strict";

function parseDevinReviewPr(url) {
  try {
    const { pathname } = new URL(url);
    const match = pathname.match(/^(?:\/review)?\/([^/]+)\/([^/]+)\/pull\/(\d+)/);
    if (!match) return null;
    return { owner: match[1], repo: match[2], number: match[3] };
  } catch {
    return null;
  }
}

observeAndRender(() => {
  const pr = parseDevinReviewPr(document.URL);
  if (!pr) {
    removeToast();
    return;
  }
  renderToast({ links: linksFor(pr, ["github", "graphite"]) });
});
