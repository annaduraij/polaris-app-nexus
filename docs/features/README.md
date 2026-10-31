# Polaris feature documentation convention

This convention applies to Polaris and applications developed under it. Use lowercase directory names throughout.

```text
docs/
  features/
    README.md
    implemented-feature.md
    planned/
      proposed-feature-set.md
```

## Lifecycle

- Write one Markdown document per coherent feature or feature set. Use stable, descriptive, lowercase hyphenated filenames.
- Keep proposed, design-approved, and in-progress work under `planned/`. Record which stage it has reached inside its document.
- Place a feature document directly under `features/` only when its described behavior is implemented and verified. Record whether it is available locally or published; local completion must not imply deployment.
- On completion, move the planned document into `features/`, replace future-tense descriptions with actual behavior, record verification evidence and remaining limitations, and update incoming links and the feature index.
- Keep later extensions to an established feature in a separate planned document linked to the established behavior. Move the extension into the established document when verified, retaining useful decision history in Git.

## Document contents

Each document should make these points clear without requiring the reader to reconstruct a chat:

- Status, purpose, intended users, and the problem solved.
- Agreed behavior and relevant data or interface requirements.
- Proposals and unresolved questions, explicitly separated from agreed decisions.
- Acceptance criteria; for established features, the checks actually performed and their results.
- Relevant dependencies, sources, related feature documents, and material limitations.

Use only sections that help explain the feature. Do not invent implementation details or treat interview suggestions as approved requirements. Keep the feature index current. A root plan may summarize sequencing and shared calculations, but individual feature documents own feature requirements.

## Existing Polaris references

Existing guides remain at their current paths and do not constitute a new per-feature inventory. As established capabilities are documented individually, link to the owning guide and its verification evidence rather than copying large sections.

- [Shared design-system integration](../design-system.md)
- [Source audit](../source-audit.md)
- [Browser verification](../design-verification.md)
- [Planned applications](../planned-apps.md)

The Photography PPI Calculator adopts this documentation layout during its design interview. Its features remain planned until implemented and verified.
