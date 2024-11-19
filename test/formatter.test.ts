import { formatTemplateLiterals } from "../src/index";

describe("formatTemplateLiterals", () => {
  it("should format a simple styled-components template literal", () => {
    const input = `
import styled from "styled-components";

const Button = styled.button\`
        color:red;   font-size:12px;
\`;
`;

    const expectedOutput = `
import styled from "styled-components";

const Button = styled.button\`
  color: red;
  font-size: 12px;
\`;
`;

    expect(formatTemplateLiterals(input)).toBe(expectedOutput);
  });

  it("should format nested CSS rules", () => {
    const input = `
import styled from "styled-components";

const Wrapper = styled.div\`
        border: 1px solid black;
        &:hover {
          color:white;
        }
\`;
`;

    const expectedOutput = `
import styled from "styled-components";

const Wrapper = styled.div\`
  border: 1px solid black;
  &:hover {
    color: white;
  }
\`;
`;

    expect(formatTemplateLiterals(input)).toBe(expectedOutput);
  });

  it("should handle empty template literals gracefully", () => {
    const input = `
import styled from "styled-components";

const Empty = styled.div\`\`;
`;

    const expectedOutput = `
import styled from "styled-components";

const Empty = styled.div\`\`;
`;

    expect(formatTemplateLiterals(input)).toBe(expectedOutput);
  });

  it("should handle CSS with comments", () => {
    const input = `
import styled from "styled-components";

const StyledDiv = styled.div\`
        /* This is a comment */
        display: flex; align-items: center;
\`;
`;

    const expectedOutput = `
import styled from "styled-components";

const StyledDiv = styled.div\`
  /* This is a comment */
  display: flex;
  align-items: center;
\`;
`;

    expect(formatTemplateLiterals(input)).toBe(expectedOutput);
  });

  it("should handle multiple styled-components in one file", () => {
    const input = `
import styled from "styled-components";

const Button = styled.button\`
        color:red;   font-size:12px;
\`;

const Container = styled.div\`
        background: blue; padding: 16px;
\`;
`;

    const expectedOutput = `
import styled from "styled-components";

const Button = styled.button\`
  color: red;
  font-size: 12px;
\`;

const Container = styled.div\`
  background: blue;
  padding: 16px;
\`;
`;

    expect(formatTemplateLiterals(input)).toBe(expectedOutput);
  });

  it("should format deeply nested CSS rules", () => {
    const input = `
import styled from "styled-components";

const Complex = styled.div\`
        border: 1px solid black;
        &:hover {
          color: white;
          span {
            font-size: 14px;
          }
        }
\`;
`;

    const expectedOutput = `
import styled from "styled-components";

const Complex = styled.div\`
  border: 1px solid black;
  &:hover {
    color: white;
    span {
      font-size: 14px;
    }
  }
\`;
`;

    expect(formatTemplateLiterals(input)).toBe(expectedOutput);
  });

  it("should handle CSS with tab-based indentation", () => {
    const input = `
import styled from "styled-components";

const TabStyled = styled.div\`
\tcolor: red;\tfont-size: 12px;
\t&:hover {
\t\tbackground: blue;
\t}
\`;
`;

    const expectedOutput = `
import styled from "styled-components";

const TabStyled = styled.div\`
  color: red;
  font-size: 12px;
  &:hover {
    background: blue;
  }
\`;
`;

    expect(formatTemplateLiterals(input)).toBe(expectedOutput);
  });

  it("should format deeply nested CSS with many levels", () => {
    const input = `
import styled from "styled-components";

const DeepNested = styled.div\`
  level-1 {
    level-2 {
      level-3 {
        level-4 {
          level-5 {
            color: red;
          }
        }
      }
    }
  }
\`;
`;

    const expectedOutput = `
import styled from "styled-components";

const DeepNested = styled.div\`
  level-1 {
    level-2 {
      level-3 {
        level-4 {
          level-5 {
            color: red;
          }
        }
      }
    }
  }
\`;
`;

    expect(formatTemplateLiterals(input)).toBe(expectedOutput);
  });
});
