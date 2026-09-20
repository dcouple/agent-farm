# Bundles and destinations

Every piece of work has one bundle: a folder holding all the pages written for a person. What a bundle is never changes. Where it is published can.

## The bundle

```
<root>/<slug>/
  index.html           the brief. It is the hub, so opening the folder lands on it
  options.html
  cover-sheet.html
  explainers/<topic>.html
  mockups/<screen>-v<n>-<option>.html     or .png
  evidence/            screenshots and recordings
  bundle.json
```

- `<slug>` is a short kebab-case name for the work, the same one used for the branch and for `docs/agent/plans/<slug>/` when a plan follows.
- Link between documents with relative links only (`options.html#decision-1`, `explainers/queue.html`). A bundle must work unchanged when it is opened from disk, zipped, copied, or published somewhere else.
- The brief lists every other document under "Related", and each of them links back to `index.html`. An explainer written before any brief exists gets its own bundle, and is moved in and linked when the brief appears.
- Create a document only when it is needed. A small piece of work may be `index.html` and `cover-sheet.html` and nothing else.
- Files for agents (PLAN.md, handoff cards, spikes) are not part of the bundle. They live in the worktree. The cover sheet names the branch and the path to PLAN.md, and PLAN.md's header names where the cover sheet is.

`bundle.json` is how a later session, or an orchestrator, finds and updates the same bundle instead of making a second one:

```json
{
  "slug": "scheduled-texts",
  "title": "Scheduled texts",
  "status": "draft | ready for options | ready for plan | approved | in build | done",
  "documents": ["index.html", "options.html", "explainers/sending-pipeline.html"],
  "destination": "local",
  "published": { "kind": null, "id": null, "url": null },
  "updated": "<ISO 8601 time>"
}
```

## Where it goes

Work out the destination once, in this order, and record it in `bundle.json`:

1. What the person says in this conversation
2. A `docs` line in the launch context
3. A standing preference in the workspace instructions or the target repository's own conventions
4. Otherwise `local`

`local` means `<root>` is `tmp/greenfield/` in the project you were started in. Check that `tmp/` is git-ignored, and never commit a bundle unless the person asks for it to live in the repository. If the destination is a path, that path is `<root>`.

## Publishing somewhere else

A named destination, such as a document workspace, a wiki, or a shared drive, is a place you publish a copy to. The local bundle stays the working copy.

1. Build or update the bundle locally first.
2. Publish it with the tools this session has for that destination, following that destination's own skill or documentation. Keep the folder structure and the relative links. One piece of work maps to one container there (one workspace, one folder, one page tree).
3. If `bundle.json` already has a `published.id`, update that same container. Never create a second one. If you are unsure whether an earlier publish succeeded, look before retrying.
4. Private by default. Never widen who can see it unless the person asks.
5. Read back what you published, then record its `kind`, `id`, and `url` in `bundle.json`.
6. If the destination cannot hold several linked files, publish `index.html` with the other documents' content reachable from it as best the destination allows, and say what was lost.
7. If the tools are missing or publishing fails, say so plainly, keep working from the local bundle, and give its path. Never claim something was published that was not.

Give the person the published link when there is one, and the local path otherwise.

## Session telemetry in the same artifact

When the workspace or person requests telemetry evidence, use the workspace's
collection and export instructions. Include only sessions associated with this
work and their relevant descendants, not the machine's entire telemetry store.
Keep the evidence under `evidence/telemetry/`, preserve its provenance and
completeness metadata in `bundle.json`, and publish it with the other bundle files
to the same existing container.

Collection, export commands, provider configuration, and destination-specific
upload procedures belong in project workspace instructions, not this skill.
Conversation content requires explicit authorization; even metadata can contain
private paths or tool arguments. Preserve the artifact's audience.

A running session's evidence is a live snapshot, not a final record. Arrange for
the parent or orchestrator to refresh the evidence and the published bundle after
the associated sessions finish. Distinguish local export from successful upload,
verify the published evidence, and report incomplete snapshots or failures plainly.
