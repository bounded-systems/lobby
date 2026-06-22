# vault

A private Obsidian vault for thinking + drafting, with a **local, offline** LLM.
Drafts here become posts on [robertdelanghe.dev/blog](https://robertdelanghe.dev/blog).

## One-time local setup
1. Obsidian → **Open folder as vault** → this repo.
2. [Ollama](https://ollama.com): `ollama pull llama3.2` and `ollama pull nomic-embed-text`.
3. Community plugins → enable **Copilot**, **Smart Connections**, **Templater**.
   - Copilot → provider **Ollama** (`http://localhost:11434`), model `llama3.2`; use **Vault QA** to chat over notes. Nothing leaves your machine.
   - Smart Connections → local embeddings (`nomic-embed-text`).
   - Templater → template folder `templates/`.

## Structure
- `notes/` — the knowledge base. Copilot / Smart Connections index this.
- `drafts/` — posts-in-progress (use the post template).
- `templates/` — note + post templates.
- `index.md` — map of content.

## Publish flow
A finished `drafts/<slug>.md` is **publish-ready by construction**: its frontmatter
matches the blog's contract (`bdelanghe/site` → `contract/posts.schema.json`). To publish,
copy it to `site/posts/<slug>.md` and open a PR — the site validates the frontmatter,
renders it, and the `cards` workflow generates its social card.

## The contract (keep in sync with the site)
**Frontmatter:** `title`, `date` (YYYY-MM-DD), `description` (≤160 chars), optional `slug`, `tags`, `syndication`.
**Body:** markdown (small safe subset) + `{{token}}` transclusion — facts come from canonical
tokens, not retyped: `{{thesis}}`, `{{org}}`, `{{email}}`, `{{proof.prx}}` … (resolved at site build).
