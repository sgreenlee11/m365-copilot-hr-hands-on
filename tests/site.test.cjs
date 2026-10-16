const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const script = fs.readFileSync(path.join(root, "script.js"), "utf8");

test("all local links, anchors and copy targets resolve", () => {
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
  assert.equal(new Set(ids).size, ids.length, "IDs must be unique");
  for (const [, href] of html.matchAll(/\b(?:href|src|data-source)="([^"]+)"/g)) {
    if (/^https?:/.test(href)) continue;
    if (href.startsWith("#")) assert.ok(ids.includes(href.slice(1)), href);
    else assert.ok(fs.existsSync(path.join(root, href)), href);
  }
  const targets = [...html.matchAll(/\bdata-copy="([^"]+)"/g)].map((match) => match[1]);
  assert.equal(targets.length, 9);
  targets.forEach((id) => assert.ok(ids.includes(id), id));
  assert.equal([...html.matchAll(/data-complete="/g)].length, 3);
});

test("practice inputs and evidence checkpoints stay aligned", () => {
  for (const [name, prefix, count] of [
    ["self-review-evidence.txt", "R", 8],
    ["leadership-session-brief.txt", "L", 5],
    ["conversation-brief.txt", "C", 5]
  ]) {
    const content = fs.readFileSync(path.join(root, "assets", name), "utf8");
    assert.match(content, /fictional|invented/i);
    for (let n = 1; n <= count; n++) assert.ok(content.includes(`${prefix}0${n} |`));
  }
  assert.match(html, /112 verified completions/);
  assert.match(html, /exactly 90 minutes/);
  assert.match(html, /then STOP and wait/);
  assert.match(html, /not an automated employment decision/);
});

function environment({ saved = "{}", storageFails = false, copyFails = false } = {}) {
  const listeners = {};
  const elements = new Map();
  function element(id = "") {
    return { id, dataset: {}, textContent: "", checked: false, open: false, attrs: {},
      addEventListener(event, callback) { this[event] = callback; },
      setAttribute(name, value) { this.attrs[name] = value; },
      removeAttribute(name) { delete this.attrs[name]; },
      querySelector() { return { textContent: this.id }; },
      focus() { this.focused = true; }
    };
  }
  for (const id of ["status", "main", "progress", "progress-label", "reset", "print"]) elements.set(id, element(id));
  const activities = ["welcome", "review", "session", "conversation", "wrap"].map(element);
  const links = activities.map((activity) => Object.assign(element(), { hash: `#${activity.id}` }));
  const checks = ["review", "session", "conversation"].map((id) => Object.assign(element(), { dataset: { complete: id } }));
  const copyButtons = [...html.matchAll(/data-copy="([^"]+)"/g)].map(([, id]) => {
    const text = html.match(new RegExp(`<pre id="${id}">([\\s\\S]*?)</pre>`))[1];
    elements.set(id, Object.assign(element(id), { textContent: text }));
    return Object.assign(element(), { dataset: { copy: id } });
  });
  const sourceButtons = [...html.matchAll(/<button[^>]+data-source="([^"]+)"/g)].map(([, name]) => Object.assign(element(), { dataset: { source: name } }));
  let copied = "";
  let selected = false;
  const context = {
    document: {
      querySelectorAll(selector) { return ({ ".activity": activities, "nav a": links, "[data-complete]": checks, "[data-copy]": copyButtons, "[data-source]": sourceButtons, "details": [] })[selector]; },
      getElementById(id) { return elements.get(id); },
      createRange() { return { selectNodeContents() { selected = true; } }; }
    },
    location: { hash: "" },
    window: { addEventListener(name, cb) { listeners[name] = cb; }, scrollTo() {}, confirm() { return true; }, print() {}, getSelection() { return { removeAllRanges() {}, addRange() {} }; } },
    localStorage: {
      getItem() { if (storageFails) throw new Error("Denied"); return saved; },
      setItem(key, value) { if (storageFails) throw new Error("Denied"); saved = value; },
      removeItem() { if (storageFails) throw new Error("Denied"); saved = null; }
    },
    navigator: { clipboard: { async writeText(text) { if (copyFails) throw new Error("Denied"); copied = text; } } },
    fetch: async (name) => ({ ok: true, text: async () => fs.readFileSync(path.join(root, name), "utf8") }),
    setTimeout() { return 1; }, clearTimeout() {}
  };
  vm.runInNewContext(script, context);
  return { elements, activities, links, checks, copyButtons, sourceButtons, context, listeners, copied: () => copied, selected: () => selected, saved: () => saved };
}

test("navigation, completion, restoration and reset work", () => {
  const env = environment({ saved: '{"review":true}' });
  assert.equal(env.elements.get("progress").value, 1);
  assert.equal(env.activities.filter((item) => !item.hidden).length, 1);
  env.context.location.hash = "#conversation";
  env.listeners.hashchange();
  assert.equal(env.activities.find((item) => !item.hidden).id, "conversation");
  assert.equal(env.links[3].attrs["aria-current"], "step");
  env.checks[1].checked = true;
  env.checks[1].change();
  assert.equal(JSON.parse(env.saved()).session, true);
  assert.equal(env.elements.get("progress").value, 2);
  env.elements.get("reset").click();
  assert.equal(env.elements.get("progress").value, 0);
  assert.equal(env.saved(), null);
  env.context.location.hash = "#invalid";
  env.listeners.hashchange();
  assert.equal(env.activities[0].hidden, false);
});

test("every prompt and source copies its exact text", async () => {
  const env = environment();
  for (const button of env.copyButtons) {
    await button.click();
    assert.equal(env.copied(), env.elements.get(button.dataset.copy).textContent.trim());
  }
  for (const button of env.sourceButtons) {
    await button.click();
    assert.equal(env.copied(), fs.readFileSync(path.join(root, button.dataset.source), "utf8"));
    assert.equal(button.disabled, false);
  }
});

test("storage, clipboard and source failures are surfaced", async () => {
  const env = environment({ storageFails: true, copyFails: true });
  assert.match(env.elements.get("status").textContent, /could not be read/);
  env.checks[0].checked = true;
  env.checks[0].change();
  assert.match(env.elements.get("status").textContent, /will not persist/);
  await env.copyButtons[0].click();
  assert.ok(env.selected());
  assert.match(env.elements.get("status").textContent, /Clipboard access was blocked/);
  env.context.fetch = async () => ({ ok: false, status: 404 });
  await env.sourceButtons[0].click();
  assert.match(env.elements.get("status").textContent, /could not be loaded/);
  assert.equal(env.sourceButtons[0].disabled, false);
  const corrupt = environment({ saved: "invalid JSON" });
  assert.match(corrupt.elements.get("status").textContent, /could not be read/);
});
