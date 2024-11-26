# styled-formatter

A CLI tool to format `styled-components` template literals in your codebase. It ensures that your CSS-in-JS remains clean, consistent, and easy to read, supporting both `styled-components` and `css` tagged template literals.

---

## Features

- **Automatic Formatting**: Formats `styled-components` and `css` tagged template literals in `.ts`, `.tsx`, and `.js` files.
- **Diff View**: Displays changes as a diff for review.
- **Auto-fix Mode**: Apply fixes directly to your files with the `--fix` option.
- **Indentation Control**: Customize the indentation style (tabs or spaces, default: 2 spaces).
- **Language Support**: Works seamlessly with TypeScript and JavaScript projects.

---

## Installation

### Global Installation

Install globally to use the CLI tool anywhere:

```bash
npm install -g styled-formatter
```

### Local Installation

Add `styled-formatter` as a development dependency in your project:

```bash
npm install --save-dev styled-formatter
```

---

## Usage

`styled-formatter` provides a simple and intuitive command-line interface for checking and fixing formatting issues.

### Basic Command

To check for formatting issues:

```bash
styled-formatter "src/**/*.ts"
```

### Auto-fix Formatting

Apply fixes directly to the files:

```bash
styled-formatter "src/**/*.ts" --fix
```

### Specify Indentation

Set custom indentation styles. By default, the indentation is set to **2 spaces**:

```bash
styled-formatter "src/**/*.ts" --indent tab
styled-formatter "src/**/*.ts" --indent 4 # 4 spaces
```

---

## Examples

### Input

```typescript
import styled from "styled-components";

const Button = styled.button`
color:red;
font-size:12px;
`;

const Wrapper = styled.div`
  border: 1px solid black;
  &:hover {
    color:white;
  }
`;
```

### Output (after formatting)

```typescript
import styled from "styled-components";

const Button = styled.button`
  color: red;
  font-size: 12px;
`;

const Wrapper = styled.div`
  border: 1px solid black;

  &:hover {
    color: white;
  }
`;
```

---

## CLI Options

| Option           | Description                                      |
|-------------------|--------------------------------------------------|
| `--fix`          | Automatically apply fixes to formatting issues.  |
| `--indent <type>`| Specify indentation style (`tab` or spaces). Default: `2`. |
| `[files...]`     | Glob pattern to specify files to format.         |

---

## Configuration

No additional configuration files are required. The tool uses a predefined formatting style inspired by best practices and popular tools like Prettier.

---

## Integration with Other Tools

### Using `npm scripts`

Add a script to your `package.json`:

```json
"scripts": {
  "format": "styled-formatter 'src/**/*.{ts,tsx}' --fix"
}
```

Run the formatter:

```bash
npm run format
```

### Git Hooks

You can integrate `styled-formatter` with tools like `husky` to enforce formatting during pre-commit:

```bash
npx husky add .husky/pre-commit "npm run format"
```

---

## Contributing

We welcome contributions! If you encounter issues or have ideas for new features, please open an issue or submit a pull request.

### Steps to Contribute

1. Clone the repository:
   ```bash
   git clone https://github.com/yudppp/styled-formatter.git
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run tests to verify changes:
   ```bash
   npm test
   ```

4. Create a pull request with your changes.

---

## License

This project is licensed under the MIT License. See the [LICENSE](https://yudppp.mit-license.org/) file for details.
