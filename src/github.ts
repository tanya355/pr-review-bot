import { Octokit } from "@octokit/rest";

export interface FileChange {
  filename: string;
  patch: string;
}

export class GitHubClient {
  private octokit: Octokit;

  constructor(token: string) {
    this.octokit = new Octokit({ auth: token });
  }

  async fetchPullRequestFiles(
    owner: string,
    repo: string,
    prNumber: number,
  ): Promise<FileChange[]> {
    try {
      const { data: files } = await this.octokit.pulls.listFiles({
        owner,
        repo,
        pull_number: prNumber,
      });

      return files.map((f) => ({
        filename: f.filename,
        patch: f.patch || "",
      }));
    } catch (error) {
      throw new Error(`Failed to fetch PR files: ${error}`);
    }
  }

  async postReviewComment(
    owner: string,
    repo: string,
    prNumber: number,
    comment: string,
  ): Promise<void> {
    try {
      await this.octokit.issues.createComment({
        owner,
        repo,
        issue_number: prNumber,
        body: comment,
      });
    } catch (error) {
      throw new Error(`Failed to post review comment: ${error}`);
    }
  }
}
