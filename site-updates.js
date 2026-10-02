(function () {
  'use strict';
  const releases = Array.isArray(window.SITE_UPDATES) ? window.SITE_UPDATES : [];
  const panel = document.getElementById('siteUpdates');
  if (!panel || !releases.length) return;

  const storageKey = 'lad_readSiteUpdates';
  const toggle = document.getElementById('updatesToggle');
  const content = document.getElementById('updatesContent');
  const badge = document.getElementById('updatesUnread');
  const readButton = document.getElementById('updatesRead');
  let readIds = [];
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    if (Array.isArray(saved)) readIds = saved;
  } catch (_) { /* Storage may be disabled; the notice still works. */ }

  function renderRelease(release, showDate = true) {
    const article = document.createElement('article');
    article.className = 'update-release';
    const date = document.createElement('time');
    date.dateTime = release.date;
    date.textContent = release.date.replaceAll('-', '/');
    if (showDate) article.append(date);
    const list = document.createElement('ul');
    for (const item of release.items) {
      const row = document.createElement('li');
      const label = document.createElement('span');
      label.className = 'update-kind';
      label.textContent = item.type === 'schedule' ? '排期' : '功能';
      const title = document.createElement('h3');
      title.textContent = item.title;
      const body = document.createElement('p');
      body.textContent = item.body;
      row.append(label, title, body);
      list.append(row);
    }
    article.append(list);
    return article;
  }

  document.getElementById('updatesLatest').append(renderRelease(releases[0], false));
  const history = document.getElementById('updatesHistory');
  history.hidden = releases.length < 2;
  releases.slice(1).forEach(release => {
    document.getElementById('updatesHistoryList').append(renderRelease(release));
  });
  document.getElementById('updatesDate').textContent = releases[0].date.replaceAll('-', '/');
  function refreshUnread() {
    const unread = releases.filter(release => !readIds.includes(release.id)).length;
    badge.hidden = unread === 0;
    badge.textContent = unread ? `${unread} 則新更新` : '';
    readButton.textContent = unread ? '已讀並收起' : '收起更新';
    return unread;
  }
  function setExpanded(expanded, markRead = false) {
    content.hidden = !expanded;
    toggle.setAttribute('aria-expanded', String(expanded));
    toggle.textContent = expanded ? '收起更新' : '查看更新';
    if (markRead) {
      readIds = releases.map(release => release.id);
      try { localStorage.setItem(storageKey, JSON.stringify(readIds)); } catch (_) {}
      refreshUnread();
    }
  }
  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    setExpanded(!expanded, expanded);
  });
  readButton.addEventListener('click', () => {
    setExpanded(false, true);
    toggle.focus();
  });
  setExpanded(refreshUnread() > 0);
  panel.hidden = false;
})();
