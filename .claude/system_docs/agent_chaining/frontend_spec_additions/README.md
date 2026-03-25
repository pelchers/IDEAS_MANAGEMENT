# Frontend Spec — Chain Integration

This subfolder documents how the frontend spec system integrates with the agent chaining system specifically.

**For the full frontend spec system documentation, see:** `.claude/system_docs/frontend_spec/`

## Chain-Specific Integration

1. **`chain-session-init.sh`** outputs the frontend spec path in the mandatory reading list
2. **`chain-continue.sh`** passes spec context to the next spawned agent
3. **`orchestrator-chain-agent`** validates output against spec post-phase (orchestrated mode)
4. **`require-frontend-spec` hook** auto-creates spec before chain-agent writes .tsx files

## ADR Setup Changes
The `adr-setup` skill was enhanced (additive only) to:
- Require `frontend_spec.md` for sessions with frontend phases
- Add Step 0: verify spec exists before starting work
- Add validation checklist items for spec coherence
- Include `templates/frontend_spec_template.md` with self-describing header
