# Retry After Invalid Output

This walkthrough demonstrates how the agent handles a model reply that doesn't match the required schema.

1. **User Prompt**
   ```
   What's the answer to life, the universe, and everything?
   ```

2. **Model Output** – invalid
   ```
   42
   ```

3. **Agent Fix Request** – the agent sends the error back to the model asking for a valid tool call.

4. **Model Output** – corrected
   ```json
   {"tool": "final_answer", "args": {"answer": "42"}}
   ```

5. **Agent Returns**
   ```
   42
   ```
