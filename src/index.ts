import { parse } from "@babel/parser";
import traverse, { NodePath } from "@babel/traverse";
import * as t from "@babel/types";
import prettier from "prettier";

/**
 * Format the specified content using Prettier
 * @param code Code to be formatted
 * @param indent Indentation type (tab or number of spaces)
 * @returns Formatted code
 */
export const formatWithContext = async (
	code: string,
	indent: "tab" | number,
): Promise<string> => {
	try {
		return prettier.format(code, {
			semi: false,
			parser: "css",
			useTabs: indent === "tab",
			tabWidth: indent === "tab" ? 1 : indent,
		});
	} catch (error) {
		console.error("Failed to format code with Prettier:", error);
		return code;
	}
};

export type FormatOption = {
	indent: "tab" | number;
};

/**
 * Determines if a given node is a styled-components tag
 * @param tag The AST node to check
 * @returns boolean indicating if the node is a styled-components tag
 */
const isStyledComponentTag = (tag: t.Expression): boolean => {
	if (t.isMemberExpression(tag)) {
		// styled.div
		return t.isIdentifier(tag.object, { name: "styled" });
	}

	if (t.isCallExpression(tag)) {
		const callee = tag.callee;
		return (
			t.isIdentifier(callee, { name: "styled" }) ||
			(t.isMemberExpression(callee) &&
				t.isIdentifier(callee.object, { name: "styled" }))
		);
	}

	return false;
};

/**
 * Creates a unique placeholder for expressions
 * @param counter Current counter value
 * @param before Character before the expression
 * @param after Character after the expression
 * @returns Generated placeholder
 */
const createPlaceholder = (
	counter: number,
	beforeText: string,
	afterText: string,
): string => {
	const base = `__EXPR_${counter}__`;
	const isConnectChar = /^[a-zA-Z:;]/.test(afterText.slice(0, 1));
	if (isConnectChar) {
		return `\$${base}`;
	}
	return beforeText.trimEnd().slice(-1) === ":" ? `\$${base}` : `/* ${base} */`;
};

/**
 * Filters an array to include only Expression nodes
 * @param items Array containing Expression or TSType nodes
 * @returns Array containing only Expression nodes
 */
const filterExpressions = (
	items: (t.Expression | t.TSType)[],
): t.Expression[] => {
	return items.filter((item): item is t.Expression => t.isExpression(item));
};

/**
 * Replaces expressions and comments in template literals with placeholders
 * @param quasis Template elements
 * @param expressions Embedded expressions (filtered to Expression[])
 * @param originalCode Original code string
 * @returns Object containing the modified string and mappings for restoration
 */
const replacePlaceholders = (
	quasis: t.TemplateElement[],
	expressions: t.Expression[],
	originalCode: string,
) => {
	let placeholderCounter = 0;
	let commentCounter = 0;
	const expressionMap: Record<string, string> = {};
	const commentMap: Record<string, string> = {};

	const formattedParts = quasis.map((quasi, index) => {
		let text = quasi.value.cooked || quasi.value.raw;

		if (index < expressions.length) {
			const nextQuasi = quasis[index + 1];
			const beforeText = text;
			const afterText = nextQuasi?.value?.cooked ?? nextQuasi?.value?.raw ?? "";
			const placeholder = createPlaceholder(
				placeholderCounter++,
				beforeText,
				afterText,
			);
			const expr = expressions[index];

			if (expr.start === undefined || expr.end === undefined) {
				throw new Error("Expression does not have start or end position");
			}

			expressionMap[placeholder] = originalCode.slice(
				expr.start ?? 0,
				expr.end ?? 0,
			);
			text += placeholder;
		}

		// Replace inline comments
		const commentRegex1 = /\/\*([\s\S]*?)\*\//gm;
		text = text.replace(commentRegex1, (match) => {
			const commentPlaceholder = `/* __COMMENT_${commentCounter++}__ */`;
			commentMap[commentPlaceholder] = match;
			return commentPlaceholder;
		});
		const commentRegex2 = /\/\/.*$/gm;
		text = text.replace(commentRegex2, (match) => {
			const commentPlaceholder = `/* __COMMENT_${commentCounter++}__ */`;
			commentMap[commentPlaceholder] = match;
			return commentPlaceholder;
		});
		return text;
	});

	return {
		concatenated: formattedParts.join(""),
		expressionMap,
		commentMap,
	};
};

