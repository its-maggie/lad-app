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
      hidden: false, children: [], attributes: {}, handlers: {},
      append(...children) { this.children.push(...children); },
      setAttribute(key, value) { this.attributes[key] = value; },
      getAttribute(key) { return this.attributes[key]; },
      addEventListener(event, handler) { this.handlers[event] = handler; },
      focus() { this.focused = true; },
    };
  }
  for (const id of ["siteUpdates", "updatesToggle", "updatesContent", "updatesUnread", "updatesRead", "updatesLatest", "updatesHistory", "updatesHistoryList", "updatesDate"]) elements.set(id, element());
  elements.get("siteUpdates").hidden = true;
  vm.runInNewContext(clientSource, {
    window: { SITE_UPDATES: releases },
    document: { getElementById: id => elements.get(id), createElement: element },
    localStorage: {
      getItem() { if (storageFails) throw new Error("storage disabled"); return saved; },
      setItem(key, value) { if (storageFails) throw new Error("storage disabled"); saved = value; },
    },
  });
  return { get: id => elements.get(id), stored: () => saved };
}

test("new visitors see the notice; dismissal persists, can reopen, and a new id reminds again", () => {
  const first = mount([release("first")]);
  assert.equal(first.get("siteUpdates").hidden, false);
  assert.equal(first.get("updatesContent").hidden, false);
  assert.equal(first.get("updatesUnread").textContent, "1 則新更新");
  first.get("updatesRead").handlers.click();
  assert.equal(first.get("updatesContent").hidden, true);
  assert.equal(first.get("updatesUnread").hidden, true);
  assert.equal(first.get("updatesToggle").focused, true);
  const returning = mount([release("first")], first.stored());
  assert.equal(returning.get("updatesContent").hidden, true);
  returning.get("updatesToggle").handlers.click();
  assert.equal(returning.get("updatesToggle").getAttribute("aria-expanded"), "true");
  returning.get("updatesToggle").handlers.click();
  assert.equal(returning.get("updatesContent").hidden, true);
  const updated = mount([release("second"), release("first")], first.stored());
  assert.equal(updated.get("updatesContent").hidden, false);
  assert.equal(updated.get("updatesUnread").textContent, "1 則新更新");
  assert.equal(updated.get("updatesHistory").hidden, false);
  assert.equal(updated.get("updatesHistoryList").children.length, 1);
});

test("missing notices stay hidden; corrupt or blocked storage does not break the notice", () => {
  assert.equal(mount([]).get("siteUpdates").hidden, true);
  assert.equal(mount([release("first")], "invalid json").get("updatesContent").hidden, false);
  const blocked = mount([release("first")], null, true);
  blocked.get("updatesRead").handlers.click();
  assert.equal(blocked.get("updatesContent").hidden, true);
});

test("automatic announcements preserve history and deduplicate the same change", () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "lad-updates-"));
  try {
    const file = path.join(directory, "updates.js");
    fs.writeFileSync(file, `window.SITE_UPDATES = ${JSON.stringify([release("previous")])};`);
    const changes = [{ name: "祁煜長思入畫復刻", start: "2026-10-03", end: "2026-10-10" }];
    recordScheduleUpdate(file, changes, "2026-10-02");
    recordScheduleUpdate(file, changes, "2026-10-02");
    const context = { window: {} };
    vm.runInNewContext(fs.readFileSync(file, "utf8"), context);
    assert.equal(context.window.SITE_UPDATES.length, 2);
    assert.equal(context.window.SITE_UPDATES[1].id, "previous");
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});
