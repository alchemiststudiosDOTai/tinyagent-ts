import { PythonExec } from "../src/tools/pythonExec";

async function runPythonTest() {
  const py = new PythonExec();
  const code = "print(1+1)";
  const result = await py.pythonExec({ code, timeoutMs: 2000 });
  console.log("PythonExec test result:", result);
}

runPythonTest().catch(console.error);