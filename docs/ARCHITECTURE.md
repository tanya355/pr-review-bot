FILE STRUCTURE AND INTEGRATION

Updated Project Layout
pr-review-bot/
├── src/
│ ├── reviewer.ts (NEW - base class)
│ ├── openai.ts (UPDATED - extends BaseReviewer)
│ ├── ollama.ts (NEW - extends BaseReviewer)
│ ├── reviewer-factory.ts (NEW - creates reviewers)
│ ├── review.ts (UPDATED - uses factory)
│ ├── config.ts (UPDATED - adds reviewerName, modelName)
│ ├── github.ts (unchanged)
│ ├── fileFilter.ts (unchanged)
│ ├── errors.ts (unchanged)
├── .github/workflows/
│ ├── pr-review.yml (UPDATED - uses REVIEWER_NAME env var)
│ └── test-pr-review-local.yml (UPDATED - supports both reviewers)
├── test-local.ts (UPDATED - uses factory)
├── load-env.ts (unchanged)
├── review-config.yml (unchanged)
├── package.json (unchanged)
├── tsconfig.json (unchanged)
├── .env.local (user creates - not committed)
└── .gitignore (already has .env.local)

DATA FLOW: Local Testing (Ollama)

User runs: npx ts-node test-local.ts
|
v
loadEnvLocal() reads .env.local
|
v
ReviewerFactory.createReviewer(config) checks REVIEWER_NAME=ollama
|
v
new OllamaReviewer("mistral", "http://localhost:11434")
|
v
reviewer.review(diff, criteria)
|
v
fetch to http://localhost:11434/api/chat
|
v
Docker container running ollama/ollama
|
v
Response back as JSON with message.content
|
v
Display review output

DATA FLOW: GitHub Actions (OpenAI)

PR opened/updated
|
v
GitHub Actions triggers pr-review.yml
|
v
loadConfig() reads environment variables
|
v
REVIEWER_NAME=openai
|
v
ReviewerFactory.createReviewer(config)
|
v
new OpenAIReviewer("gpt-4o")
|
v
reviewer.review(diff, criteria)
|
v
OpenAI SDK calls https://api.openai.com/v1/chat/completions
|
v
Response with model result
|
v
Post comment to PR

CLASS HIERARCHY

BaseReviewer (abstract)
├── OpenAIReviewer
└── OllamaReviewer

Configuration Flow

review.ts
|
├-- loadConfig() (reads env vars)
|
├-- ReviewerFactory.createReviewer(config)
| |
| ├-- if (config.reviewerName === "ollama")
| | return new OllamaReviewer(...)
| |
| └-- if (config.reviewerName === "openai")
| return new OpenAIReviewer(...)
|
├-- reviewer.review(diff, criteria)
|
└-- Post results to GitHub

BACKWARD COMPATIBILITY

Existing code that doesn't set REVIEWER_NAME will default to "openai"
This maintains backward compatibility with existing workflows.

To enable Ollama:

1. Set REVIEWER_NAME=ollama
2. Set OLLAMA_BASE_URL (optional, has sensible default)
3. Ensure Ollama is running

No changes needed to any other part of the codebase.
