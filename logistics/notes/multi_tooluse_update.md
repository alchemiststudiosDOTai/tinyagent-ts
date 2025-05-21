Here is a concise summary of the most important and necessary information for the QA team regarding chart generation:

- **Chart Generation**: Generate charts only when explicitly requested, using a "chartjs" code block with a valid JSON config.
- **Supported Chart Types**: Use only 'bar', 'bubble', 'doughnut', 'line', 'pie', 'polarArea', 'radar', or 'scatter'.
- **Key Guidelines**:
  - Use distinctive colors suitable for dark and light themes.
  - Avoid logarithmic scales unless requested.
  - For multiple graphs, create separate code blocks.
- **Restrictions**:
  - Do not generate charts for maps, when a specific tool is requested, for code requests, or Chart.js questions.
  - Do not suggest or exemplify charts unless asked.
- **Terminology**: Call the output a "chart" and avoid mentioning Chart.js or its settings outside the code block.

This ensures the QA team can effectively test chart-related functionality.