# Plan cover sheet

An HTML page for the person who approves the plan. Write it for a human: what is being built, what was decided, what could go wrong, and how they will know it works. Lead with the story and pictures. Show ask-first actions as call-outs, not buried in a list.

```
Header                feature, one-line outcome, status chip:
                      draft | plan-reviewer: pass | approved | in build | done

In three sentences    what we are building, the approach, what the user gets
Before / After        diagram or mock-ups. Embed the design reference here and
                      name the screens that must match it.

Decisions locked      table: decision | chosen | rejected | why, in one line
                      link to the options document
Deferred              table: item | why deferred | revisit when (a concrete trigger)

Scope                 in, and out, as two short lists
Hard constraints      stack, dependencies, style, safety
Ask-first actions     migrations, production, deletes, anything public

How we will know it works
  Journeys            numbered user flows that qa will drive in the running app
  Whole-feature check commands and suites

Packages              table: WP | title | what it does in plain English |
                      level | depends on | status
Look at these first   the two or three packages you consider riskiest, and why.
                      Invite the person to cut any they would be nervous to
                      wake up to.

Change log            newest first. Replans are recorded here.
```
