#!/usr/bin/env node

import { program } from "commander";
import fs from "fs";
import { globSync } from "glob";
import kleur from "kleur";
import { diffLines } from "diff";
import { formatTemplateLiterals } from "./index";

/**
 * Define the type of indentation
 */
type IndentType = "tab" | number;

/**
 * Default indentation setting
 */
const DEFAULT_INDENT = 2;

/**
 * CLI entry point
 */
program
	.version("1.0.0")
	.description("A CLI for formatting styled-components template literals")
	.option("--fix", "Automatically fix files")
	.option(
		"--indent <type>",
		"Indentation type (tab or number of spaces, default: 2)",
		parseIndentOption,
	)
	.arguments("[files...]")
	.action(
		async (files: string[], options: { fix: boolean; indent: IndentType }) => {
			const filePatterns = files.length > 0 ? files : ["**/*.ts", "**/*.tsx"];
			const shouldFix = options.fix || false;
			const indentType = options.indent || DEFAULT_INDENT;

			// Resolve file paths
			const resolvedFiles = resolveFiles(filePatterns);

			if (resolvedFiles.length === 0) {
				console.log(kleur.yellow("No files found."));
				process.exit(0);
			}

			let hasErrors = false;

			// Process each file asynchronously
			for (const filePath of resolvedFiles) {
				try {
					const originalCode = fs.readFileSync(filePath, "utf-8");
					const formattedCode = await formatTemplateLiterals(originalCode, {
						indent: indentType,
					});
					if (originalCode !== formattedCode) {
						if (shouldFix) {
							// Write the fixed code back to the file
							fs.writeFileSync(filePath, formattedCode, "utf-8");
							console.log(kleur.green(`Fixed: ${filePath}`));
						} else {
							// Display differences
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
				} catch (error) {
					hasErrors = true;
					console.error(kleur.red(`Error processing file: ${filePath}`));
					console.error(error);
				}
			}

			// Final message and exit status
			if (!shouldFix && hasErrors) {
				console.log(kleur.red("\nFormatting issues found."));
				process.exit(1);
			} else {
				console.log(kleur.green("\nAll files are formatted correctly."));
				process.exit(0);
			}
		},
	);

program.parse(process.argv);

/**
 * Function to parse the indentation option
 * @param value - Value received from the command line
 * @returns Parsed indentation setting
 */
function parseIndentOption(value: string): IndentType {
	if (value === "tab") {
		return "tab";
	}

	const numSpaces = parseInt(value, 10);
	if (isNaN(numSpaces) || numSpaces < 0) {
		throw new Error("Indent must be 'tab' or a positive number");
	}

	return numSpaces;
}

/**
 * Resolves file patterns and returns an array of file paths
 * @param patterns - Glob patterns to resolve
 * @returns Array of resolved file paths
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
