"use strict";

const TOAST_ID = "pr-crosslinks-toast";
const TAB_ID_PREFIX = "pr-crosslink-tab-";
const DISMISSED_AT_KEY = "pr-crosslinks-toast-dismissed-at";
const DISMISS_COOLDOWN_MS = 24 * 60 * 60 * 1000;

const ICON_SVG =
  '<svg style="margin-right: 6px; vertical-align: text-bottom;" xmlns="http://www.w3.org/2000/svg" height="16" width="16" viewBox="0 0 16 16"><path fill="currentColor" d="M8 0l2.2 4.5L15 5.2l-3.5 3.4.8 4.9L8 11.2l-4.3 2.3.8-4.9L1 5.2l4.8-.7L8 0z"/></svg>';

const DESTINATIONS = {
  github: {
    key: "github",
    label: "Open in GitHub",
    url: ({ owner, repo, number }) =>
      `https://github.com/${owner}/${repo}/pull/${number}`,
  },
  graphite: {
    key: "graphite",
    label: "Open in Graphite",
    url: ({ owner, repo, number }) =>
      `https://app.graphite.com/github/pr/${owner}/${repo}/${number}`,
  },
  devin: {
    key: "devin",
    label: "Open in Devin",
    url: ({ owner, repo, number }) =>
      `https://devinreview.com/${owner}/${repo}/pull/${number}`,
  },
};

function linksFor(pr, keys) {
  return keys.map((key) => ({
    key,
    label: DESTINATIONS[key].label,
    href: DESTINATIONS[key].url(pr),
  }));
}

function debounce(fn, delayMs) {
  let timer = null;
  return () => {
    if (timer !== null) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      fn();
    }, delayMs);
  };
}

function observeAndRender(render) {
  const scheduled = debounce(render, 100);
  render();
  new MutationObserver(scheduled).observe(document, {
    childList: true,
    subtree: true,
  });
}

async function isToastDismissed() {
  try {
    const stored = await chrome.storage.local.get(DISMISSED_AT_KEY);
    const dismissedAt = stored[DISMISSED_AT_KEY];
    if (typeof dismissedAt !== "number") return false;
    const elapsed = Date.now() - dismissedAt;
    return elapsed < 0 || elapsed < DISMISS_COOLDOWN_MS;
  } catch {
    return false;
  }
}

function renderToast({ links }) {
  const existing = document.getElementById(TOAST_ID);
  if (existing) {
    for (const link of links) {
      const el = existing.querySelector(`a[data-key="${link.key}"]`);
      if (el && el.href !== link.href) el.href = link.href;
    }
    return;
  }

  isToastDismissed().then((dismissed) => {
    if (dismissed || document.getElementById(TOAST_ID)) return;

    const toast = document.createElement("div");
    toast.id = TOAST_ID;
    Object.assign(toast.style, {
      position: "fixed",
      right: "16px",
      bottom: "16px",
      zIndex: "2147483647",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      padding: "8px",
      borderRadius: "8px",
      border: "1px solid rgba(140, 149, 159, 0.35)",
      background: window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "#161b22"
        : "#ddf4ff",
      boxShadow: "0 8px 24px rgba(140, 149, 159, 0.2)",
      font: "14px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    });

    const buttonStyle = {
      padding: "5px 16px",
      borderRadius: "6px",
      border: "1px solid rgba(140, 149, 159, 0.35)",
      cursor: "pointer",
      font: "inherit",
      fontWeight: "500",
      textDecoration: "none",
      whiteSpace: "nowrap",
    };

    const dismiss = document.createElement("button");
    dismiss.type = "button";
    dismiss.textContent = "Dismiss";
    Object.assign(dismiss.style, buttonStyle, {
      background: "transparent",
      color: "inherit",
    });
    dismiss.addEventListener("click", () => {
      chrome.storage.local.set({ [DISMISSED_AT_KEY]: Date.now() });
      toast.remove();
    });
    toast.appendChild(dismiss);

    for (const link of links) {
      const el = document.createElement("a");
      el.href = link.href;
      el.dataset.key = link.key;
      el.textContent = link.label;
      Object.assign(el.style, buttonStyle, {
        background: "#1f883d",
        borderColor: "#1f883d",
        color: "#ffffff",
      });
      toast.appendChild(el);
    }

    document.body.appendChild(toast);
  });
}

function removeToast() {
  const toast = document.getElementById(TOAST_ID);
  if (toast) toast.remove();
}
