"use strict";

function parseGitHubPr(url) {
  try {
    const { pathname } = new URL(url);
    const match = pathname.match(/^\/([^/]+)\/([^/]+)\/pull\/(\d+)/);
    if (!match) return null;
    return { owner: match[1], repo: match[2], number: match[3] };
  } catch {
    return null;
  }
}

function findTabList() {
  const newUi = document
    .querySelector('[aria-label="Pull request navigation tabs"]')
    ?.querySelector('[role="tablist"]');
  if (newUi) return { tabList: newUi, isNewUi: true };
  const oldUi =
    document.querySelector('[aria-label="Pull request tabs"]') ??
    document.querySelector(".tabnav-tabs");
  return oldUi ? { tabList: oldUi, isNewUi: false } : null;
}

function styleTab(tab, tabList, isNewUi) {
  tab.removeAttribute("aria-current");
  tab.setAttribute("aria-selected", "false");
  if (!isNewUi) {
    tab.className = "tabnav-tab flex-shrink-0";
    return;
  }
  const siblings = Array.from(
    tabList.querySelectorAll(`a:not([id^="${TAB_ID_PREFIX}"])`)
  );
  const template =
    siblings.find(
      (s) =>
        s.getAttribute("aria-selected") !== "true" &&
        !s.hasAttribute("aria-current")
    ) ?? siblings[0];
  if (!template) return;
  tab.className = template.className
    .split(/\s+/)
    .filter((c) => c !== "active" && c !== "selected")
    .join(" ");
  tab.setAttribute("role", template.getAttribute("role") ?? "tab");
}

function renderTabs(links) {
  const found = findTabList();
  if (!found) return;
  const { tabList, isNewUi } = found;

  for (const link of links) {
    const id = TAB_ID_PREFIX + link.key;
    const existing = document.getElementById(id);
    if (existing) {
      styleTab(existing, tabList, isNewUi);
      if (existing.href !== link.href) existing.href = link.href;
      continue;
    }
    const tab = document.createElement("a");
    tab.id = id;
    tab.href = link.href;
    tab.title = link.label;
    styleTab(tab, tabList, isNewUi);
    tab.innerHTML = ICON_SVG;
    tab.appendChild(document.createTextNode(link.label));
    tabList.appendChild(tab);
  }
}

observeAndRender(() => {
  const pr = parseGitHubPr(document.URL);
  if (!pr) {
    removeToast();
    return;
  }
  const links = linksFor(pr, ["graphite", "devin"]);
  renderTabs(links);
  renderToast({ links });
});
