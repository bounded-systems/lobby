#!/usr/bin/env node
// validate.mjs — schema-first gate: every note conforms to its type's contract.
// A note's `type` selects contract/<type>.schema.json (default: note). Dep-free,
// same boundary discipline as bdelanghe/site and fold-engine. Run: node validate.mjs
import { readFile, readdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const SCAN = ["notes", "drafts"];

const parseFrontmatter = (raw) => {
  const m = /^---\n([\s\S]*?)\n---/.exec(raw);
  if (!m) return null;
  const fm = {};
  for (const line of m[1].split("\n")) {
    const mm = /^([\w-]+):\s*(.*)$/.exec(line);
    if (!mm) continue;
    let v = mm[2].trim();
    if (/^\[.*\]$/.test(v)) v = v.slice(1, -1).split(",").map((s) => s.trim().replace(/^["']|["']$/g, "")).filter(Boolean);
    else v = v.replace(/^["']|["']$/g, "");
    fm[mm[1]] = v;
  }
  return fm;
};

const typeName = (v) => Array.isArray(v) ? "array" : v === null ? "null" : typeof v;
function check(schema, data, path, errs) {
  if (schema.type && schema.type !== typeName(data)) { errs.push(`${path}: expected ${schema.type}, got ${typeName(data)}`); return; }
  if (schema.enum && !schema.enum.includes(data)) errs.push(`${path}: '${data}' not in [${schema.enum.join(", ")}]`);
  if (schema.type === "array" && schema.items) data.forEach((it, i) => check(schema.items, it, `${path}[${i}]`, errs));
  if (schema.type === "object" || (!schema.type && schema.properties)) {
    for (const r of schema.required ?? []) if (!(r in data)) errs.push(`${path}: missing required '${r}'`);
    for (const [k, v] of Object.entries(data)) {
      if (schema.properties?.[k]) check(schema.properties[k], v, `${path}.${k}`, errs);
      else if (schema.additionalProperties === false) errs.push(`${path}: unknown field '${k}'`);
    }
  }
}

const schemas = {};
const loadSchema = async (t) => (schemas[t] ??= JSON.parse(await readFile(join(root, "contract", `${t}.schema.json`), "utf8")));

let files = 0, bad = 0;
for (const d of SCAN) {
  let entries = [];
  try { entries = await readdir(join(root, d), { recursive: true }); } catch { continue; }
  for (const f of entries) {
    if (!f.endsWith(".md")) continue;
    files++;
    const fm = parseFrontmatter(await readFile(join(root, d, f), "utf8"));
    if (!fm) { console.error(`✗ ${d}/${f}: no frontmatter`); bad++; continue; }
    const t = fm.type || "note";
    let schema; try { schema = await loadSchema(t); } catch { console.error(`✗ ${d}/${f}: no contract for type '${t}'`); bad++; continue; }
    const errs = [];
    check(schema, fm, `${d}/${f}`, errs);
    if (errs.length) { bad++; for (const e of errs) console.error(`✗ ${e}`); }
  }
}
console.log(`validate: ${files} note(s) · ${bad} invalid`);
process.exit(bad ? 1 : 0);
