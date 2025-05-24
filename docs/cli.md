# CLI Usage and Behavior in tinyAgent-TS

This document explains how the command line interface (CLI) of tinyAgent-TS works and highlights an example session.

## How the CLI Works

- The CLI uses the `commander` library to parse command line options.
- You can specify the LLM model, system prompt (file or inline), and tool presets via flags.
- Tools can be loaded from presets (`basic`, `all`, etc.) or from a custom tools file.
- The CLI creates an agent instance using a decorated Agent or MultiStepAgent class.
- The agent's model and prompt are configurable through CLI options without unintended overwriting.
- Input is read interactively from stdin, with commands like `help`, `clear`, and `exit` supported.
- User queries are passed to the agent's async `runForCLI` method to get responses.
- The CLI supports a trace mode to display detailed Thought → Action → Observation steps.
- Tool execution errors and system errors are caught and displayed gracefully.

## Example CLI Session

```text
Loaded 'basic' tool preset (2 tools)

TINYAGENT-TS

/help for help

cwd: /root/tinyagent-ts

Model: openai/gpt-4o-mini

Available tools:
  file: Read, write, append or delete a file on disk
  uuid: Generate a random UUID

> make a hello world file here
Thinking...   T: I need to create a file that contains the text "Hello, World!" and save it to the disk. I will choose a filename and write the content to the file. Let's go with "hello_world.txt" as the filename. | A: file
O: Error executing tool "file": [
  {
    "code": "invalid_type",
    "expected": "string",
    "received": "undefined",
    "path": [
      "path"
    ],
    "message": "Required"
  }
]
Observation: Error executing tool "file": [
  {
    "code": "invalid_type",
    "expected": "string",
    "received": "undefined",
    "path": [
      "path"
    ],
    "message": "Required"
  }
]
Thinking.   T: It seems that I did not specify the correct parameters for the file tool, specifically the path where the file should be created. I need to define the path for the file along with the action to write content. I will assume a standard location for the file creation and try again, specifying the path explicitly. 

Let's specify the path as "hello_world.txt" in the current working directory. | A: file | O: "ok"
Observation: "ok"
Thinking   T: The file "hello_world.txt" has been successfully created with the content "Hello, World!". There are no further actions needed, so I can now provide the final answer. | A: final_answer
O: {"answer":"The file 'hello_world.txt' has been created with the content 'Hello, World!'."}
Observation: {"answer":"The file 'hello_world.txt' has been created with the content 'Hello, World!'."}
                    
The file 'hello_world.txt' has been created with the content 'Hello, World!'.

>
```

This demonstrates how the CLI handles tool presets, tracing, and user input to perform tasks interactively.

---

Keep this document as a reference for understanding and using the tinyAgent-TS CLI effectively.
