#!/usr/bin/env node

import { program } from "commander";
import fs from "fs";
import { globSync } from "glob";
import kleur from "kleur";
import { diffLines } from "diff";
import { formatTemplateLiterals } from "./index";

program
  .version("1.0.0")
  .description("A CLI for formatting styled-components template literals")
  .option("--fix", "Automatically fix files")
  .arguments("[files...]")
  .action((files, options) => {
    const filePatterns = files.length > 0 ? files : ["**/*.ts", "**/*.tsx"];
    const shouldFix = options.fix || false;

    // Resolve file paths
    const resolvedFiles = resolveFiles(filePatterns);

    if (resolvedFiles.length === 0) {
      console.log(kleur.yellow("No files found."));
      process.exit(0);
    }

    let hasErrors = false;

    resolvedFiles.forEach((filePath) => {
      const originalCode = fs.readFileSync(filePath, "utf-8");
      const formattedCode = formatTemplateLiterals(originalCode);

      if (originalCode !== formattedCode) {
        if (shouldFix) {
          // Write the fixed code back to the file
          fs.writeFileSync(filePath, formattedCode, "utf-8");
          console.log(kleur.green(`Fixed: ${filePath}`));
        } else {
          // Display the diff
          hasErrors = true;
          console.log(kleur.bold(`\nDiff: ${filePath}`));
          const diff = diffLines(originalCode, formattedCode);
          diff.forEach((part) => {
            const color = part.added
              ? kleur.green
              : part.removed
              ? kleur.red
              : kleur.gray;
            process.stdout.write(color(part.value));
          });
          console.log("\n");
        }
      } else if (!shouldFix) {
        console.log(kleur.green(`No changes needed: ${filePath}`));
      }
    });

    if (!shouldFix && hasErrors) {
      console.log(kleur.red("\nFormatting issues found."));
      process.exit(1);
    } else {
      console.log(kleur.green("\nAll files are formatted correctly."));
      process.exit(0);
    }
  });

program.parse(process.argv);

/**
 * Resolves file patterns to an array of file paths.
 * @param patterns - The glob patterns to resolve.
 * @returns An array of resolved file paths.
 */
function resolveFiles(patterns: string[]): string[] {
  const resolvedFiles: string[] = [];
  patterns.forEach((pattern) => {
    const files = globSync(pattern, {
      absolute: true,
      ignore: ["node_modules/**", "dist/**"],
    });
    resolvedFiles.push(...files);
  });
  return resolvedFiles;
}
