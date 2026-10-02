(function () {
  'use strict';
  const latest = Array.isArray(window.SITE_UPDATES) ? window.SITE_UPDATES[0] : null;
  const dialog = document.getElementById('siteUpdates');
  if (!dialog || !latest) return;

  const storageKey = 'lad_readSiteUpdates';
  const launcher = document.getElementById('updatesLaunch');
  const closeButton = document.getElementById('updatesClose');
  const dot = document.getElementById('updatesDot');
  const badge = document.getElementById('updatesUnread');
  const readButton = document.getElementById('updatesRead');
  let readIds = [];
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    if (Array.isArray(saved)) readIds = saved;
  } catch (_) { /* Storage may be disabled; the notice still works. */ }

  function renderRelease(release) {
    const article = document.createElement('article');
    article.className = 'update-release';
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

  document.getElementById('updatesLatest').append(renderRelease(latest));
  document.getElementById('updatesDate').textContent = latest.date.replaceAll('-', '/');
  function refreshUnread() {
    const unread = !readIds.includes(latest.id);
    badge.hidden = !unread;
    dot.hidden = !unread;
    badge.textContent = unread ? '新更新' : '';
    return unread;
  }
  function openDialog() {
    if (dialog.open) return;
    dialog.showModal();
    document.body.classList.add('updates-modal-open');
  }
  // Native dialog handles focus trapping and Escape; every close marks this release read.
  dialog.addEventListener('close', () => {
    readIds = [latest.id];
    try { localStorage.setItem(storageKey, JSON.stringify(readIds)); } catch (_) {}
    refreshUnread();
    document.body.classList.remove('updates-modal-open');
    launcher.focus({ preventScroll: true });
  });
  launcher.addEventListener('click', openDialog);
  closeButton.addEventListener('click', () => dialog.close());
  readButton.addEventListener('click', () => dialog.close());
  launcher.hidden = false;
  if (refreshUnread()) openDialog();
})();
