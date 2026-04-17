export interface ReviewRequest {
  diff: string;
  criteria: string[];
}

export interface ReviewResponse {
  content: string;
  model: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export abstract class BaseReviewer {
  protected modelName: string;

  constructor(modelName: string) {
    this.modelName = modelName;
  }

  abstract review(request: ReviewRequest): Promise<ReviewResponse>;

  protected buildSystemPrompt(criteria: string[]): string {
    const criteriaList = criteria.map((c) => `- ${c}`).join("\n");

    return `You are a senior software engineer reviewing a pull request. 
Review the diff below and evaluate it against these criteria:
${criteriaList}

Respond in this exact format:
## AI Review Summary
**Overall:** [one sentence summary]

### Blockers
[list any blocking issues, or write "None"]

### Suggestions
[list improvement suggestions]

### Nitpicks
[list minor style notes]`;
  }
}
