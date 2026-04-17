export interface Config {
  githubToken: string;
  openaiApiKey: string;
  prNumber: number;
  repo: string;
  owner: string;
  reviewerName: string;
  modelName: string;
  ollamaBaseURL?: string;
}

export function loadConfig(): Config {
  const githubToken = process.env.GITHUB_TOKEN;
  const openaiApiKey = process.env.OPENAI_API_KEY;
  const prNumber = parseInt(process.env.PR_NUMBER || "0");
  const repo = process.env.REPO || "";
  const reviewerName = process.env.REVIEWER_NAME || "openai";
  const modelName =
    process.env.MODEL_NAME ||
    (reviewerName === "ollama" ? "mistral" : "gpt-4o");
  const ollamaBaseURL = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
  const [owner, repoName] = repo.split("/");

  if (!githubToken) {
    throw new Error("GITHUB_TOKEN environment variable is not set");
  }

  if (reviewerName === "openai" && !openaiApiKey) {
    throw new Error(
      "OPENAI_API_KEY environment variable is not set when using OpenAI reviewer",
    );
  }

  if (!prNumber || prNumber <= 0) {
    throw new Error("PR_NUMBER environment variable must be a valid number");
  }

  if (!owner || !repoName) {
    throw new Error("REPO environment variable must be in format owner/repo");
  }

  return {
    githubToken,
    openaiApiKey,
    prNumber,
    repo,
    owner,
    reviewerName,
    modelName,
    ollamaBaseURL,
  };
}
