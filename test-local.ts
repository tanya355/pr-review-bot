import { loadEnvLocal, printCurrentConfig } from "./load-env";
import OpenAI from "openai";
import * as fs from "fs";
import * as yaml from "js-yaml";

// Load .env.local if it exists
loadEnvLocal();

const sampleDiff = `
### src/index.ts
\`\`\`
diff --git a/src/index.ts b/src/index.ts
index abc123..def456 100644
--- a/src/index.ts
+++ b/src/index.ts
@@ -1,5 +1,15 @@
    export function calculate(a, b) {
    -  return a + b;
+  let result = a + b;
+  if (!result) {
+    console.log('zero result');
+  }
+  return result;
}

-export function divide(x, y) {
-  return x / y;
+export async function fetchData(url) {
+  const response = await fetch(url);
+  const data = response.json();
+  return data;
 }
\`\`\`

### src/utils/format.ts
\`\`\`
diff --git a/src/utils/format.ts b/src/utils/format.ts
new file mode 100644
index 0000000..abc1234
--- /dev/null
+++ b/src/utils/format.ts
@@ -0,0 +1,12 @@
+import { padStart } from 'lodash';
+
+export function formatDate(date: Date): string {
+  const day = padStart(date.getDate().toString(), 2, '0');
+  const month = padStart((date.getMonth() + 1).toString(), 2, '0');
+  const year = date.getFullYear();
+  
+  return \`\${day}/\${month}/\${year}\`;
+}
+
+export function formatTime(date: Date): string {
+  return date.toLocaleTimeString();
+}
\`\`\`
`;

async function runLocalReview() {
  console.log("Starting local PR review test...\n");
  printCurrentConfig();

  console.log("\n" + "=".repeat(60) + "\n");

  const client = new OpenAI({ apiKey: 'dummy-key-ollama-doesnt-validate-key', baseURL:'http://localhost:11434/v1'});

  // Load config
  const configPath = "./review-config.yml";
  if (!fs.existsSync(configPath)) {
    console.error(`Error: ${configPath} not found`);
    process.exit(1);
  }

  const config = yaml.load(fs.readFileSync(configPath, "utf8")) as any;
  const criteria = config.review.focus_areas.join("\n- ");

  console.log("Review Criteria:");
  console.log(criteria);
  console.log("\n" + "=".repeat(60) + "\n");

  try {
    console.log("Sending request to OpenAI API...");

    const response = await client.chat.completions.create({
      model: "mistral",
      messages: [
        {
          role: "system",
          content: `You are a senior software engineer reviewing a pull request. 
Review the diff below and evaluate it against these criteria:
- ${criteria}

Respond in this exact format:
## AI Review Summary
**Overall:** [one sentence summary]

### Blockers
[list any blocking issues, or write "None"]

### Suggestions
[list improvement suggestions]

### Nitpicks
[list minor style notes]`,
        },
        {
          role: "user",
          content: `Here is the PR diff:\n\n${sampleDiff}`,
        },
      ],
    });

    const reviewComment = response.choices[0].message.content || "";

    console.log("AI Review Response:");
    console.log("=".repeat(60));
    console.log(reviewComment);
    console.log("=".repeat(60));
    console.log("\nTest completed successfully!");
  } catch (error) {
    console.error("Error during review:", error);
    process.exit(1);
  }
}

runLocalReview();
