# People, practice & possibility

A customer-neutral Microsoft 365 Copilot hands-on site for senior HR leaders.

## Session order

| Delivery | Activity | Preferred surface and input |
| --- | --- | --- |
| In person | Start here | Setup, source boundaries and prompting pattern |
| In person | Close out the week | Work IQ in Chat with attendees' approved email, Teams and meeting context; one reviewed Outlook reply draft |
| In person | Survey insights | Shared fictitious FY27 Q2 workbook; Chat for comments, Excel for counts, Analyst for support themes and synthesis |
| In person | Session close | Reflection and links to optional practice |
| After the session | Prompting pattern | Goal, context, source and expectations built across a conversation about an HR leadership decision |
| After the session | Prepare | Work IQ in Chat with a specific upcoming meeting and approved program papers |
| After the session | Create | A reviewed Decision Brief Handoff in Chat, then a one-page executive HR brief in Word |
| After the session | Follow Through | A specific past-meeting record in Chat, then a reviewed, unsent Outlook follow-up |
| After the session | Lead responsibly | Evidence audit, counterargument, audience check and accountable human review |

Only two use cases are delivered live. The five after-session sections replace the earlier self-review, session-design and conversation-rehearsal labs. They follow the generic executive hands-on, tailored to HR senior directors and above. The live path still ends at session close, not at a required third exercise.

