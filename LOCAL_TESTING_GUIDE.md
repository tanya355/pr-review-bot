# Local PR Review Testing Guide (Ollama + Zero API Charges)

## Why This Approach?

- **No OpenAI API charges** - Ollama runs locally on your machine
- **Instant feedback** - No waiting for API calls
- **Full integration test** - Tests your review logic end-to-end
- **Easy iteration** - Modify review criteria instantly

## Prerequisites

- Node.js 20+ (you already have this)
- About 5-10GB disk space (for the ollama model)

## Step 1: Install and Start Ollama

### macOS
```bash
brew install ollama
ollama serve
```

### Linux
```bash
curl -fsSL https://ollama.ai/install.sh | sh
ollama serve
```

### Windows
Download from https://ollama.ai and run the installer, then start the Ollama application.

### Verify Ollama is running
```bash
curl http://localhost:11434/api/tags
# Should return a JSON response with installed models
```

## Step 2: Pull a Model (First Time Only)

Open a new terminal and run:

```bash
# Pull mistral (smaller, faster, ~4GB)
ollama pull mistral

# OR pull llama2 (larger, more capable, ~7GB)
ollama pull llama2
```

This downloads the model and caches it locally. Only happens once.


## Step 4: Update Your Main review.ts

Modify `src/review.ts` to use the new openai module:

```typescript

// Replace this line:
    this.client = new OpenAI({ apiKey });

// With this:
    this.client = new OpenAI({ apiKey , baseURL:'http://localhost:11434/v1'});

// Keep everything else the same
```

## Step 5: Run the Local Test

```bash
# From pr-review-bot root
npx ts-node test-local.ts
```

You should see:
1. Review criteria printed
2. API request sent to localhost:11434
3. AI review output with blockers, suggestions, nitpicks

## Step 6: Test the Full Workflow Locally

To test the GitHub Actions workflow locally without pushing to GitHub, use [act](https://github.com/nektos/act):

```bash
# Install act
brew install act  # macOS
# or download from https://github.com/nektos/act

# Run the workflow locally
act pull_request -e <(echo '{"pull_request":{"number":1},"repository":{"name":"pr-review-bot","owner":{"login":"tanya355"}}}')
```

**Note:** This requires Docker and GitHub credentials set up.

## Step 7: Testing with Real PR (Next Step)

Once local testing works, test with a real PR:

1. Create a test repo or branch
2. Make a small code change
3. Open a PR
4. Workflow runs in GitHub Actions
5. AI review posts on PR

## Troubleshooting

### "Connection refused" on port 11434
- Check if Ollama is running: `ollama serve` in another terminal
- Verify: `curl http://localhost:11434/api/tags`

### Model not found error
- Pull the model: `ollama pull mistral`
- Verify: `ollama list`

### Out of memory errors
- Mistral uses ~4GB RAM
- Llama2 uses ~7GB RAM
- If your machine has less, try: `ollama pull neural-chat` (smaller model)

### ts-node compilation errors
- Make sure `tsconfig.json` exists with `transpileOnly: true`
- Check Node.js version: `node --version` (should be 20+)

## Next: GitHub Actions Integration

Once you're confident with local testing:

1. Add your real OpenAI API key to GitHub secrets
2. Update `.github/workflows/pr-review.yml` to use production OpenAI
3. Remove `OPENAI_API_BASE` from GitHub secrets (so it uses OpenAI default)

## File Structure After Setup

```
pr-review-bot/
├── src/
│   ├── review.ts (updated to use createOpenAIClient)
│   ├── openai.ts (NEW - supports baseURL)
│   ├── config.ts (existing)
│   ├── errors.ts (existing)
│   └── ...
├── test-local.ts (NEW - local integration test)
├── .env.local (NEW - local config, do NOT commit)
├── review-config.yml (existing)
├── package.json (existing)
└── tsconfig.json (existing)
```

## Key Differences: Local vs Production

| Aspect | Local (Ollama) | Production (OpenAI) |
|--------|---|---|
| Cost | $0 | $0.01-0.10 per PR |
| Speed | 10-30s | 5-10s |
| Model | Mistral 7B | GPT-4o |
| API Key | Dummy (sk-local-*) | Real OpenAI key |
| Base URL | http://localhost:11434/v1 | https://api.openai.com/v1 |

## Questions?

If something doesn't work:
1. Check Ollama is running: `curl http://localhost:11434/api/tags`
2. Check model is installed: `ollama list`
3. Check .env.local exists and has correct BASE_URL
4. Run with verbose logging: `TS_NODE_TRANSPILE_ONLY=true npx ts-node test-local.ts`
