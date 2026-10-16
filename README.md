# People, practice & possibility

A static, customer-neutral Microsoft 365 Copilot hands-on site for three exact scenarios:

1. Draft your quarterly performance self-review (not a manager rating).
2. Design a leadership effectiveness session.
3. Rehearse a hard conversation.

The guided navigation, copyable prompt cards, Goal / Context / Source / Expectations pattern, reflections and human-review checkpoints follow the approach of the [reference hands-on site](https://sgreenlee11.github.io/m365-copilot-vip-hands-on/). This implementation is independent and does not modify that repository.

## Run locally

No build step or application dependencies. From the repository root:

```powershell
npx http-server . -a 127.0.0.1 -p 8765 -c-1 --silent
```

Open `http://127.0.0.1:8765`. Use an HTTP server rather than opening the HTML file directly so source-copy requests work. Clipboard access normally requires localhost or HTTPS; if blocked, select/copy the prompt manually or download/open the TXT file.

## Deliver the lab

Allow 60 minutes: setup 5, self-review 15, session design 20, conversation 15, reflection 5. Participants use their organization's approved work Copilot alongside this guide. Each lab begins in a fresh conversation with its corresponding complete synthetic TXT input. Attach where supported; otherwise paste the file text. The website itself does not connect to Copilot.

Core prompts are for interactive Copilot Chat. Optional challenge prompts add depth. The first two labs also include staged Cowork prompts; the conversation lab deliberately keeps one-turn-at-a-time rehearsal in interactive chat.

Before every delivery, the facilitator must confirm GA status, licenses, work-account access, tenant enablement, file-input rules and approved usage budget in the actual participant experience. Microsoft Learn's [Cowork overview](https://learn.microsoft.com/en-us/microsoft-365/copilot/cowork/) and [release notes](https://learn.microsoft.com/en-us/microsoft-365/copilot/cowork/whats-new) list work/school Cowork as GA and usage-based billing from June 2026 (reviewed October 15, 2026). That does not verify a particular tenant. See [admin governance](https://learn.microsoft.com/en-us/microsoft-365/copilot/cowork/cowork-admin-governance).

Do not demonstrate preview features or unavailable tools. No Frontier App skill, preview model, plugin, external connector, live enterprise search, browser automation or scheduled action is required. If Cowork is not enabled or budget-approved, run the stages in standard chat. Drafts stay in the conversation; prompts gate saving, sharing, sending and writeback.

## Synthetic data and evidence controls

Northstar Retail and all people, events and figures in `assets/*.txt` are fictional. No customer records, private correspondence or real personnel data are included. Do not enter real personnel information during this public training exercise.

- `self-review-evidence.txt`: Q3 review with prior-quarter context, duplicate registration rows versus verified completions, attribution limits and unproven pilot results.
- `leadership-session-brief.txt`: fictional internal learning notes, 90-minute limit, safe participation, decision practice and follow-through.
- `conversation-brief.txt`: observable slipped dates, documented impact, unknown causes and role-play boundaries.

The on-page verification checklists are intentionally explicit. Outputs vary; learners check claims against source IDs rather than treating a sample response as correct. Fictional internal learning notes are not external research or validated assessments. The external Situation-Behavior-Impact reference links to its originator, Center for Creative Leadership; no assessment or article is reproduced.

## Accessibility and privacy

Responsive layout, semantic headings, skip link, visible focus, keyboard-operable native controls, live copy/error messages and reduced-motion support. Without JavaScript, all activities and downloads remain readable. Print expands advanced prompts and includes all activities. Browser Back/Forward restores section navigation.

Only three completion flags are stored in localStorage under `people-practice-lab-progress-v1`; reset asks for confirmation. Storage failures are shown explicitly. The site has no analytics, third-party scripts/fonts, sign-in, upload mechanism or AI connection. Hosting providers still receive ordinary HTTP requests. Copying uses the device clipboard only.

## Publish

Publish the `main` branch root through GitHub Pages (Settings > Pages > Deploy from a branch > main / root). `.nojekyll` serves these static files without Jekyll processing.

Expected URL: https://sgreenlee11.github.io/m365-copilot-hr-hands-on/

After publishing, check the live site on desktop and mobile, every source download, prompt copying, section navigation and stored progress. Check the Pages deployment status rather than assuming a push is immediately live.

## Maintain

Run the dependency-free checks with `node --test tests\site.test.cjs` (Node 20+). They cover local links, prompt targets, evidence IDs, navigation, saved progress, exact copy text and explicit failure messages. Also check `node --check script.js` and inspect the rendered desktop/mobile pages.

Files: `index.html`, `styles.css`, `script.js`, `assets/`. Deep blue/yellow styling is intentionally unbranded. No real customer logos or references are needed. Recheck product documentation and availability gates before future sessions; keep source IDs and on-page checklists synchronized when editing practice data.
