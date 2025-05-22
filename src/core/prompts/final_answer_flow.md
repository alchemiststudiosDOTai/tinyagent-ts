# Final Answer Flow Example

This example illustrates how an agent now responds exclusively with tool calls and ends the conversation with the `final_answer` tool.

1. **User Prompt**
   ```
   What's 2 + 2?
   ```

2. **Model Output** – tool call
   ```json
   {"tool": "add", "args": {"a": 2, "b": 2}}
   ```

3. **Agent Executes Tool** – observation added to memory
   ```
   TOOL_RESULT: "2 + 2 = 4"
   ```

4. **Model Output** – final answer
   ```json
   {"tool": "final_answer", "args": {"answer": "4"}}
   ```

5. **Agent Returns**
   ```
   4
   ```
