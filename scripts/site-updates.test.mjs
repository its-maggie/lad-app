import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import vm from "node:vm";
import test from "node:test";
import { recordScheduleUpdate } from "./site-updates.mjs";

const clientSource = fs.readFileSync(new URL("../site-updates.js", import.meta.url), "utf8");
const release = id => ({ id, date: "2026-10-02", items: [{ type: "schedule", title: "祁煜復刻", body: "10/3–10/10" }] });

// Minimal DOM for checking persistence and interactions without a browser dependency.
function mount(releases, stored = null, storageFails = false) {
  const elements = new Map();
  let saved = stored;
  function element() {
    return {
      hidden: false, open: false, children: [], attributes: {}, handlers: {},
      append(...children) { this.children.push(...children); },
      setAttribute(key, value) { this.attributes[key] = value; },
      getAttribute(key) { return this.attributes[key]; },
      addEventListener(event, handler) { this.handlers[event] = handler; },
      focus() { this.focused = true; },
      showModal() { this.open = true; },
      close() { this.open = false; this.handlers.close?.(); },
    };
  }
  for (const id of ["siteUpdates", "updatesLaunch", "updatesClose", "updatesDot", "updatesUnread", "updatesRead", "updatesLatest", "updatesDate"]) elements.set(id, element());
  elements.get("updatesLaunch").hidden = true;
  const bodyClasses = new Set();
  vm.runInNewContext(clientSource, {
    window: { SITE_UPDATES: releases },
    document: { getElementById: id => elements.get(id), createElement: element, body: { classList: { add: value => bodyClasses.add(value), remove: value => bodyClasses.delete(value) } } },
    localStorage: {
      getItem() { if (storageFails) throw new Error("storage disabled"); return saved; },
      setItem(key, value) { if (storageFails) throw new Error("storage disabled"); saved = value; },
    },
  });
  return { get: id => elements.get(id), stored: () => saved, bodyClasses };
}

test("unread notices open a modal; closing persists, the bell reopens it, and new releases remind again", () => {
  const first = mount([release("first")]);
  assert.equal(first.get("updatesLaunch").hidden, false);
  assert.equal(first.get("siteUpdates").open, true);
  assert.equal(first.bodyClasses.has("updates-modal-open"), true);
  assert.equal(first.get("updatesUnread").textContent, "新更新");
  first.get("updatesClose").handlers.click();
  assert.equal(first.get("siteUpdates").open, false);
  assert.equal(first.bodyClasses.has("updates-modal-open"), false);
  assert.equal(first.get("updatesUnread").hidden, true);
  assert.equal(first.get("updatesDot").hidden, true);
  assert.equal(first.get("updatesLaunch").focused, true);
  const returning = mount([release("first")], first.stored());
  assert.equal(returning.get("siteUpdates").open, false);
  returning.get("updatesLaunch").handlers.click();
  assert.equal(returning.get("siteUpdates").open, true);
  returning.get("updatesRead").handlers.click();
  assert.equal(returning.get("siteUpdates").open, false);
  const updated = mount([release("second"), release("first")], first.stored());
  assert.equal(updated.get("siteUpdates").open, true);
  assert.equal(updated.get("updatesUnread").textContent, "新更新");
  assert.equal(updated.get("updatesLatest").children.length, 1);
  // Old cached releases must never trigger a popup once the latest release is read.
  const oldUnread = mount([release("second"), release("first")], JSON.stringify(["second"]));
  assert.equal(oldUnread.get("siteUpdates").open, false);
  assert.equal(oldUnread.get("updatesUnread").hidden, true);
});

test("missing notices stay hidden; corrupt or blocked storage does not break the modal", () => {
  assert.equal(mount([]).get("siteUpdates").open, false);
  assert.equal(mount([]).get("updatesLaunch").hidden, true);
  assert.equal(mount([release("first")], "invalid json").get("siteUpdates").open, true);
  const blocked = mount([release("first")], null, true);
  blocked.get("updatesRead").handlers.click();
  assert.equal(blocked.get("siteUpdates").open, false);
});

test("automatic announcements replace history and deduplicate the same change", () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "lad-updates-"));
  try {
    const file = path.join(directory, "updates.js");
    fs.writeFileSync(file, `window.SITE_UPDATES = ${JSON.stringify([release("previous")])};`);
    const changes = [{ name: "祁煜長思入畫復刻", start: "2026-10-03", end: "2026-10-10" }];
    recordScheduleUpdate(file, changes, "2026-10-02");
    const firstWrite = fs.readFileSync(file, "utf8");
    recordScheduleUpdate(file, changes, "2026-10-02");
    assert.equal(fs.readFileSync(file, "utf8"), firstWrite);
    const context = { window: {} };
    vm.runInNewContext(fs.readFileSync(file, "utf8"), context);
    assert.equal(context.window.SITE_UPDATES.length, 1);
    assert.notEqual(context.window.SITE_UPDATES[0].id, "previous");
    assert.match(context.window.SITE_UPDATES[0].items[0].title, /祁煜長思入畫復刻/);
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});
