# Education Software SDLC Dataset

This dataset contains **eight education-related software projects** and publicly documented evidence about their software development life cycle (SDLC). It is designed for dataset use, not as a claim that undocumented internal practices were observed.

## Files

| File | Purpose |
|---|---|
| `education_software_sdlc.csv` | One row per software project with normalized evidence fields and source columns. |
| `education_software_sdlc.json` | Same records in nested JSON, preserving each project’s source list. |
| `source_index.json` | Flat index of all 57 cited sources and the evidence field each source supports. |
| `research_scope_and_method.md` | Scope, inclusion rules, evidence rules, and known limitations. |

## Dataset interpretation

The `sdlc_model` field is intentionally conservative. A named methodology is reported only when the cited public documentation explicitly supports it. Otherwise, the value begins with **“Not explicitly stated”** and describes the documented lifecycle activities without relabeling them as Agile, Scrum, Waterfall, or DevOps.

The lifecycle evidence is separated into requirements, design/architecture, implementation, testing, release/operations, and security/maintenance. Each field summarizes publicly accessible documentation and provides source URLs through the source columns or `source_index.json`. The `limitations` field records important gaps, stale/version-specific documentation, or boundaries between public open-source evidence and proprietary hosted-service operations.

## Included projects

The projects are Moodle, Open edX, Sakai, Kolibri, Oppia, Canvas LMS, OpenBoard, and BigBlueButton. They were selected because each has a public project repository or official documentation with enough lifecycle evidence to support multiple traceable fields. The set is **not a ranking** and is not intended to represent every education software product.

## Verification guidance

For reproducibility, open the source URLs in `source_index.json` and compare the cited documentation with the corresponding evidence field. Public project documentation can change after dataset creation, and some sources are version-specific. The dataset therefore records the source title, URL, and the evidence area supported by that source rather than asserting that every documented practice is consistently followed for every change.

## Research date

The research was performed on **2026-09-22**. The dataset uses the public source records available during that research pass. The research gathered official project documentation, official repositories, developer guides, release policies, security policies, issue guidance, and CI/testing documentation. No claims were added solely from general knowledge.

## Suggested use

For machine-learning or analytics work, treat the evidence columns as text features and `sdlc_model` as a cautiously labeled field. Do not convert “not explicitly stated” into a negative label. A missing or incomplete public record means that the practice was not verified from the cited sources, not that the project does not perform that activity internally.

## License and source rights

This compilation is a research aid. The cited projects and documentation retain their own licenses and terms. Users should review each linked source before redistributing project-specific text or using the dataset in a commercial or compliance-sensitive context.
