import * as fs from "fs";
import * as yaml from "js-yaml";

export interface ReviewConfig {
  review: {
    focus_areas: string[];
    severity_levels: Record<string, string>;
    ignore_paths: string[];
  };
}

export class FileFilter {
  private config: ReviewConfig;

  constructor(configPath: string = "review-config.yml") {
    try {
      const configContent = fs.readFileSync(configPath, "utf8");
      this.config = yaml.load(configContent) as ReviewConfig;
    } catch (error) {
      throw new Error(
        `Failed to load review config from ${configPath}: ${error}`,
      );
    }
  }

  shouldIgnore(filename: string): boolean {
    return this.config.review.ignore_paths.some((pattern) => {
      const normalizedPattern = pattern.replace("*", "");
      return filename.includes(normalizedPattern);
    });
  }

  filterFiles(
    files: Array<{ filename: string; patch: string }>,
  ): Array<{ filename: string; patch: string }> {
    return files.filter((f) => !this.shouldIgnore(f.filename));
  }

  getFocusAreas(): string[] {
    return this.config.review.focus_areas;
  }
}