/**
 * Restores expressions and comments in the formatted template literal
 * @param formatted Formatted template string with placeholders
 * @param expressionMap Mapping of expression placeholders to original expressions
 * @param commentMap Mapping of comment placeholders to original comments
 * @param indentChar Indentation characters
 * @returns Restored template literal string
 */
const restorePlaceholders = (
	formatted: string,
	expressionMap: Record<string, string>,
	commentMap: Record<string, string>,
	indentChar: string,
): string => {
	if (formatted.trim() === "") return "``";
	let restored =
		"`\n" +
		formatted
			.split("\n")
			.map((line) => (line === "" ? "" : `${indentChar}${line}`))
			.join("\n") +
		"`";
	for (const [placeholder, comment] of Object.entries(commentMap)) {
		restored = restored.replace(placeholder, comment);
	}

	for (const [placeholder, expr] of Object.entries(expressionMap)) {
		restored = restored.replace(placeholder, `\${${expr}}`);
	}

	return restored;
};

/**
 * Formats template literals within styled-components.
 * Replaces embedded expressions (${...}) with placeholders before formatting
 * and restores them afterward. The replacement method is determined based on
 * surrounding characters.
 * @param code TypeScript code to be formatted
 * @param option Formatting options
 * @returns Formatted code
 */
export const formatTemplateLiterals = async (
	code: string,
	option: FormatOption = { indent: 2 },
): Promise<string> => {
	const { indent } = option;
	const indentChar = indent === "tab" ? "\t" : " ".repeat(indent);

	try {
		const ast = parse(code, {
			sourceType: "module",
			plugins: ["typescript", "jsx"],
			ranges: true,
			tokens: true,
		});

		const taggedTemplateExpressions: t.TaggedTemplateExpression[] = [];

		traverse(ast, {
			TaggedTemplateExpression(path: NodePath<t.TaggedTemplateExpression>) {
				if (
					isStyledComponentTag(path.node.tag) &&
					path.node.quasi.quasis.length > 0
				) {
					taggedTemplateExpressions.push(path.node);
				}
			},
		});

		const replacements: Array<{ start: number; end: number; content: string }> =
			[];

		for (const node of taggedTemplateExpressions) {
			const { quasis, expressions } = node.quasi;

			const pureExpressions = filterExpressions(expressions);
			if (node.quasi.start !== null && node.quasi.end !== null) {
				const { concatenated, expressionMap, commentMap } = replacePlaceholders(
					quasis,
					pureExpressions,
					code,
				);

				const formatted = await formatWithContext(concatenated, indent);

				const restored = restorePlaceholders(
					formatted,
					expressionMap,
					commentMap,
					indentChar,
				);

				replacements.push({
					start: node.quasi.start ?? 0,
					end: node.quasi.end ?? 0,
					content: restored,
				});
			} else {
				console.warn(
					`Skipped formatting for a node with null start or end: ${node.type}`,
				);
			}
		}

		// Apply replacements from back to front to prevent position shifts
		const sortedReplacements = replacements.sort((a, b) => b.start - a.start);
		let updatedCode = code;

		for (const { start, end, content } of sortedReplacements) {
			updatedCode =
				updatedCode.slice(0, start) + content + updatedCode.slice(end);
		}

		return updatedCode;
	} catch (error) {
		console.error("Failed to format template literals:", error);
		console.error("Input data:", code);
		return code;
	}
};
