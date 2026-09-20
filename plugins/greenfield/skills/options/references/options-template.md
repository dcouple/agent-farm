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