The structure follows the [reference hands-on site](https://sgreenlee11.github.io/m365-copilot-vip-hands-on/) and its [generic exercises](https://sgreenlee11.github.io/m365-copilot-vip-hands-on/generic/), adapted independently for HR leadership. This repository does not modify the reference site.

## Run locally

No build step or application dependencies. From the repository root:

```powershell
npx http-server . -a 127.0.0.1 -p 8765 -c-1 --silent
```

Open `http://127.0.0.1:8765`. Use HTTP rather than opening the HTML file directly so text-source copying works. Clipboard access normally requires localhost or HTTPS; if blocked, select/copy the prompt manually or download/open the TXT file.

## Deliver the two live labs

Start here keeps setup to opening work Copilot and downloading the shared workbook, followed by introductory Goal / Context / Source / Expectations tips. Detailed privacy, source-handling and app instructions remain in the relevant exercises; facilitator preflight guidance stays in the preserved template rather than the welcome page.

Run one short prompt at a time, inspect a source, answer a question or make a choice, then continue. Longer final synthesis prompts are optional, after intermediate findings have been reviewed.

**Weekly closeout:** five prompt-and-review steps in Copilot Chat. Start with “Help me close out the week” without placeholders, then confirm the date range and time zone used. Use program-level communications, not employee cases. Ground Chat in selected work references with Work IQ on where licensed and enabled. Verify the latest reply in Outlook/Teams before treating an ask as pending. Copilot does not establish comprehensive mailbox coverage, actual unread status or that someone ignored a request. Step 4 stays in Chat and requests a follow-up email in Outlook, using a decision placeholder and verified context; review the response and any proposed action before use. Step 5 creates the weekly closeout brief in the same conversation, including a request for a Word document, PowerPoint presentation and rich visual. Review all generated outputs against the verified findings. Opening a thread in Outlook is a separate, collapsed optional activity after step 5: its prompt infers the request or decision from the current thread alone, without pasted Chat findings. Chat history does not transfer into Outlook. Distinguish stated commitments from suggested actions; leave the optional exercise reply unsent. The weekly lab uses attendees' approved work only, with no introductory content box or synthetic fallback. It retains per-step checkpoints but has no separate “What good looks like” block.

**Survey insights:** pre-download `assets/FY27-Q2-QC-Details-Fictitious.xlsx`. This is deliberately the lead dataset, not a fallback: do not ask attendees to supply real reviews for the group exercise. It contains quarterly-conversation responses, ratings and process fields, not an anonymous engagement survey.

The core survey sequence is:

1. Chat: attach the file, check its fields and population.
2. Chat: examine Manager 2's Leader Insight comments with row-level evidence.
3. Excel: verify completion statuses and development-item gaps.
4. Analyst: reattach the original demo and inspect support-request themes by manager.

Select one follow-up from the collapsed question bank if time allows. The remaining prompts are extensions, not an in-person checklist. They cover manager replies to vague goals and support requests, accomplishments, tenure/time in role, new-in-role support, rating differences and explanations, incomplete reviews, and measurable-goal coaching. The optional Analyst finisher asks for a one-page comparison, a Performance-rating chart and three proposed coaching priorities per manager.

Chat, Excel and Analyst do not inherit one another's conversation. Reattach the same unedited demo when switching surfaces and manually carry only reviewed notes. Preserve source aliases, worksheet rows, uncertainty and denominators.

## Self-paced HR leadership practice

These are the requested generic hands-on sections, not additional live exercises. Each has four short prompt-and-review steps, an explicit participant action between prompts, and an optional synthetic fallback. Prompting pattern and Create also have longer optional finishers.

**Prompting pattern:** frame an actual HR portfolio decision, clarify the authorized audience and tradeoffs, bound sources and dates, then specify an evidence-backed leadership discussion opener. Teach Goal / Context / Source / Expectations through separate turns before combining them.

**Prepare:** select a real upcoming program-governance meeting with Work IQ references, check the purpose and latest papers, verify documented participant views, and choose three questions about business value, capacity and employee experience. Never infer a stakeholder's position from attendance, title or silence.

**Create:** use reviewed program-level findings from attendees' work or the explicitly fictitious live survey analysis. Build and challenge a common Decision Brief Handoff before manually pasting it into Word. Draft a one-page CHRO/steering-group brief with Decision Needed, Situation, Evidence, Options, Recommendation and Risks. Verify the actual page layout. Word is not assumed to inherit the analysis or independently reopen original sources.

**Follow Through:** choose a specific past meeting and inspect its record. Teams post-meeting reasoning about spoken content requires an accessible transcript; an invitation or recording alone is not proof of transcript access. If unavailable, use reviewed, permitted notes and label the result notes-based. Respect copying/export restrictions. Distinguish decisions from discussion and agreed owners/dates from proposals. Manually move only the reviewed follow-up into an unsent Outlook draft; no automatic draft-opening, sending, scheduling or task creation.

**Lead responsibly:** audit a draft against original sources, challenge its recommendation, inspect audience/privacy implications, and record the human's Revise / Hold / Ready for human approval choice. This follows the generic six habits: Verify, Separate, Protect, Challenge, Edit and Own. It does not certify compliance, guarantee de-identification or make employment decisions.

Use approved program-level material, not employee cases, restricted workforce actions or individual talent assessments. Learning readiness, leadership development and workforce-planning processes provide senior HR context without turning the exercise into personnel evaluation.

## Workbook and interpretation controls

The downloadable workbook is a customer-neutral derivative of the supplied fictitious dataset. The original attachment is untouched. Worker names/IDs, executive labels, locations, organizational codes, job/grade identifiers and document properties were replaced with demo values; source-organization metadata is not carried into the new demo copy. The table structure, existing formatting and analytical fields are retained. No live employee records or private correspondence are included.

- One worksheet, `Sheet1`; Excel table `QC_Details`, range `A1:AO51`; 50 records and 41 columns.
- Manager 1 has 30 records; Manager 2 has 20.
- Fiscal Year 2027 / Q2 is the source fiscal label. Review dates are May 3-August 1, 2026, not calendar Q2.
- Development items = No: Manager 1, 1/30 (3.3%); Manager 2, 11/20 (55%). Blanks must not be counted as No.
- Successfully Completed: 28/30 and 16/20. Non-successful statuses total 2 and 4, with distinct process explanations that must not be collapsed.
- Employee support request present with blank manager reply: 9 and 7. This is not the same as all blank manager cells or a judgment that support was withheld.
- Manager 2 has 15/20 in the 0-3, 3-6 or 6-12 Months time-in-position bands. Do not treat tenure bands as exact dates or causal explanations.

Use `Worker` aliases and worksheet rows for evidence. Keep Length of Service AJ separate from Time in Position AK. Leadership ratings L/M are separate from Performance ratings P/Q; the chart uses manager-rated Performance Q only. For this demo, prompts explicitly order Leading above On-track above Off-track without taking numeric averages. Missing rating pairs are separate from agreement/disagreement.

Theme/goal-clarity coding is a reviewable interpretation, not a validated assessment. Count distinct workers rather than repeated words; multi-label themes can exceed 100% in total. Preserve blank responses, unequal team sizes and small-group limitations. No recorded reply does not prove no conversation occurred. This single synthetic snapshot supports practice and human-led coaching questions, not manager rankings, causal claims or employment decisions.

## Product availability and fallback routes

Before delivery, confirm GA status, licenses, tenant policy, Work IQ grounding, Copilot in Excel and Analyst in the exact attendee experience. Basic chat alone does not guarantee organization-wide work retrieval or agent access. No preview features are required.

In Excel, use a working copy in an approved location (OneDrive/SharePoint is a practical route). Confirm save destination and AutoSave settings; do not claim AutoSave is universally required. The workbook is already a table. Open the Copilot pane and use available analysis controls; allow edits only to a new analysis sheet when needed. Preserve the source table and independently check generated formulas, filters, PivotTables and charts.

Analyst is accessed under Agents in Microsoft 365 Copilot; attach the workbook using + / Attach content. It is a Microsoft-provided agent for licensed users and can be blocked by tenant policy. If unavailable, use attached-file prompts in Chat, label that route accurately, and verify numerical results in ordinary Excel. If Excel Copilot is unavailable, use manual filters/PivotTables. Never claim an unavailable app/agent performed an analysis.

Weekly closeout uses attendees' approved work with no synthetic route in the activity. For leave-behind labs, approved work remains the preferred input; collapsed synthetic TXT fallbacks provide a source-only route when work content is unavailable or inappropriate. The survey workbook is the explicit exception: it is the lead input.

- `weekly-closeout-fallback.txt`: retained legacy asset, no longer linked from the activity; W01-W06 cover an updated launch deadline, open asks, a resolved thread and unassigned dependency.
- `hr-leadership-fallback.txt`: H01-H06; fictional leadership-readiness pilot, participation updates, upcoming agenda, past-meeting notes and draft Decision Brief Handoff. Shared fallback for all five after-session sections, not a required input.

Fallback checks: H02's 64 of 80 completions supersede H03's preliminary 60; completion is not performance improvement or ROI. The $12,000 estimate excludes backfill and is unapproved. H05 keeps four sites pending checks, gives the L&D Director an October 23 date and gives the HR Operations Lead no stated due date. H04/H06 concern a later decision; they must not be treated as H05 approvals. Keep notes distinct from transcripts and proposals distinct from commitments.

Never mix fictional facts into real work. Keep work data in approved private apps, not this site, a public chat or a group screen. Access permissions do not override HR/AI policy. Do not use sensitive employee cases, health information, grievances or restricted assessments. Real HR-data analysis requires separate policy, privacy and access review.

## Documentation

Live-lab documentation reviewed October 16, 2026; Chat, Word and meeting guidance checked October 19, 2026. This does not certify tenant enablement:

- [Copilot Chat setup and Work IQ](https://support.microsoft.com/en-us/microsoft-365-copilot/get-started-with-microsoft-365-copilot-chat)
- [Catch up on work](https://support.microsoft.com/en-us/microsoft-365-copilot/catch-up-on-work-quickly-using-microsoft-365-copilot-chat)
- [Grounding and source limitations](https://support.microsoft.com/en-us/microsoft-365-copilot/what-information-does-copilot-use-to-answer-my-prompt)
- [Copilot in Excel](https://support.microsoft.com/en-us/excel/copilot/get-started-with-copilot-in-excel) and [Excel tips/save settings](https://support.microsoft.com/en-us/excel/copilot/copilot-in-excel-tips)
- [Analyst setup and attachments](https://support.microsoft.com/en-us/microsoft-365-copilot/get-started-with-analyst-in-microsoft-365-copilot)
- [Agent installation, licensing and governance](https://learn.microsoft.com/en-us/microsoft-365/copilot/copilot-agent-install)
- [Draft and add content with Copilot in Word](https://support.microsoft.com/en-us/word/copilot/draft-and-add-content-with-copilot-in-word)
- [Meeting catch-up in Teams](https://support.microsoft.com/en-us/teams/copilot/catch-up-on-meetings-with-microsoft-365-copilot-in-teams)

## Accessibility, privacy and maintenance

For live delivery, Survey insights' facilitator checks and Session close's facilitator notes/product sources are retained in the inert `#facilitator-content` HTML template, outside the participant activities. They do not render, enter keyboard navigation or appear in the printed guide, even when printing expands disclosures. After delivery, the preserved blocks can be restored into a right-hand resource column with its layout styles. No restoration toggle is shown during the session. This is presentation-only hiding, not access control: the material remains readable in the page source. Product references also remain in this README.

Responsive layout with navigation and exercise content only; there is no shared resource-card sidebar or bottom block. Dataset downloads and optional synthetic fallbacks remain within the relevant exercises. Grouped navigation, semantic headings, skip link, visible focus, keyboard-operable native controls, live copy/error messages and reduced-motion support. Without JavaScript all activities and downloads remain readable. Print expands disclosures and includes live and after-session material. Back/Forward restores navigation.

Reading text and secondary labels use relative units: at the default browser font setting, body text is 18px, prompts and exercise instructions are 17px, and secondary labels are 13-16px. Prompt text is not reduced on mobile. The reading layout is capped at 1440px, and navigation moves above the content at 960px to avoid cramped tablet columns. Copy/download controls have a 44px minimum height, and prompt headers wrap rather than squeezing their titles. Browser text-size preferences remain effective; print retains its compact prompt styling.

Seven completion flags are stored under `people-practice-lab-progress-v1`. The header distinguishes two live labs from five later sections. Saved weekly/survey progress remains valid. Retired self-review/session/rehearsal flags do not mark the new sections complete; obsolete section hashes fall back to Start here. Reset asks for confirmation and clears all seven. Storage errors are surfaced explicitly. The site has no analytics, external scripts/fonts, sign-in, upload mechanism or AI connection. Copying uses the device clipboard only.

Run:

```powershell
node --test tests\site.test.cjs
node --check script.js
python -m unittest discover -s tests -p "test_*.py"
```

Tests cover navigation order, live/after-session progress, prompt lengths/targets, copy/error behavior, workbook structure and benchmark counts, synthetic identifiers and metadata boundaries. Python workbook checks use only the standard library; no Excel/Python package installation is required. Inspect desktop/mobile rendering after layout changes.

Files: `index.html`, `styles.css`, `workshop.css` (live/after-session layout), `script.js`, `assets/` and `tests/`. The existing deep blue/yellow styling is retained. Keep fallback evidence IDs, workbook columns, benchmark checks and prompts synchronized.

## Publishing

GitHub Pages publishes from `main` / repository root with `.nojekyll`. Push only after publication is explicitly requested; a push to that branch can update the public site. The current published edition uses the clean live-delivery layout, with facilitator material preserved out of view for later restoration.

Site URL: https://sgreenlee11.github.io/m365-copilot-hr-hands-on/

Before publishing, recheck every downloadable asset for content and metadata privacy, then verify the Pages deployment and live URLs. A local preview is not evidence that the public site was updated.
