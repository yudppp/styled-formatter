import * as acorn from "acorn";
import { simple } from "acorn-walk";
import postcss, { ProcessOptions } from "postcss";
import postcssScss from "postcss-scss";

/**
 * Formats a PostCSS node recursively.
 * Ensures proper indentation for nested rules.
 * @param node - The PostCSS node to format.
 * @param indentLevel - The current level of indentation.
 * @returns The formatted CSS as a string.
 */
const formatPostCSSNode = (node: postcss.ChildNode, indentLevel: number = 2, depth = 1): string => {
  const indent = " ".repeat(indentLevel * depth);
  let result = "";
  if (node.type === "rule") {
    result += `${indent}${node.selector} {\n`;
    node.nodes.forEach((child: any) => {
      result += formatPostCSSNode(child, indentLevel, depth + 1);
    });
    result += `${indent}}\n`;
  } else if (node.type === "decl") {
    result += `${indent}${node.prop.trim()}: ${node.value.trim()};\n`;
  } else if (node.type === "atrule") {
    result += `${indent}@${node.name.trim()} ${node.params.trim()} {\n`;
    node.nodes?.forEach((child: any) => {
      result += formatPostCSSNode(child, indentLevel, depth+1);
    });
    result += `${indent}}\n`;
  } else if (node.type === "comment") {
    const comment = node
    result += `${indent}/* ${comment.text.trim()} */\n`;
  }
  return result;
};

/**
 * Formats CSS using PostCSS AST.
 * @param css - The raw CSS string to format.
 * @returns The formatted CSS string with consistent indentation.
 */
const formatCSS = (css: string, indentLevel: number = 2): string => {
  if (!css.trim()) {
    return "";
  }
  try {
    // Define ProcessOptions explicitly to include `syntax`
    const options: ProcessOptions = {
      syntax: postcssScss,
      from: undefined,
    };

    const root = postcss.parse(css, options); // Use correct options type
    let formattedCSS = "";

    root.nodes.forEach((node: postcss.ChildNode) => {
      formattedCSS += formatPostCSSNode(node, indentLevel);
    });
    return formattedCSS.split('\n').filter(v => v.trim() !== "").join('\n')
  } catch (error) {
    console.error("Error formatting CSS:", error);
    return css; // Fallback to original CSS on error
  }
};

/**
 * Formats template literals tagged with `styled` or `css`.
 * @param code - The full source code containing template literals.
 * @returns The source code with formatted template literals.
 */
export const formatTemplateLiterals = (code: string): string => {
  try {
    const ast = acorn.parse(code, {
      ecmaVersion: 2022,
      sourceType: "module",
    });

    const replacements: Array<{
      start: number;
      end: number;
      content: string;
    }> = [];

    simple(ast, {
      TaggedTemplateExpression(node: acorn.TaggedTemplateExpression) {
        const tag = node.tag;
        let tagName = "";

        if (tag.type === "Identifier") {
          tagName = tag.name; // Example: css
        } else if (tag.type === "MemberExpression") {
          tagName = tag.object.type === "Identifier" ? tag.object.name : "";
        } else if (tag.type === "CallExpression") {
          if (tag.callee.type === "Identifier") {
            tagName = tag.callee.name; // Example: styled(Wrap)
          } else if (
            tag.callee.type === "MemberExpression" &&
            tag.callee.object.type === "Identifier"
          ) {
            tagName = tag.callee.object.name;
          }
        }

        // Process only styled and css tagged templates
        if (tagName === "styled" || tagName === "css") {
          const template = node.quasi.quasis[0].value.raw;
          const formattedCSS = formatCSS(template);
          if (!formattedCSS) {
            replacements.push({
                start: node.quasi.quasis[0].start,
                end: node.quasi.quasis[0].end,
                content: "",
              });
            return;
          }


          // Replace content only if formatting was successful
          replacements.push({
            start: node.quasi.quasis[0].start,
            end: node.quasi.quasis[0].end,
            content: `\n${formattedCSS}\n`,
          });
        }
      },
    });

    // Apply replacements from end to start to maintain positions
    return replacements
      .sort((a, b) => b.start - a.start) // Replace from back to front
      .reduce((updatedCode, { start, end, content }) => {
        return (
          updatedCode.slice(0, start) + content + updatedCode.slice(end)
        );
      }, code);
  } catch (error) {
    console.error("Failed to format template literals:", error);
    return code; // Fallback to original code on error
  }
};
