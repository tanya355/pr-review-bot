import { BaseReviewer } from "./reviewer";
import { OpenAIReviewer } from "./openai";
import { OllamaReviewer } from "./ollama";
import { Config } from "./config";

export class ReviewerFactory {
  static createReviewer(config: Config): BaseReviewer {
    if (config.reviewerName.toLowerCase() === "ollama") {
      console.log(`Using Ollama reviewer with model: ${config.modelName}`);
      return new OllamaReviewer(config.modelName, config.ollamaBaseURL);
    }

    if (config.reviewerName.toLowerCase() === "openai") {
      console.log(`Using OpenAI reviewer with model: ${config.modelName}`);
      return new OpenAIReviewer(config.modelName);
    }

    throw new Error(
      `Unknown reviewer type: ${config.reviewerName}. Expected 'openai' or 'ollama'`,
    );
  }
}
