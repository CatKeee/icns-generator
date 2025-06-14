# ICNS 图标生成器

一个简单易用的 macOS 应用图标(.icns)生成工具，可以将各种格式的图片转换为带圆角的 macOS 应用图标。

## 特性

- ✨ 自动生成所有 macOS 需要的图标尺寸
- 🎨 自动添加 macOS 风格的圆角（20% 圆角）
- 🖼️ 支持多种图片格式（PNG、JPG、WEBP、SVG、GIF 等）
- 🛠️ 支持命令行使用
- 📦 简单易用，零配置

## 系统要求

- Node.js 14.0.0 或更高版本
- macOS 系统（需要使用 `iconutil` 命令）

## 安装

### 全局安装

```bash
# 使用 npm
npm install -g icns-generator

# 使用 pnpm（推荐）
pnpm add -g icns-generator
```

### 本地安装

```bash
# 克隆仓库
git clone https://github.com/CatKeee/icns-generator.git
cd icns-generator

# 安装依赖
pnpm install

# 链接到全局
pnpm link --global
```

## 使用方法

### 命令行使用

```bash
# 基本用法（在当前目录下查找 icon.png 并生成 icon.icns）
icns-generator

# 指定输入文件
icns-generator --input my-icon.jpg

# 指定输出文件
icns-generator --output app-icon.icns

# 查看支持的文件格式
icns-generator --list-formats

# 完整参数
icns-generator --input my-icon.png --output app-icon.icns --dir temp.iconset --output-dir icons --padding 10 --work-dir /path/to/project
```

### 参数说明

- `-i, --input <path>`: 输入图片路径（默认: `icon.png`）
- `-o, --output <path>`: 输出 ICNS 文件路径（默认: `icon.icns`）
- `-d, --dir <path>`: 临时 iconset 目录名称（默认: `icon.iconset`）
- `-O, --output-dir <path>`: 所有生成文件的输出目录（默认: `output`）
- `-p, --padding <percent>`: 图标四周的留白区域百分比（默认: `8.75`）
- `-w, --work-dir <path>`: 工作目录（默认: 当前目录）
- `--list-formats`: 显示支持的文件格式
- `-v, --version`: 显示版本号
- `-h, --help`: 显示帮助信息

### 在代码中使用

```javascript
import { generateIcns } from 'icns-generator';

// 使用默认配置
await generateIcns();

// 使用自定义配置
await generateIcns({
  inputFile: 'my-icon.png',
  outputIcns: 'app-icon.icns',
  iconsetDir: 'temp.iconset',
  outputDir: 'icons',
  padding: 10, // 自定义留白百分比
  workDir: '/path/to/project'
});
```

## 开发

### 安装依赖

```bash
pnpm install
```

### 本地测试

```bash
# 直接运行
node src/index.js

# 或者通过 CLI 运行
node bin/cli.js
```

## 许可证

MIT
