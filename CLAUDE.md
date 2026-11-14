# CLAUDE.md

See [AGENTS.md](./AGENTS.md) for the complete AI coding agent manifest, symbol glossary, hard engineering invariants, and build/QA gate commands.

Quick reminder for Claude Code / multi-agent sessions:
- Edit modular files in `src/styles/`, `src/modules/`, and `src/presets/` — never hand-edit compiled `index.html` or `dist/*.html`.
- Always finish edits with:
  ```bash
  npm run build:all && npm run check && npm run qa
  ```
- Consult `docs/agent-playbook/` before making architectural changes to HUD responsiveness, WebGL shaders/presets, or tabletop mechanics.
