export interface Config {
  githubToken: string;
  openaiApiKey: string;
  prNumber: number;
  repo: string;
  owner: string;
}

export function loadConfig(): Config {
  const githubToken = process.env.GITHUB_TOKEN;
  const openaiApiKey = process.env.OPENAI_API_KEY;
  const prNumber = parseInt(process.env.PR_NUMBER || "0");
  const repo = process.env.REPO || "";
  const [owner, repoName] = repo.split("/");

  if (!githubToken) {
    throw new Error("GITHUB_TOKEN environment variable is not set");
  }

  if (!openaiApiKey) {
    throw new Error("OPENAI_API_KEY environment variable is not set");
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
  };
}
