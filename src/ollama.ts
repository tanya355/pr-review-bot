import { BaseReviewer, ReviewRequest, ReviewResponse } from "./reviewer";
import { APIError } from "./errors";

export class OllamaReviewer extends BaseReviewer {
  private baseURL: string;

  constructor(
    modelName: string = "mistral",
    baseURL: string = "http://localhost:11434",
  ) {
    super(modelName);
    this.baseURL = baseURL;
  }

  async review(request: ReviewRequest): Promise<ReviewResponse> {
    const systemPrompt = this.buildSystemPrompt(request.criteria);
    const userPrompt = `Here is the PR diff:\n\n${request.diff}`;

    try {
      const response = await fetch(`${this.baseURL}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
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
          stream: false,
        }),
      });

      if (!response.ok) {
        throw new APIError(
          `Ollama API Error: ${response.statusText}`,
          response.status,
        );
      }

      const data = await response.json();

      if (!data.message || !data.message.content) {
        throw new APIError(
          "Invalid response from Ollama API: missing message content",
        );
      }

      return {
        content: data.message.content,
        model: this.modelName,
        usage: {
          promptTokens: data.prompt_eval_count || 0,
          completionTokens: data.eval_count || 0,
          totalTokens: (data.prompt_eval_count || 0) + (data.eval_count || 0),
        },
      };
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }

      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new APIError(
          `Failed to connect to Ollama at ${this.baseURL}. Is Ollama running?`,
          undefined,
          error,
        );
      }

      throw new APIError(
        `Failed to get review from Ollama: ${error}`,
        undefined,
        error,
      );
    }
  }
}
