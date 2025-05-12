# Project Workflow and Logistics Documentation

This document outlines the structured workflow adopted for this project, centered around the `logistics/` directory. This process aims to ensure clarity, traceability, and quality throughout the development lifecycle, especially for complex tasks like refactoring or new feature implementation.

## 1. Purpose of the `logistics/` Directory

The `logistics/` directory serves as a central hub for all project management and process-related artifacts. It helps keep planning documents, development notes, and QA records organized and accessible.

**Current Structure:**

```
logistics/
├── notes/         # Ongoing development notes, logs of changes, and immediate TODOs.
├── plans/         # Detailed plans for major tasks, features, or refactoring efforts.
└── qa/            # Quality Assurance plans, test descriptions, and QA execution logs.
```

## 2. Breakdown of Subdirectories and Their Use

### 2.1. `logistics/plans/`

- **Purpose:** To store comprehensive plans for significant development efforts. These plans are typically created before starting a major task.
- **Content:**
  - Detailed breakdown of the task into phases or steps.
  - Proposed architectural changes or new structures (e.g., directory layouts, class diagrams using Mermaid).
  - Key objectives and acceptance criteria for each phase.
  - Potential risks and mitigation strategies.
- **Example File:** [`refactor_typescript_agent_framework.md`](logistics/plans/refactor_typescript_agent_framework.md)
- **Workflow Integration:** Plans are usually drafted in "Architect" mode, discussed, and approved by the user before implementation begins.

### 2.2. `logistics/notes/`

- **Purpose:** To maintain a running log of development activities, decisions made during implementation, observations, and short-term TODOs for the current phase.
- **Content:**
  - Chronological entries detailing changes made (e.g., files created/modified, dependencies added).
  - Rationale behind specific implementation choices.
  - Issues encountered and how they were resolved.
  - A list of immediate next steps or reminders for the ongoing phase.
- **Example File:** [`log.md`](logistics/notes/log.md) (or a more specific name like `phase1_development_log.md`)
- **Workflow Integration:** Notes are typically updated in "Code" mode as tasks are being executed. This provides a granular trace of the development process.

### 2.3. `logistics/qa/`

- **Purpose:** To document the Quality Assurance (QA) process, define test plans, and record the results of QA activities after each development phase.
- **Content:**
  - Overall QA strategy for the project or specific feature.
  - Detailed descriptions of test cases or baseline tests to be run.
  - References to automated test scripts (e.g., those in the `test/` directory).
  - Execution logs for each QA cycle, including:
    - Date of QA.
    - Commands executed.
    - Observed output.
    - Pass/Fail status.
    - Any anomalies or issues found.
- **Example File:** [`qa_log.md`](logistics/qa/qa_log.md)
- **Workflow Integration:** QA planning and execution typically occur after a development phase is completed. Results are logged before moving to the next phase or marking the overall task as complete.

## 3. The Iterative Development Workflow Cycle

This workflow is designed to be iterative, especially for larger tasks broken down into phases.

**Phase 0: Task Initiation & Understanding**

- Receive and clarify the user's request.
- Initial assessment of scope and complexity.

**Phase 1: Planning (Typically in "Architect" Mode)**

1.  **Information Gathering:** Use tools (`read_file`, `list_files`, `search_files`, etc.) to understand the current state of the codebase or system.
2.  **Clarification:** Use `ask_followup_question` if more details are needed from the user.
3.  **Plan Creation:**
    - Develop a detailed plan document (e.g., `logistics/plans/feature_x_plan.md`).
    - Break down the task into manageable phases.
    - Include diagrams, proposed changes, and objectives.
4.  **Plan Review & Approval:** Present the plan to the user for feedback and approval. Iterate on the plan if necessary.

**Phase 2: Implementation (Typically in "Code" Mode)**

1.  **Execute Plan (Phase by Phase):** Work through the approved plan, one phase at a time.
2.  **Tool Usage:** Utilize appropriate tools (`write_to_file`, `apply_diff`, `execute_command`, etc.) to make changes.
3.  **Development Logging:**
    - Regularly update the relevant log file in `logistics/notes/` (e.g., `logistics/notes/current_phase_log.md`).
    - Document changes made, commands run, outputs observed, and any immediate TODOs for the current step.
4.  **Self-Correction:** If issues arise (e.g., tool errors, unexpected behavior), analyze, debug, and correct them. Log these events.

**Phase 3: Quality Assurance (Typically at the end of each Phase in "Code" Mode)**

1.  **Define QA for the Phase:**
    - Outline the specific tests to be performed for the completed phase in `logistics/qa/qa_log.md`.
    - This might involve running existing automated tests, creating new ones, or performing specific manual checks.
2.  **Create/Update Test Scripts:** If new automated tests are needed, create them (e.g., in the `test/` directory).
3.  **Execute QA:** Run the defined tests and manual checks.
4.  **Log QA Results:**
    - Append the detailed results (commands, output, pass/fail status, observations) to `logistics/qa/qa_log.md`.
5.  **Analysis & Iteration:**
    - If QA fails: Return to Phase 2 (Implementation) to fix the issues. Log the fixes and re-run QA.
    - If QA passes: The current phase is considered complete.

**Phase 4: Phase Completion & Next Steps**

1.  **Update Overall Progress:** Note the completion of the phase in `logistics/notes/log.md` (the main development log).
2.  **User Confirmation (Optional but Recommended):** Briefly inform the user of the phase completion and successful QA.
3.  **Proceed to Next Phase:** If there are more phases in the plan, return to Phase 2 (Implementation) for the next phase.
4.  **Task Completion:** If all phases are complete and QA has passed for the final phase, use `attempt_completion` to present the final result to the user.

## 4. Benefits of this Workflow

- **Clarity & Organization:** Keeps all process-related information structured and easy to find.
- **Traceability:** Provides a clear audit trail of plans, changes made, decisions taken, and QA results.
- **Structured Problem Solving:** Encourages a methodical approach to complex tasks by breaking them into manageable phases.
- **Improved Quality:** Integrating QA after each phase helps catch issues early.
- **Better Communication:** Facilitates clear communication with the user about progress and plans.
- **Knowledge Retention:** Serves as a valuable historical record for future reference or for new team members.
- **Adaptability:** While structured, the process can be adapted based on the size and nature of the task.

This workflow, utilizing the `logistics/` directory, provides a robust framework for managing development tasks effectively.
