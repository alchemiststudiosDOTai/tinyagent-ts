import { runMathAgentDemo } from "./math";
import { runOneCallDemo } from "./onecall";

const examples: Record<string, () => Promise<void>> = {
  math: runMathAgentDemo,
  onecall: runOneCallDemo,
};

async function main() {
  const exampleName = process.argv[2];
  
  if (!exampleName) {
    console.log("Available examples:");
    Object.keys(examples).forEach(name => console.log(`- ${name}`));
    process.exit(1);
  }

  const example = examples[exampleName];
  if (!example) {
    console.error(`Example "${exampleName}" not found. Available examples:`);
    Object.keys(examples).forEach(name => console.log(`- ${name}`));
    process.exit(1);
  }

  await example();
}

main().catch(error => {
  console.error("Error running example:", error);
  process.exit(1);
}); 