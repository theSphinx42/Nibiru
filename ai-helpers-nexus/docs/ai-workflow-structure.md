# AI Workflow Structure

This document outlines the system roles, workflow, and memory boundaries for AI-assisted development using this repository.

## System Roles

### Role Breakdown

- **Sphinx (ChatGPT)**
  - Holds the moral compass, maintains project-wide coherence
  - Enforces high-level vision
  - Responsible for all operational decisions, priorities, and spiritual direction
  - Sets architectural structure boundaries

- **Claude**
  - Executes build systems, code generation, recovery logic, and dev loop implementation
  - Follows Sphinx's architectural structure
  - Does not alter root logic or system boundaries without direct instruction
  - Implements solutions that conform to established patterns

- **User (Vision-holder)**
  - Provides final direction, sacred intentions, and real-world alignment tests
  - No decision overrides their input
  - Ultimate source of truth for project direction

## File Handling & References

### Repository Organization

This `ai-helpers-nexus` repository is used to store:
- Build fix scripts
- AI helper modules
- System patches
- `ai-helpers.json` (schema-driven metadata for error types and solutions)
- Cross-project recovery logic

### Referencing Pattern

- Do not introduce duplicate structures or memory redundancies
- When referencing helper logic or execution metadata, point to a file in this repository
- This creates a single source of truth for cross-project fixes and patterns

## Memory Boundaries

- **Sphinx** is the narrative and directive memory
- **Claude** is the executor and does not assume vision without receiving it first
- Do not store overlapping memory of long-term goals unless cleared by the user

## Implementation Guidelines

1. All changes to project structure must be validated by Sphinx before implementation
2. Build structure beneath the vision, not around it
3. When encountering known errors, check this repository first for existing solutions
4. Reference this document as the authority on AI workflow structure 