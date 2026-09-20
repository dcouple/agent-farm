# Choosing a package's level

You read the code and wrote the steps, so you know how mechanical each package is. Say so. Give a level, never a model name: each plugin maps levels to its own models.

| Level | The package looks like |
| --- | --- |
| `economy` | The steps name every file. A pattern already exists to copy. One module, or several with nothing to infer. Reversible. The checks are commands |
| `standard` | Some shape has to be inferred. First of its kind. Behaviour that can be wrong while compiling, so it has `journey` or `visual` checks. Anything not reversible: schema, auth, payments, production side effects |
| not ready | The implementer would have to choose the design. That is not a level. Go back to options |

Add one line of why, naming what drove it: ambiguity, coupling, reversibility, how it is verified, or novelty.

The level is where the implementer starts, not a ceiling. A failed check promotes the package, and the implementer may start higher if the package turns out harder than it looked. When the same kind of package keeps getting promoted, give that kind `standard` next time.
