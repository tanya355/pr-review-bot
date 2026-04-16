import OpenAI from "openai";
import { QuotaExceededError, APIError, isQuotaExceededError } from "./errors";

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

export class OpenAIReviewer {
  private client: OpenAI;
  private modelName: string;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY || "sk-test";
    const baseURL = process.env.OPENAI_API_BASE || "https://api.openai.com/v1";
    this.modelName = process.env.MODEL_NAME || "gpt-4o";

    const config: ConstructorParameters<typeof OpenAI>[0] = {
      apiKey,
      baseURL,
    };

    this.client = new OpenAI(config);
  }

  async review(request: ReviewRequest): Promise<ReviewResponse> {
    const systemPrompt = this.buildSystemPrompt(request.criteria);
    const userPrompt = `Here is the PR diff:\n\n${request.diff}`;

    try {
      const response = await this.client.chat.completions.create({
        model: this.modelName,
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: userPrompt,
          },
        ],
      });

      const content = response.choices[0].message.content || "";

      return {
        content,
        model: response.model,
        usage: {
          promptTokens: response.usage?.prompt_tokens || 0,
          completionTokens: response.usage?.completion_tokens || 0,
          totalTokens: response.usage?.total_tokens || 0,
        },
      };
    } catch (error) {
      if (isQuotaExceededError(error)) {
        throw new QuotaExceededError(
          "OpenAI API quota exceeded. Please check your plan and billing details. " +
          "For more information, visit: https://platform.openai.com/account/billing/overview"
        );
      }

      if (error instanceof OpenAI.APIError) {
        throw new APIError(
          `OpenAI API Error: ${error.message}`,
          error.status,
          error
        );
      }

      throw new APIError(`Failed to get review from OpenAI: ${error}`, undefined, error);
    }
  }

  private buildSystemPrompt(criteria: string[]): string {
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