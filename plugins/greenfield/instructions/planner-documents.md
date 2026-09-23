# Planner documents

The person and the implementer share one HTML plan cover sheet, rendered with the `page` house standard and saved in the work's bundle. It carries high-level context and validation criteria; do not duplicate it in an agent-only implementation plan.

| Document | Skill | Reader |
| --- | --- | --- |
| Explainer | `explain` | person |
| Brief | `brief` | person, then you |
| Options | `options` | person, who decides |
| Spike | `spike` | you and one child |
| Plan cover sheet | `plan` | person approves it; implementer and reviewers read the same page |

## One piece of work, one bundle

Every page for one piece of work goes in the same bundle, a folder with fixed file names and relative links: the brief as `index.html`, then `options.html`, `cover-sheet.html`, `explainers/`, `mockups/`, `evidence/`. The brief is the hub: it lists the others under "Related", and each links back. The bundle is local by default. The `page` skill's bundle reference says how to choose a destination and publish to it. Settle the destination once, early, and tell the person where the documents are.

## Where research goes

What the person learns is not pasted into the brief or the cover sheet as a block. It is split by who needs it:

- How the system works today, in general: the explainer, or the conversation when it is small.
- Facts that define the problem: the brief, under Today, Evidence, and Sources. Questions still unanswered: the brief's Unknowns.
- Learning that changed which approaches are viable: the options page, under "What we learned".
- The outcome: the cover sheet's "Decisions locked" and "Deferred", with a link to the options page. Not the journey.
- The cover sheet links the relevant context and approved design. Its package outcomes and validation criteria carry the implementation handoff; no separate markdown plan or cards.

The test: would it still be true under a different approach? Brief. Is it about choosing between approaches? Options.

## Where alternatives go

The brief names an open decision. The options document argues it and the person picks. The plan cover sheet records what was chosen, what was rejected, and why. Work packages assume the choice.
