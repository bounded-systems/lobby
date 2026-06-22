# vault — a schema-first corpus

A knowledge corpus where **every note conforms to a contract**. Notes are typed;
drafts are publish-ready by construction. (A local LLM over it is optional — the
value here is the *schema*, not the AI.)

## The idea
Each note declares a `type`; its `type` selects a contract in `contract/`:
- `type: note | concept | project` → `contract/note.schema.json` (loose knowledge base)
- `type: post` → `contract/post.schema.json` (strict; mirrors the blog's contract + a routing `target`)

`node validate.mjs` (and CI, `.github/workflows/validate.yml`) **fails any note that doesn't conform** — the same invalid-states-unrepresentable boundary as `bdelanghe/site` and `fold-engine`.

## Structure
- `notes/` — the knowledge base (typed notes)
- `drafts/` — posts-in-progress (`type: post`)
- `contract/` — the schemas every note is held to
- `templates/` — Templater templates that emit conformant frontmatter
- `validate.mjs` — the schema gate

## Publish flow (routed by `target`)
A finished `drafts/<slug>.md` (`type: post`):
- `target: dev` → robertdelanghe.dev (first-person) → copy to `site/posts/<slug>.md`
- `target: bounded-tools` → bounded.tools (Bounded Systems, we-voice)

Its frontmatter already matches the site's `posts.schema.json`, so it builds, renders semantic markup, and gets an auto social card — no edits.

## Obsidian (schema tooling)
Open as a vault; enable: **Metadata Menu** (typed frontmatter / fileClass *is* a schema, enforced as you type), **Templater** (`templates/`), **Dataview** (query the typed frontmatter), **Linter** (normalize frontmatter).

## Optional: offline LLM
If you want chat over the corpus: Ollama + Copilot/Smart Connections, fully local. Not required.
