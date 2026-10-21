const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const participantHtml = html.replace(/<template\b[\s\S]*?<\/template>/g, "");
const script = fs.readFileSync(path.join(root, "script.js"), "utf8");
const afterIds = ["pattern", "prepare", "create", "follow-through", "responsible"];

test("all local links, anchors and copy targets resolve", () => {
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
  assert.equal(new Set(ids).size, ids.length, "IDs must be unique");
  for (const [, href] of html.matchAll(/\b(?:href|src|data-source)="([^"]+)"/g)) {
    if (/^(?:https?:|data:)/.test(href)) continue;
    if (href.startsWith("#")) assert.ok(ids.includes(href.slice(1)), href);
    else assert.ok(fs.existsSync(path.join(root, href)), href);
  }
  const targets = [...html.matchAll(/\bdata-copy="([^"]+)"/g)].map((match) => match[1]);
  assert.equal(targets.length, 34);
  targets.forEach((id) => assert.ok(ids.includes(id), id));
  assert.equal([...html.matchAll(/data-complete="/g)].length, 7);
});

test("two live labs lead the path; five generic HR sections follow the session", () => {
  const sections = [...html.matchAll(/<section id="([^"]+)"/g)].map(([, id]) => id);
  assert.deepEqual(sections, ["welcome", "week", "survey", "wrap", ...afterIds]);
  const nav = html.match(/<nav[\s\S]*?<\/nav>/)[0];
  assert.deepEqual([...nav.matchAll(/href="#([^"]+)"/g)].map(([, id]) => id), sections);
  assert.match(nav, /In person/);
  assert.match(nav, /After the session/);
  for (const id of afterIds) {
    const section = html.match(new RegExp(`<section id="${id}"[\\s\\S]*?</section>`))[0];
    assert.match(section, /AFTER THE SESSION/);
    assert.match(section, /Self-paced practice/);
  }
  const welcome = html.match(/<section id="welcome"[\s\S]*?<\/section>/)[0];
  assert.match(welcome, /href="#week"/);
  assert.doesNotMatch(welcome, /60-MINUTE|three labs/i);
  assert.match(html, /data-complete="week" data-phase="live"/);
  assert.match(html, /data-complete="survey" data-phase="live"/);
});

test("start here keeps essential setup and introduces practical prompting tips", () => {
  const welcome = html.match(/<section id="welcome"[\s\S]*?<\/section>/)[0];
  const setup = welcome.match(/<ol class="steps">([\s\S]*?)<\/ol>/)[1];
  assert.equal([...setup.matchAll(/<li>/g)].length, 2);
  assert.match(setup, /Open your work Copilot/);
  assert.match(setup, /Download the shared survey workbook/);
  assert.doesNotMatch(welcome, /hero-strip|Choose safe work|Point to sources|Run one prompt|Private work, public guide|Choose the right surface|Availability gate|What should change/);
  assert.match(welcome, /Small tips\. Better responses\./);
  assert.match(welcome, /What outcome are you looking for\?/);
  for (const ingredient of ["Goal", "Context", "Source", "Expectations"]) {
    assert.ok(welcome.includes(`<b>${ingredient}</b>`), ingredient);
  }
});

test("shared resource cards are removed while in-exercise downloads remain", () => {
  assert.doesNotMatch(html, /class="resources"|class="resource-card|aria-label="Quick resources"/);
  assert.doesNotMatch(fs.readFileSync(path.join(root, "styles.css"), "utf8"), /\.resources\b|\.resource-card\b/);
  for (const [id, file] of [
    ["survey", "FY27-Q2-QC-Details-Fictitious.xlsx"],
    ...afterIds.map((id) => [id, "hr-leadership-fallback.txt"])
  ]) {
    const section = html.match(new RegExp(`<section id="${id}"[\\s\\S]*?</section>`))[0];
    assert.ok(section.includes(`href="assets/${file}" download`), `${id}: keep its own download`);
  }
});

test("screen typography stays readable without shrinking prompts on small screens", () => {
  const css = fs.readFileSync(path.join(root, "styles.css"), "utf8").split("@media print")[0];
  const workshop = fs.readFileSync(path.join(root, "workshop.css"), "utf8");
  assert.match(css, /body\s*\{[^}]*font-size: 1\.125rem;/);
  assert.match(css, /pre\s*\{[^}]*font: 1\.0625rem\/1\.75/);
  assert.doesNotMatch(css, /(?:font-size|font):\s*(?:[0-9]|1[0-2])px\b/);
  assert.match(css, /max-width: 1440px/);
  assert.match(css, /@media \(max-width: 960px\)/);
  assert.match(workshop, /@media \(max-width: 960px\)/);
  const narrow = css.slice(css.indexOf("@media (max-width: 960px)"));
  assert.doesNotMatch(narrow, /pre\s*\{[^}]*font(?:-size)?:/);
  for (const selector of ["nav a", ".prompt-card button", ".download a, .download button"]) {
    const rule = css.slice(css.indexOf(`${selector} {`)).split("}")[0];
    assert.match(rule, /min-height: 44px/);
  }
});

test("weekly closeout uses five steps with distinct Chat and Outlook context", () => {
  const week = html.match(/<section id="week"[\s\S]*?<\/section>/)[0];
  const catchup = week.match(/<pre id="week-catchup">([\s\S]*?)<\/pre>/)[1];
  assert.match(catchup, /^Help me close out the week\./);
  assert.doesNotMatch(catchup, /\[|\]/);
  assert.match(catchup, /date range and time zone/);
  const reply = html.match(/<pre id="week-reply">([\s\S]*?)<\/pre>/)[1];
  assert.match(reply, /^Send a concise follow-up email in Outlook about \[decision to follow up on\]/);
  assert.match(reply, /our verified findings and its source context/);
  assert.match(week, /4\. Prepare one follow-up <span class="surface">Same chat/);
  assert.match(week, /5\. Create your weekly closeout brief <span class="surface">Same chat/);
  const optional = week.match(/<details><summary>Optional \/ try a thread in Outlook<\/summary>([\s\S]*?)<\/details>/)[1];
  assert.match(optional, /id="week-outlook-reply"/);
  assert.doesNotMatch(optional, /id="week-finish"/);
  assert.ok(week.indexOf('id="week-finish"') < week.indexOf("<details>"));
  const outlook = week.match(/<pre id="week-outlook-reply">([\s\S]*?)<\/pre>/)[1];
  assert.match(outlook, /using only the thread's context/);
  assert.match(outlook, /Infer what needs a response from the messages/);
  assert.match(outlook, /ask me one question before creating/);
  assert.doesNotMatch(outlook, /\[|\]/);
  for (const prompt of [reply, outlook]) {
    assert.doesNotMatch(prompt, /reviewed facts below|draft|Do not send|add recipients/i);
  }
  assert.match(week, /5 interactive steps/);
  assert.doesNotMatch(week, /What good looks like|class="verify"/);
  assert.match(week, /Stay in your original Copilot Chat conversation/);
  assert.doesNotMatch(week, /Start with your content|synthetic|fallback|data-source=/i);
});

test("facilitator material stays inert", () => {
  const saved = html.match(/<template id="facilitator-content">([\s\S]*?)<\/template>/)[1];
  assert.match(saved, /data-facilitator="survey"[\s\S]*Facilitator checks/);
  assert.match(saved, /data-facilitator="session-close"[\s\S]*Facilitator notes &amp; product sources/);
  assert.match(saved, /Preflight before every delivery/);
  assert.match(saved, /class="sources"/);
  assert.doesNotMatch(participantHtml, /Facilitator checks|Facilitator notes|Preflight before every delivery|class="sources"/);
  assert.match(participantHtml, /id="print"/);
});

test("practice inputs and evidence checkpoints stay aligned", () => {
  for (const [name, prefix, count] of [
    ["weekly-closeout-fallback.txt", "W", 6],
    ["hr-leadership-fallback.txt", "H", 6]
  ]) {
    const content = fs.readFileSync(path.join(root, "assets", name), "utf8");
    assert.match(content, /fictional|invented/i);
    for (let n = 1; n <= count; n++) assert.ok(content.includes(`${prefix}0${n} |`));
  }
  assert.match(html, /H02 supersedes H03/);
  assert.match(html, /64 of 80 participants completed/);
  assert.match(html, /H05 as the meeting record/);
  assert.match(html, /not a transcript/);
  assert.match(html, /not part of the two live exercises/);
});

test("short interactive sequences precede optional longer finishers", () => {
  for (const lab of ["week", "survey", ...afterIds]) {
    const section = html.match(new RegExp(`<section id="${lab}"[\\s\\S]*?</section>`))[0];
    const steps = lab === "week" ? 5 : 4;
    assert.equal([...section.matchAll(/<h3 class="section-title">/g)].length, steps, `${lab}: core steps`);
    assert.ok([...section.matchAll(/class="checkpoint"/g)].length >= steps, `${lab}: participant checkpoints`);
    assert.match(section, /Start (?:a new|a fresh)|start a separate|start fresh|open Copilot/i);
  }
  for (const [, id, text] of html.matchAll(/<pre id="([^"]+)">([\s\S]*?)<\/pre>/g)) {
    const words = text.trim().split(/\s+/).length;
    if (id.endsWith("-finish") || id === "survey-dashboard") {
      assert.ok(words > 100 && words <= 160, `${id}: meaningful but bounded synthesis (${words} words)`);
    } else {
      assert.ok(words <= 90, `${id}: keep the individual ask short (${words} words)`);
    }
  }
  for (const lab of ["pattern", "create"]) {
    const section = html.match(new RegExp(`<section id="${lab}"[\\s\\S]*?</section>`))[0];
    const core = lab === "pattern" ? "pattern-expectations" : "create-refine";
    assert.ok(section.indexOf(`id="${core}"`) < section.indexOf(`id="${lab}-finish"`));
    assert.match(section, /Optional finisher/);
  }
});

test("attendee work is preferred, fallbacks are separate, and retired branding is removed", () => {
  for (const lab of afterIds) {
    const section = html.match(new RegExp(`<section id="${lab}"[\\s\\S]*?</section>`))[0];
    assert.ok(section.indexOf("Start with") < section.indexOf('class="fallback"'));
    assert.match(section, /Use the synthetic fallback/);
    assert.match(section, /Work IQ off/);
    assert.match(section, /not my work data|not my work|work references/i);
    assert.match(section, /class="fallback">/);
    for (const [, text] of section.matchAll(/<pre id="[^"]+">([\s\S]*?)<\/pre>/g)) {
      assert.doesNotMatch(text, /Northstar|H01|H05|October 26, 2026/);
    }
  }
  assert.match(html, /Work IQ on/);
  assert.match(html, /Earlier Chat context does not carry into Outlook/);
  assert.match(html, /It does not inherit your Excel conversation/);
  assert.match(html, /Copilot in Word/);
  assert.match(html, /Leave recipients blank/);
  assert.match(html, /Respect restrictions on copying\/export/);
  assert.match(html, /not a legal, privacy or compliance certification/);
  assert.doesNotMatch(html, /cowork|brand-mark|favicon\.svg|>n\.</i);
  assert.doesNotMatch(fs.readFileSync(path.join(root, "README.md"), "utf8"), /cowork/i);
  assert.doesNotMatch(fs.readFileSync(path.join(root, "styles.css"), "utf8"), /brand-mark/);
  assert.equal(fs.existsSync(path.join(root, "assets", "favicon.svg")), false);
});

test("generic sections are adapted to senior HR decisions and preserve human action gates", () => {
  const section = (id) => html.match(new RegExp(`<section id="${id}"[\\s\\S]*?</section>`))[0];
  assert.match(section("pattern"), /goal, context, source and expectations/i);
  assert.match(section("pattern"), /pattern-goal[\s\S]*pattern-context[\s\S]*pattern-source[\s\S]*pattern-expectations/);
  assert.match(section("prepare"), /Do not infer agreement, opposition, motives or decision authority/);
  assert.match(section("prepare"), /business value[\s\S]*delivery capacity[\s\S]*equitable access/);
  assert.match(section("create"), /Decision Brief Handoff/);
  assert.match(section("create"), /Decision Needed[\s\S]*Situation, Evidence, Options, Recommendation and Risks/);
  assert.match(section("create"), /No cross-app memory or original-source access is assumed/);
  assert.match(section("follow-through"), /an accessible transcript is required/);
  assert.match(section("follow-through"), /label the result notes-based/);
  assert.match(section("follow-through"), /Manually open an unsent message/);
  assert.match(section("follow-through"), /Do not send, create tasks, schedule or add recipients/);
  assert.match(section("responsible"), /Revise, Hold or Ready for human approval/);
  for (const habit of ["Verify", "Separate", "Protect", "Challenge", "Edit", "Own"]) {
    assert.ok(section("responsible").includes(`<strong>${habit}:`), habit);
  }
  for (const retired of ["review-find", "session-plan", "conversation-rehearse"]) {
    assert.ok(!html.includes(`id="${retired}"`), retired);
  }
});

test("survey runs in Excel with an editable dashboard and a separate optional Analyst route", () => {
  const survey = html.match(/<section id="survey"[\s\S]*?<\/section>/)[0];
  const optional = survey.match(/<details><summary>Optional \/ explore support themes with Analyst<\/summary>([\s\S]*?)<\/details>/)[1];
  const powerpoint = survey.match(/<details><summary>Optional \/ create a coaching presentation in PowerPoint<\/summary>([\s\S]*?)<\/details>/)[1];
  const excel = survey.replace(optional, "").replace(powerpoint, "");
  assert.equal([...survey.matchAll(/<h3 class="section-title">[^<]+<span class="surface">Copilot in Excel<\/span>/g)].length, 4);
  assert.doesNotMatch(survey, /Copilot Chat|Same Chat|Chat \/ Excel|>Chat</);
  assert.doesNotMatch(excel, /attached|reattach|Stay in Analyst/i);
  assert.match(optional, /attach the same unedited demo workbook/);
  assert.match(optional, /id="survey-support-themes"/);
  assert.match(optional, /It does not inherit your Excel conversation/);
  const dashboard = survey.match(/<pre id="survey-dashboard">([\s\S]*?)<\/pre>/)[1];
  for (const required of ["new sheet", "supporting PivotTables", "KPI cards", "Worker A", "Manager H", "Status F", "development items S", "Performance Q", "100% stacked", "editable visuals", "denominators", "blanks", "refresh instructions", "50 workers"]) {
    assert.ok(dashboard.includes(required), required);
  }
  assert.match(dashboard, /Preserve Sheet1 and the source table/);
  assert.match(dashboard, /do not average rating labels or mix Leadership with Performance/);
  assert.match(excel, /complete them manually/);
  assert.doesNotMatch(survey, /question-bank|prompt bank|5\. Turn insights/);
  assert.match(powerpoint, /Open a new presentation in PowerPoint/);
  assert.match(powerpoint, /file-reference control/);
  assert.match(powerpoint, /generally available and enabled/);
  assert.match(powerpoint, /Excel-file references in PowerPoint as preview/);
  assert.match(powerpoint, /id="survey-finish"/);
  assert.ok(survey.indexOf('id="survey-dashboard"') < survey.indexOf(powerpoint));
  assert.doesNotMatch(survey, /Optional finisher|one-page team comparison/);
  const finish = survey.match(/<pre id="survey-finish">([\s\S]*?)<\/pre>/)[1];
  assert.match(finish, /Create a five-slide PowerPoint/);
  assert.match(finish, /QC_Details in the referenced Excel workbook/);
  assert.match(finish, /three proposed coaching priorities for Manager 1; three for Manager 2/);
  assert.match(finish, /supporting fields\/rows, a coaching question/);
  assert.match(survey, /PowerPoint does not inherit your Excel conversation/);
});

test("live prompts cover HR closeout and workbook questions on the correct surfaces", () => {
  const week = html.match(/<section id="week"[\s\S]*?<\/section>/)[0];
  const survey = html.match(/<section id="survey"[\s\S]*?<\/section>/)[0];
  const catchup = week.match(/<pre id="week-catchup">([\s\S]*?)<\/pre>/)[1];
  assert.doesNotMatch(catchup, /Exclude restricted personnel matters|Flag retrieval gaps|complete inbox audit/);
  assert.match(week, /Do not infer someone ignored a message/);
  assert.match(week, /Leave it unsent/);
  assert.doesNotMatch(survey, /shared demo is the lead/i);
  assert.match(survey, /Sheet1.*QC_Details/);
  assert.match(survey, /Copilot in Excel/);
  assert.match(survey, /Agents → Analyst/);
  assert.match(survey, /same unedited demo workbook/);
  assert.match(survey, /do not average rating labels or mix Leadership with Performance/);
  assert.match(survey, /Keep blanks separate from No/);
  assert.match(survey, /Q by Manager/);
  assert.match(survey, /1 of 30 \(3\.3%\).*11 of 20 \(55%\)/);
  for (const id of ["survey-scope", "survey-leader", "survey-counts", "survey-dashboard", "survey-support-themes", "survey-finish"]) {
    assert.ok(survey.includes(`id="${id}"`), id);
  }
  for (const id of ["survey-goals", "survey-support-replies", "survey-accomplishments", "survey-tenure", "survey-new-role", "survey-incomplete", "survey-ratings", "survey-rating-comments", "survey-coaching"]) {
    assert.ok(!survey.includes(`id="${id}"`), `${id}: prompt bank removed`);
  }
});

function environment({ saved = "{}", storageFails = false, copyFails = false } = {}) {
  const listeners = {};
  const elements = new Map();
  function element(id = "") {
    return { id, dataset: {}, textContent: "", checked: false, open: false, attrs: {},
      addEventListener(event, callback) { this[event] = callback; },
      setAttribute(name, value) { this.attrs[name] = value; },
      getAttribute(name) { return this.attrs[name]; },
      removeAttribute(name) { delete this.attrs[name]; },
      querySelector() { return { textContent: this.id }; },
      focus() { this.focused = true; }
    };
  }
  for (const id of ["status", "main", "progress", "progress-label", "reset", "print"]) elements.set(id, element(id));
  const activities = [...html.matchAll(/<section id="([^"]+)"/g)].map(([, id]) => element(id));
  const links = activities.map((activity) => Object.assign(element(), { hash: `#${activity.id}` }));
  const checks = [...html.matchAll(/<input[^>]+data-complete="([^"]+)"([^>]*)>/g)].map(([, id, attrs]) =>
    Object.assign(element(), { dataset: { complete: id, phase: attrs.match(/data-phase="([^"]+)"/)?.[1] } }));
  const details = [...participantHtml.matchAll(/<details\b/g)].map(() => element());
  const copyButtons = [...html.matchAll(/data-copy="([^"]+)"/g)].map(([, id]) => {
    const text = html.match(new RegExp(`<pre id="${id}">([\\s\\S]*?)</pre>`))[1];
    elements.set(id, Object.assign(element(id), { textContent: text }));
    return Object.assign(element(), { dataset: { copy: id } });
  });
  const sourceButtons = [...html.matchAll(/<button[^>]+data-source="([^"]+)"/g)].map(([, name]) => Object.assign(element(), { dataset: { source: name } }));
  const downloadLinks = [...html.matchAll(/<a href="([^"]+)" download="([^"]+)" data-download>/g)].map(([, href, filename]) =>
    Object.assign(element(), { attrs: { href }, download: filename }));
  const downloads = [];
  const blobs = [];
  const revokedUrls = [];
  const timers = [];
  let copied = "";
  let selected = false;
  const context = {
    document: {
      querySelectorAll(selector) { return ({ ".activity": activities, "nav a": links, "[data-complete]": checks, "[data-copy]": copyButtons, "[data-source]": sourceButtons, "[data-download]": downloadLinks, "details": details })[selector]; },
      getElementById(id) { return elements.get(id); },
      body: { appendChild(node) { node.attached = true; } },
      createElement() { return { click() { assert.ok(this.attached); downloads.push(this); }, remove() { this.attached = false; } }; },
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
    fetch: async (name) => ({ ok: true, text: async () => fs.readFileSync(path.join(root, name), "utf8"), arrayBuffer: async () => fs.readFileSync(path.join(root, name)) }),
    Blob,
    URL: { createObjectURL(blob) { blobs.push(blob); return `blob:test-${blobs.length}`; }, revokeObjectURL(url) { revokedUrls.push(url); } },
    setTimeout(callback, delay) { timers.push({ callback, delay }); return timers.length; }, clearTimeout() {}
  };
  vm.runInNewContext(script, context);
  return { elements, activities, links, checks, details, copyButtons, sourceButtons, downloadLinks, downloads, blobs, revokedUrls, timers, context, listeners, copied: () => copied, selected: () => selected, saved: () => saved };
}

test("both workbook links download unchanged binary data instead of navigating to a viewer", async () => {
  const env = environment();
  assert.equal(env.downloadLinks.length, 2);
  const filename = "FY27-Q2-QC-Details-Fictitious.xlsx";
  const original = fs.readFileSync(path.join(root, "assets", filename));
  for (const link of env.downloadLinks) {
    let prevented = false;
    await link.click({ preventDefault() { prevented = true; } });
    assert.ok(prevented);
    assert.equal(link.getAttribute("aria-busy"), undefined);
    const download = env.downloads.at(-1);
    assert.match(download.href, /^blob:/);
    assert.equal(download.download, filename);
    assert.equal(download.attached, false);
    assert.equal(env.blobs.at(-1).type, "application/octet-stream");
    assert.deepEqual(Buffer.from(await env.blobs.at(-1).arrayBuffer()), original);
  }
  assert.match(env.elements.get("status").textContent, /work OneDrive/);
  env.timers.filter((timer) => timer.delay === 60000).forEach((timer) => timer.callback());
  assert.deepEqual(env.revokedUrls, ["blob:test-1", "blob:test-2"]);
  const survey = html.match(/<section id="survey"[\s\S]*?<\/section>/)[0];
  assert.match(survey, /After downloading:[\s\S]*move the file into your work OneDrive/);
});

test("workbook download failures are explicit and do not open the source link", async () => {
  for (const failure of ["network", "http"]) {
    const env = environment();
    env.context.fetch = async () => {
      if (failure === "network") throw new Error("Offline");
      return { ok: false, status: 404 };
    };
    let prevented = false;
    await env.downloadLinks[0].click({ preventDefault() { prevented = true; } });
    assert.ok(prevented);
    assert.equal(env.downloads.length, 0);
    assert.equal(env.downloadLinks[0].getAttribute("aria-busy"), undefined);
    assert.match(env.elements.get("status").textContent, /could not be downloaded.*Save link as/);
  }
});

test("printing expands fallbacks and finishers, then restores their state", () => {
  const env = environment();
  env.details[1].open = true;
  const original = env.details.map((detail) => detail.open);
  env.listeners.beforeprint();
  assert.ok(env.details.every((detail) => detail.open));
  env.listeners.afterprint();
  assert.deepEqual(env.details.map((detail) => detail.open), original);
});

test("navigation, completion, restoration and reset work", () => {
  const env = environment({ saved: '{"pattern":true,"review":true}' });
  assert.equal(env.elements.get("progress").value, 1);
  assert.equal(env.elements.get("progress").max, 7);
  assert.equal(env.elements.get("progress-label").textContent, "0 of 2 live · 1 of 5 later");
  assert.equal(env.activities.filter((item) => !item.hidden).length, 1);
  env.context.location.hash = "#responsible";
  env.listeners.hashchange();
  assert.equal(env.activities.find((item) => !item.hidden).id, "responsible");
  assert.equal(env.links.find((link) => link.hash === "#responsible").attrs["aria-current"], "step");
  const prepare = env.checks.find((check) => check.dataset.complete === "prepare");
  prepare.checked = true;
  prepare.change();
  assert.equal(JSON.parse(env.saved()).prepare, true);
  assert.equal(JSON.parse(env.saved()).review, undefined);
  assert.equal(env.elements.get("progress").value, 2);
  const week = env.checks.find((check) => check.dataset.complete === "week");
  week.checked = true;
  week.change();
  assert.equal(JSON.parse(env.saved()).week, true);
  assert.equal(env.elements.get("progress-label").textContent, "1 of 2 live · 2 of 5 later");
  env.context.window.confirm = () => false;
  env.elements.get("reset").click();
  assert.equal(env.elements.get("progress").value, 3);
  env.context.window.confirm = () => true;
  env.elements.get("reset").click();
  assert.equal(env.elements.get("progress").value, 0);
  assert.equal(env.saved(), null);
  assert.equal(env.elements.get("progress-label").textContent, "0 of 2 live · 0 of 5 later");
  env.context.location.hash = "#invalid";
  env.listeners.hashchange();
  assert.equal(env.activities[0].hidden, false);
});

test("live completion survives while retired lab flags do not complete new sections", () => {
  const env = environment({ saved: '{"week":true,"survey":true,"review":true,"session":true,"conversation":true}' });
  assert.equal(env.elements.get("progress").value, 2);
  assert.equal(env.elements.get("progress-label").textContent, "2 of 2 live · 0 of 5 later");
  assert.ok(env.checks.filter((check) => check.dataset.phase !== "live").every((check) => !check.checked));
  env.context.location.hash = "#review";
  env.listeners.hashchange();
  assert.equal(env.activities.find((item) => !item.hidden).id, "welcome");
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
