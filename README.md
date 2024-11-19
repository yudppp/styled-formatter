# styled-formatter

A CLI tool for formatting `styled-components` template literals in your code. It ensures that your CSS-in-JS remains clean, consistent, and easy to read.

## Features

- Automatically formats `styled-components` and `css` tagged template literals.
- Supports nested CSS rules and comments.
- Displays diffs or automatically fixes your files.
- Works seamlessly with TypeScript and JavaScript projects.

---

## Installation

You can install `styled-formatter` globally or locally using `npm`:

### Global Installation

```bash
npm install -g styled-formatter
```

### Local Installation

Install as a dev dependency in your project:

```bash
npm install --save-dev styled-formatter
```

---

## Usage

`styled-formatter` provides a simple command-line interface. You can specify files or directories to format.

### Basic Command

To check formatting issues without modifying files:

```bash
styled-formatter "src/**/*.ts"
```

### Fix Formatting

Use the `--fix` option to automatically fix formatting issues:

```bash
styled-formatter "src/**/*.ts" --fix
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
| `--fix`          | Automatically fix formatting issues.             |
| `[files...]`     | Specify files or directories to format.          |

---

## Configuration

`styled-formatter` does not currently require configuration files. It uses a predefined formatting style inspired by popular tools like Prettier.

---

## Integration with Other Tools

You can integrate `styled-formatter` with other tools or workflows:

### Using `npm scripts`

Add a script to your `package.json`:

```json
"scripts": {
  "format": "styled-formatter 'src/**/*.{ts,tsx}' --fix"
}
```

Run the formatter using:

```bash
npm run format
```

---

## Contributing

Contributions are welcome! If you encounter issues or have feature requests, please open an issue or submit a pull request.

### Steps to Contribute

1. Clone the repository:
   ```bash
   git clone https://github.com/yudppp/styled-formatter.git
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run tests:
   ```bash
   npm test
   ```

4. Make your changes and create a pull request.

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.