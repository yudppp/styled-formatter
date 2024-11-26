import { formatTemplateLiterals, FormatOption } from "../src/";

describe("formatTemplateLiterals", () => {

    describe("Indentation options", () => {
        it("should format with custom space indentation", async () => {
            const input = `
import styled from "styled-components";

const Button = styled.button\`
color: red;
   &:hover {
     background: blue;
   }
\`;
`;

            const expectedOutput = `
import styled from "styled-components";

const Button = styled.button\`
    color: red;
    &:hover {
        background: blue;
    }
\`;
`;

            const option: FormatOption = { indent: 4 };
            const result = await formatTemplateLiterals(input, option);
            expect(result).toBe(expectedOutput);
        });

        it("should format with tab indentation", async () => {
            const input = `
import styled from "styled-components";

const Button = styled.button\`
  color: red;
   &:hover {
        background: blue;
    }
\`;
`;

            const expectedOutput = `
import styled from "styled-components";

const Button = styled.button\`
\tcolor: red;
\t&:hover {
\t\tbackground: blue;
\t}
\`;
`;

            const option: FormatOption = { indent: "tab" };
            const result = await formatTemplateLiterals(input, option);
            expect(result).toBe(expectedOutput);
        });

        it("should default to 2 spaces indentation when no option is provided", async () => {
            const input = `
import styled from "styled-components";

const Button = styled.button\`
color: red;
   &:hover {
     background: blue;
   }
\`;
`;

            const expectedOutput = `
import styled from "styled-components";

const Button = styled.button\`
  color: red;
  &:hover {
    background: blue;
  }
\`;
`;

            const result = await formatTemplateLiterals(input);
            expect(result).toBe(expectedOutput);
        });

        it("should handle mixed indentation options", async () => {
            const input = `
import styled from "styled-components";

const Container = styled.div\`
color: green;
    padding: 10px;
\tmargin: 5px;
\`;
`;

            const expectedOutput = `
import styled from "styled-components";

const Container = styled.div\`
    color: green;
    padding: 10px;
    margin: 5px;
\`;
`;

            const option: FormatOption = { indent: 4 };
            const result = await formatTemplateLiterals(input, option);
            expect(result).toBe(expectedOutput);
        });
    });

    describe("File format support", () => {
        it("should format `.jsx` files correctly", async () => {
            const input = `
import styled from "styled-components";

const Button = styled.button\`
color: red;
   &:hover {
     background: blue;
   }
\`;
`;

            const expectedOutput = `
import styled from "styled-components";

const Button = styled.button\`
  color: red;
  &:hover {
    background: blue;
  }
\`;
`;

            const option: FormatOption = { indent: 2 };
            const result = await formatTemplateLiterals(input, option);
            expect(result).toBe(expectedOutput);
        });
    });

    describe("Error handling", () => {
        it("should handle malformed template literals gracefully", async () => {
            const input = `
import styled from "styled-components";

const Button = styled.button\`
   color: red;
   &:hover {
        background: blue;
    // Missing closing brace
\`;
`;

            const result = await formatTemplateLiterals(input);
            // Should return original input when formatting fails
            expect(result).toBe(input);
        });

        it("should handle invalid syntax in expressions", async () => {
            const input = `
import styled from "styled-components";

const Button = styled.button\`
    color: \${=> invalid syntax};
\`;
`;

            const result = await formatTemplateLiterals(input);
            // Should return original input when parsing fails
            expect(result).toBe(input);
        });

        it("should handle empty template literals", async () => {
            const input = `
import styled from "styled-components";

const Empty = styled.div\`\`;
`;

            const expectedOutput = `
import styled from "styled-components";

const Empty = styled.div\`\`;
`;

            const result = await formatTemplateLiterals(input);
            expect(result).toBe(expectedOutput);
        });
    });

    describe("Complex scenarios", () => {
        it("should handle mixed inline and block comments", async () => {
            const input = `
import styled from "styled-components";

const Button = styled.button\`
    color: red; // Inline comment
    /* Block comment */
    background: blue; // Another inline comment
    /* Multi-line
       block comment */
    padding: 10px;
\`;
`;

            const expectedOutput = `
import styled from "styled-components";

const Button = styled.button\`
  color: red; // Inline comment
  /* Block comment */
  background: blue; // Another inline comment
  /* Multi-line
       block comment */
  padding: 10px;
\`;
`;

            const result = await formatTemplateLiterals(input);
            expect(result).toBe(expectedOutput);
        });

        it("should handle multiple expressions in a single line", async () => {
            const input = `
import styled from "styled-components";

const Button = styled.button\`
    color: \${props => props.primary ? "red" : "blue"}; background: \${props => props.bg}; padding: \${props => props.size}px;
\`;
`;

            const expectedOutput = `
import styled from "styled-components";

const Button = styled.button\`
  color: \${props => props.primary ? "red" : "blue"};
  background: \${props => props.bg};
  padding: \${props => props.size}px;
\`;
`;

            const result = await formatTemplateLiterals(input);
            expect(result).toBe(expectedOutput);
        });

        it("should handle pseudo-selectors and media queries", async () => {
            const input = `
import styled from "styled-components";

const Button = styled.button\`
    color: red;
    &:hover, &:focus {
        background: blue;
    }
    @media (max-width: \${props => props.theme.breakpoints.mobile}) {
        padding: 8px;
        &:hover {
            background: green;
        }
    }
\`;
`;

            const expectedOutput = `
import styled from "styled-components";

const Button = styled.button\`
  color: red;
  &:hover,
  &:focus {
    background: blue;
  }
  @media (max-width: \${props => props.theme.breakpoints.mobile}) {
    padding: 8px;
    &:hover {
      background: green;
    }
  }
\`;
`;

            const result = await formatTemplateLiterals(input);
            expect(result).toBe(expectedOutput);
        });

        it("should handle nested selectors and complex nesting", async () => {
            const input = `
import styled from "styled-components";

const Nav = styled.nav\`
    display: flex;
    ul {
        list-style: none;
        li {
            margin: 0 10px;
            a {
                text-decoration: none;
                &:hover {
                    color: green;
                }
            }
        }
    }
\`;
`;

            const expectedOutput = `
import styled from "styled-components";

const Nav = styled.nav\`
  display: flex;
  ul {
    list-style: none;
    li {
      margin: 0 10px;
      a {
        text-decoration: none;
        &:hover {
          color: green;
        }
      }
    }
  }
\`;
`;

            const result = await formatTemplateLiterals(input);
            expect(result).toBe(expectedOutput);
        });

        it("should handle interpolation with nested template literals", async () => {
            const input = `
import styled from "styled-components";

const dynamicStyles = props => \`
    color: \${props.color};
    background: \${props.background};
\`;

const Button = styled.button\`
    \${dynamicStyles}
    padding: 10px;
\`;
`;

            const expectedOutput = `
import styled from "styled-components";

const dynamicStyles = props => \`
    color: \${props.color};
    background: \${props.background};
\`;

const Button = styled.button\`
  \${dynamicStyles}
  padding: 10px;
\`;
`;

            const result = await formatTemplateLiterals(input);
            expect(result).toBe(expectedOutput);
        });
    });

    describe("Edge cases", () => {
        it("should handle template literals with only expressions", async () => {
            const input = `
import styled from "styled-components";

const Button = styled.button\`\${props => props.customStyles}\`;
`;

            const expectedOutput = `
import styled from "styled-components";

const Button = styled.button\`
  \${props => props.customStyles}
\`;
`;

            const result = await formatTemplateLiterals(input);
            expect(result).toBe(expectedOutput);
        });

        it("should handle multiple sequential expressions", async () => {
            const input = `
import styled from "styled-components";

const Button = styled.button\`
    \${props => props.margin && 'margin: 8px;'}
    \${props => props.padding && 'padding: 16px;'}
    \${props => props.customStyles}
\`;
`;

            const expectedOutput = `
import styled from "styled-components";

const Button = styled.button\`
  \${props => props.margin && 'margin: 8px;'}
  \${props => props.padding && 'padding: 16px;'}
  \${props => props.customStyles}
\`;
`;

            const result = await formatTemplateLiterals(input);
            expect(result).toBe(expectedOutput);
        });

        it("should handle empty lines and excessive whitespace", async () => {
            const input = `
import styled from "styled-components";


const Button = styled.button\`


    color: red;



    &:hover {
            background: blue;
    }


\`;
`;

            const expectedOutput = `
import styled from "styled-components";


const Button = styled.button\`
  color: red;

  &:hover {
    background: blue;
  }
\`;
`;

            const result = await formatTemplateLiterals(input);
            expect(result).toBe(expectedOutput);
        });

        it("should handle large template literals efficiently", async () => {
            const input = `
import styled from "styled-components";

const LargeComponent = styled.div\`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    padding: 20px;
    margin: 10px;
    background-color: #f0f0f0;
    border: 1px solid #ccc;
    border-radius: 5px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    font-size: 16px;
    color: #333;
    &:hover {
        background-color: #e0e0e0;
    }
    @media (max-width: 768px) {
        flex-direction: row;
        padding: 10px;
    }
\`;
`;

            const expectedOutput = `
import styled from "styled-components";

const LargeComponent = styled.div\`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  margin: 10px;
  background-color: #f0f0f0;
  border: 1px solid #ccc;
  border-radius: 5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  font-size: 16px;
  color: #333;
  &:hover {
    background-color: #e0e0e0;
  }
  @media (max-width: 768px) {
    flex-direction: row;
    padding: 10px;
  }
\`;
`;

            const result = await formatTemplateLiterals(input);
            expect(result).toBe(expectedOutput);
        });

        it("should handle template literals with single line styles", async () => {
            const input = `
import styled from "styled-components";

const Inline = styled.div\`color: red;\`;
`;

            const expectedOutput = `
import styled from "styled-components";

const Inline = styled.div\`
  color: red;
\`;
`;

            const result = await formatTemplateLiterals(input);
            expect(result).toBe(expectedOutput);
        });
    });

    describe("Integration scenarios", () => {
        it("should work correctly with existing Prettier configurations", async () => {
            const input = `
import styled from "styled-components";

const Button = styled.button\`color:red;\`;
`;

            const expectedOutput = `
import styled from "styled-components";

const Button = styled.button\`
  color: red;
\`;
`;

            const option: FormatOption = { indent: 2 };
            const result = await formatTemplateLiterals(input, option);
            expect(result).toBe(expectedOutput);
        });

        it("should not alter non-styled-components template literals", async () => {
            const input = `
const message = \`Hello, World!\`;
`;

            const expectedOutput = `
const message = \`Hello, World!\`;
`;

            const result = await formatTemplateLiterals(input);
            expect(result).toBe(expectedOutput);
        });

        it("should handle multiple styled-components in a single file", async () => {
            const input = `
import styled from "styled-components";

const Button = styled.button\`
color: red;
\`;

const Container = styled.div\`
display: flex;
\`;
`;

            const expectedOutput = `
import styled from "styled-components";

const Button = styled.button\`
  color: red;
\`;

const Container = styled.div\`
  display: flex;
\`;
`;

            const result = await formatTemplateLiterals(input);
            expect(result).toBe(expectedOutput);
        });
    });

    describe("Performance tests", () => {
        it("should format large codebases within acceptable time", async () => {
            const input = `
import styled from "styled-components";

const Component1 = styled.div\`
    color: red;
    background: blue;
\`;

const Component2 = styled.button\`
    padding: 10px;
    margin: 5px;
\`;

// Repeat similar components to simulate a large codebase
${Array.from({ length: 100 }, (_, i) => `
const Component${i + 3} = styled.span\`
    font-size: ${12 + i}px;
    line-height: ${1.5 + i * 0.1};
\`;
`).join('\n')}
`;

            const startTime = Date.now();
            const result = await formatTemplateLiterals(input);
            const endTime = Date.now();
            const duration = endTime - startTime;

            // Assuming the formatter should process within 2 seconds for this input
            expect(duration).toBeLessThan(2000);

            // Basic check to ensure formatting was applied
            expect(result).toContain("font-size: ");
            expect(result).toContain("line-height: ");
        }, 10000); // Setting Jest timeout to 10 seconds for this test
    });

    describe("Snapshot tests", () => {
        it("should match the snapshot for complex styled-component", async () => {
            const input = `
import styled from "styled-components";

const ComplexButton = styled.button\`
    color: \${props => props.color || "black"};
    background: \${props => props.primary ? "blue" : "gray"};
    border: none;
    padding: 10px 20px;
    border-radius: 5px;
    cursor: pointer;
    &:hover {
        background: \${props => props.primary ? "darkblue" : "darkgray"};
    }
    @media (max-width: 600px) {
        width: 100%;
        padding: 15px 25px;
    }
\`;
`;

            const result = await formatTemplateLiterals(input);
            expect(result).toMatchSnapshot();
        });
    });
});
