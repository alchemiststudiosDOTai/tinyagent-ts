# CLI Tools Simplification Plan & Implementation

## Problem Statement

The current `--tools <preset>` option is too complex for users:
- Requires understanding of different presets (`all`, `basic`, `search`, `none`)
- Default behavior loads no tools (`none`), which isn't very useful
- Users have to remember preset names and their differences

## Solution: Simplified `--tools` Flag

### New Behavior
- `--tools` → Boolean flag that loads ALL default tools when present
- No `--tools` → No tools loaded (clean default)
- `--tools-file <path>` → Still available for advanced users with custom tools

### Changes Made

#### 1. CLI Option Definition (`src/cli-refactored.ts`)
```diff
- .option('--tools <preset>', 'Tool preset (all, basic, search, none)', 'none')
+ .option('--tools', 'Load all default tools', false)
```

#### 2. Tool Loading Logic (`src/cli-refactored.ts`)
```diff
- } else if (opts.tools && opts.tools !== 'none') {
-   tools = loadToolPreset(opts.tools);
+ } else if (opts.tools) {
+   tools = loadToolPreset('all');
```

#### 3. Help Text Update (`src/cli/formatter.ts`)
- Removed complex preset documentation
- Simplified to show what tools are available when `--tools` is used
- Updated tips to be more user-friendly

### Before vs After

| Usage | Before | After |
|-------|--------|-------|
| No tools | `tinyagent-ts` (default) | `tinyagent-ts` (same) |
| All tools | `tinyagent-ts --tools all` | `tinyagent-ts --tools` |
| Custom tools | `tinyagent-ts --tools-file ./my-tools.js` | `tinyagent-ts --tools-file ./my-tools.js` (same) |

### Available Tools (when `--tools` is used)
- **file**: Read, write, append or delete files
- **grep**: Search for patterns in files  
- **duckduckgo_search**: Search the web
- **uuid**: Generate random UUIDs

### CLI-Specific Tool Changes
- **Removed human_loop tool**: This tool conflicts with CLI's readline interface and creates confusing UX in direct chat scenarios. The human_loop tool is designed for automated workflows where the agent needs human intervention, but in CLI context the human is already directly interacting with the agent.

### Backwards Compatibility
- Internal `loadToolPreset()`