"use strict";

const activities = [...document.querySelectorAll(".activity")];
const navigation = [...document.querySelectorAll("nav a")];
const status = document.getElementById("status");
const checks = [...document.querySelectorAll("[data-complete]")];
const storageKey = "people-practice-lab-progress-v1";
let messageTimer;

function announce(message) {
  clearTimeout(messageTimer);
  status.textContent = message;
  messageTimer = setTimeout(() => { status.textContent = ""; }, 7000);
}

function showActivity(focus = false) {
  const requested = location.hash.slice(1);
  const selected = activities.find((activity) => activity.id === requested) || activities[0];
  activities.forEach((activity) => { activity.hidden = activity !== selected; });
  navigation.forEach((link) => {
    if (link.hash === `#${selected.id}`) link.setAttribute("aria-current", "step");
    else link.removeAttribute("aria-current");
  });
  const title = selected.querySelector("h2").textContent.replace(/\s+/g, " ").trim();
  document.title = `${title} | Copilot practice lab`;
  if (focus) {
    document.getElementById("main").focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: "instant" });
  }
}

function updateProgress() {
  const count = checks.filter((check) => check.checked).length;
  const live = checks.filter((check) => check.dataset.phase === "live");
  const later = checks.filter((check) => check.dataset.phase !== "live");
  document.getElementById("progress").max = checks.length;
  document.getElementById("progress").value = count;
  document.getElementById("progress-label").textContent = `${live.filter((check) => check.checked).length} of ${live.length} live · ${later.filter((check) => check.checked).length} of ${later.length} later`;
}

try {
  const stored = JSON.parse(localStorage.getItem(storageKey) || "{}");
  if (!stored || typeof stored !== "object" || Array.isArray(stored)) throw new Error("Invalid progress");
  checks.forEach((check) => { check.checked = stored[check.dataset.complete] === true; });
} catch {
  announce("Saved progress could not be read. You can still use every activity; re-check completed labs.");
}
updateProgress();

checks.forEach((check) => check.addEventListener("change", () => {
  updateProgress();
  try {
    localStorage.setItem(storageKey, JSON.stringify(Object.fromEntries(checks.map((item) => [item.dataset.complete, item.checked]))));
    announce("Progress updated on this browser.");
  } catch {
    announce("Progress updated for this visit, but browser storage is unavailable. It will not persist.");
  }
}));

document.getElementById("reset").addEventListener("click", () => {
  if (!window.confirm(`Reset all ${checks.length} lab completion checkboxes on this browser?`)) return;
  checks.forEach((check) => { check.checked = false; });
  updateProgress();
  try {
    localStorage.removeItem(storageKey);
    announce("Lab progress reset.");
  } catch {
    announce("Progress reset for this visit. Browser storage could not be cleared.");
  }
});

async function copyText(text, button, target) {
  try {
    await navigator.clipboard.writeText(text);
    announce(`${button.dataset.source ? "Source text" : "Prompt"} copied. Paste it into your approved Copilot.`);
  } catch {
    if (target) {
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(target);
      selection.removeAllRanges();
      selection.addRange(range);
      announce("Clipboard access was blocked. Text is selected; use your device's copy command.");
    } else {
      announce("Clipboard access was blocked. Download the TXT file, open it and copy its contents manually.");
    }
  }
}

document.querySelectorAll("[data-copy]").forEach((button) => {
  button.addEventListener("click", () => {
    const target = document.getElementById(button.dataset.copy);
    return copyText(target.textContent.trim(), button, target);
  });
});

document.querySelectorAll("[data-source]").forEach((button) => {
  button.addEventListener("click", async () => {
    button.disabled = true;
    button.setAttribute("aria-busy", "true");
    try {
      const response = await fetch(button.dataset.source);
      if (!response.ok) throw new Error(`Source request failed: ${response.status}`);
      await copyText(await response.text(), button);
    } catch {
      announce("The source file could not be loaded. Try its download link or reload the page.");
    } finally {
      button.disabled = false;
      button.removeAttribute("aria-busy");
    }
  });
});

document.querySelectorAll("[data-download]").forEach((link) => {
  link.addEventListener("click", async (event) => {
    event.preventDefault();
    if (link.getAttribute("aria-busy") === "true") return;
    link.setAttribute("aria-busy", "true");
    try {
      const response = await fetch(link.getAttribute("href"));
      if (!response.ok) throw new Error(`Download request failed: ${response.status}`);
      const blob = new Blob([await response.arrayBuffer()], { type: "application/octet-stream" });
      const url = URL.createObjectURL(blob);
      try {
        const download = document.createElement("a");
        download.href = url;
        download.download = link.download;
        download.hidden = true;
        document.body.appendChild(download);
        download.click();
        download.remove();
        announce("Workbook download requested. Move the downloaded file into your work OneDrive before opening it in Excel.");
      } finally {
        setTimeout(() => URL.revokeObjectURL(url), 60000);
      }
    } catch {
      announce("The workbook could not be downloaded. Check your connection and try again. You can also right-click its link and choose Save link as.");
    } finally {
      link.removeAttribute("aria-busy");
    }
  });
});

let detailsBeforePrint = [];
window.addEventListener("beforeprint", () => {
  detailsBeforePrint = [...document.querySelectorAll("details")].map((detail) => [detail, detail.open]);
  detailsBeforePrint.forEach(([detail]) => { detail.open = true; });
});
window.addEventListener("afterprint", () => {
  detailsBeforePrint.forEach(([detail, open]) => { detail.open = open; });
});
document.getElementById("print").addEventListener("click", () => window.print());
window.addEventListener("hashchange", () => showActivity(true));
showActivity();
