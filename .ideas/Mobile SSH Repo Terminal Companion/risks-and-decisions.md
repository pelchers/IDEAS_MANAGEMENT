# Risks and Decisions

## Current Decisions

- Use SSH as the primary connection mechanism.
- Build the mobile app in React Native + Expo.
- Treat repository discovery as a first-class feature.
- Treat full-drive remote browsing as an intentional part of the product.

## Risks

### Terminal Fidelity

Mobile terminals are hard to make feel trustworthy for long coding sessions. Rendering, selection, latency, and keyboard behavior may be the hardest UX problem in the product.

### Expo Limitations

If required SSH or terminal capabilities are not viable in standard Expo workflows, the project may need a custom dev client or native code earlier than expected.

### Host Safety

Remote filesystem access from `C:\` raises obvious safety issues. The product needs guardrails before it can safely support edits, deletes, or shell-triggered file operations.

### Repo Discovery Cost

Scanning large developer machines can be slow. A helper service or cached index may be required.

## Open Questions

- Is a helper service acceptable on the PC host, or must everything run through raw SSH commands?
- Should file editing happen directly in the mobile UI or only through the terminal at first?
- What is the minimum viable “equitable” terminal experience for this product to be worth using?
