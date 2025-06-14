# ICNS Icon Generator

A simple and easy-to-use macOS application icon (.icns) generation tool that can convert various image formats to rounded macOS application icons.

## Features

- ✨ Automatically generates all icon sizes required by macOS
- 🎨 Automatically adds macOS-style rounded corners (20% corner radius)
- 🖼️ Supports multiple image formats (PNG, JPG, WEBP, SVG, GIF, etc.)
- 🛠️ Supports command line usage
- 📦 Simple and easy to use, zero configuration

## System Requirements

- Node.js 14.0.0 or higher
- macOS (requires the `iconutil` command)

## Installation

### Global Installation

```bash
# Using npm
npm install -g icns-generator

# Using pnpm (recommended)
pnpm add -g icns-generator
```

### Local Installation

```bash
# Clone repository
git clone https://github.com/CatKeee/icns-generator.git
cd icns-generator

# Install dependencies
pnpm install

# Link globally
pnpm link --global
```

## Usage

### Command Line Usage

```bash
# Basic usage (finds icon.png in current directory and generates icon.icns)
icns-generator

# Specify input file
icns-generator --input my-icon.jpg

# Specify output file
icns-generator --output app-icon.icns

# View supported file formats
icns-generator --list-formats

# Full parameters
icns-generator --input my-icon.png --output app-icon.icns --dir temp.iconset --output-dir icons --work-dir /path/to/project
```

### Parameters

- `-i, --input <path>`: Input image path (default: `icon.png`)
- `-o, --output <path>`: Output ICNS file path (default: `icon.icns`)
- `-d, --dir <path>`: Temporary iconset directory name (default: `icon.iconset`)
- `-O, --output-dir <path>`: Output directory for all generated files (default: `output`)
- `-w, --work-dir <path>`: Working directory (default: current directory)
- `--list-formats`: Display supported file formats
- `-v, --version`: Display version number
- `-h, --help`: Display help information

### Using in Code

```javascript
import { generateIcns } from 'icns-generator';

// Using default configuration
await generateIcns();

// Using custom configuration
await generateIcns({
  inputFile: 'my-icon.png',
  outputIcns: 'app-icon.icns',
  iconsetDir: 'temp.iconset',
  outputDir: 'icons',
  workDir: '/path/to/project'
});
```

## Development

### Install Dependencies

```bash
pnpm install
```

### Local Testing

```bash
# Run directly
node src/index.js

# Or run via CLI
node bin/cli.js
```

## License

MIT

---

[中文文档](./README.zh-CN.md)
