# Options template

Lay the HTML page out in this order. Keep each option scannable: a short paragraph and a small table beat long prose.

```
Options: {feature}
Source: {brief or bug report link}
Status: waiting on pick | Picked: {option}, by {who}, {date}

Decision 1: {what must be decided}

  Option A: {name}
    What it is
    Optimizes               speed | risk | consistency | usage
    Gives up
    Risk and reversibility
    Complexity ladder rung        1 configuration .. 6 new infrastructure, with the reason
    Complexity statement    added complexity, bug risk, ongoing maintenance
    Requirement trade-offs  which requirements drive cost; simpler scope and value lost
    Migration cost
    How we would verify

  Option B ...
  Option C ...

  Smallest version          always present: what ships if we defer everything
                            deferrable, and what the user loses
  Do nothing                always present: what stays wrong, observably

  Recommendation
  What you accept if you take it
  Blocking unknowns         each becomes a spike or a research question, or "none"

Decision 2 ...

Socrates verdict            pass | clarify | rethink, and which revision it reviewed
What we learned             from explainers and spikes, and why the options changed
Change log                  newest first
```

## Complexity statements support the choice

For each option, give two to four plain-language sentences comparing it with the current codebase. The complexity ladder identifies the kind of change; the statement explains its consequences. Cover both **what the feature promises** and **how we build it**:

- **Added complexity:** systems reused or extended, new state, interactions, contracts, schema, dependencies, or operational machinery. Say when an option reduces complexity or adds little.
- **Bug and maintenance risk:** name the important likely failure modes and future burden—such as keeping two representations in sync, handling permission combinations, supporting older data, retries, or maintaining another service. Include only drivers relevant to this decision; distinguish initial implementation effort from recurring cost.
- **Requirement trade-offs:** identify the behavior or requirement causing the burden and a realistic simplification or deferral that would reduce it. State what the user loses or gains. Do not silently weaken an agreed requirement: present that as a choice requiring the person's decision.

Use qualitative labels such as low/moderate/high only when accompanied by a concrete explanation; no mandatory numeric score or fabricated probability. Ground claims in known systems and bounded repository inspection, linking evidence where useful. Mark unverified claims and decision-changing unknowns explicitly rather than presenting guesses as facts.

Apply the same comparison to the smallest version and doing nothing: no new code does not mean no existing maintenance cost or unresolved problem. Recommend based on user value as well as complexity; the lowest-complexity option need not be the best option. Keep this analysis in options. Carry the selected trade-off and important constraints into the cover sheet without copying every alternative or turning options into an implementation plan.

Example (illustrative, not a repository finding): “Scheduled delivery adds durable pending state and cancellation/retry behavior to the existing send flow. The main risks are duplicate sends and races between editing and dispatch; ongoing maintenance includes failed-job recovery. Limiting the first version to one-off sends avoids recurrence and timezone-rule complexity, but users must schedule each occurrence themselves.”
