/**
 * @file ICNS Generator Core Module
 * @description Core functionality for converting various image formats to macOS application icons (.icns) files
 * @author JXDN <https://github.com/CatKeee>
 * @license MIT
 */

import sharp from "sharp";
import fs from "fs-extra";
import path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

// Get the directory of the current file
const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * @typedef {Object} IconSize
 * @property {string} name - Icon filename
 * @property {number} size - Icon size
 */

/**
 * Default configuration
 * @type {Object}
 */
const defaultConfig = {
  inputFile: "icon.png",
  iconsetDir: "icon.iconset",
  outputIcns: "icon.icns",
  workDir: process.cwd(),
  // Output directory for all generated files
  outputDir: "output",
  // Padding around the icon (percentage of the size, per side)
  padding: 8.75,
  // Supported image formats
  supportedFormats: [
    ".png",
    ".jpg",
    ".jpeg",
    ".webp",
    ".tiff",
    ".gif",
    ".svg",
    ".avif",
    ".heif",
    ".bmp",
  ],
};

/**
 * All required sizes (official requires both 1x and 2x)
 * @type {number[]}
 */
const sizes = [16, 32, 64, 128, 256, 512, 1024];

/**
 * Generate configurations for all icon sizes
 * @type {IconSize[]}
 */
const allSizes = sizes.flatMap((size) => [
  { name: `icon_${size}x${size}.png`, size },
  { name: `icon_${size}x${size}@2x.png`, size: size * 2 },
]);

/**
 * Create rounded image with optional padding
 * @param {string} input - Input image path
 * @param {number} size - Image size
 * @param {number} padding - Padding percentage (per side, relative to canvas width)
 * @returns {Promise<sharp.Sharp>} - Sharp object
 */
function createRoundedImage(input, size, padding = 0) {
  // Calculate padding pixels - each side is the specified percentage of the total size
  const paddingPixels = Math.round((size * padding) / 100);
  const contentSize = size - paddingPixels * 2;

  // macOS uses approximately 20% corner radius (based on content size, not canvas size)
  const radius = contentSize * 0.2;

  // Create an SVG with a centered rounded rectangle
  const svg = `
    <svg width="${size}" height="${size}">
      <rect 
        x="${paddingPixels}" 
        y="${paddingPixels}" 
        width="${contentSize}" 
        height="${contentSize}" 
        rx="${radius}" 
        ry="${radius}" 
      />
    </svg>
  `;

  return sharp(input)
    .resize(contentSize, contentSize) // Resize to content size first
    .extend({
      // Then add padding with transparent background
      top: paddingPixels,
      bottom: paddingPixels,
      left: paddingPixels,
      right: paddingPixels,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .composite([{ input: Buffer.from(svg), blend: "dest-in" }])
    .png();
}

/**
 * Check if the file format is supported
 * @param {string} filePath - File path
 * @param {string[]} supportedFormats - List of supported formats
 * @returns {boolean} - Whether the format is supported
 */
function isSupportedFormat(filePath, supportedFormats) {
  const ext = path.extname(filePath).toLowerCase();
  return supportedFormats.includes(ext);
}

/**
 * Generate iconset folder and all size icons within it
 * @param {Object} options - Configuration options
 * @returns {Promise<string>} - iconset path
 */
async function generateIconset(options = {}) {
  const config = { ...defaultConfig, ...options };
  const { inputFile, iconsetDir, workDir, outputDir, supportedFormats } =
    config;

  const inputPath = path.resolve(workDir, inputFile);

  // Create output directory if it doesn't exist
  const outputDirPath = path.resolve(workDir, outputDir);
  if (!fs.existsSync(outputDirPath)) {
    await fs.mkdir(outputDirPath, { recursive: true });
    console.log(`📁 Created output directory: ${outputDirPath}`);
  }

  // Set iconset path inside the output directory
  const iconsetPath = path.resolve(outputDirPath, iconsetDir);

  // Ensure input file exists
  if (!fs.existsSync(inputPath)) {
    throw new Error(`Input file does not exist: ${inputPath}`);
  }

  // Check if file format is supported
  if (!isSupportedFormat(inputPath, supportedFormats)) {
    const ext = path.extname(inputPath);
    throw new Error(
      `Unsupported file format: ${ext}\nSupported formats: ${supportedFormats.join(
        ", "
      )}`
    );
  }

  // Clean and create iconset directory
  await fs.remove(iconsetPath);
  await fs.mkdir(iconsetPath);

  console.log(`💾 Processing image: ${path.basename(inputPath)}`);

  // Generate icons for all sizes
  for (const { name, size } of allSizes) {
    const outputPath = path.join(iconsetPath, name);
    const rounded = await createRoundedImage(inputPath, size, config.padding);
    await rounded.toFile(outputPath);
  }

  return iconsetPath;
}

/**
 * Generate .icns file
 * @param {Object} options - Configuration options
 * @returns {Promise<string>} - Output file path
 */
async function generateIcns(options = {}) {
  const config = { ...defaultConfig, ...options };
  const { outputIcns, workDir, outputDir } = config;

  // Create output directory if it doesn't exist
  const outputDirPath = path.resolve(workDir, outputDir);
  if (!fs.existsSync(outputDirPath)) {
    await fs.mkdir(outputDirPath, { recursive: true });
  }

  // Set output path inside the output directory
  const outputPath = path.resolve(outputDirPath, outputIcns);

  try {
    console.log("🌀 Generating iconset with rounded corners...");
    const iconsetResult = await generateIconset(options);

    console.log("💾 Packaging to .icns...");
    execSync(`iconutil -c icns "${iconsetResult}" -o "${outputPath}"`);

    // Export plain-named PNGs (without icon_ prefix)
    const plainDir = path.resolve(outputDirPath, "icons");
    await fs.remove(plainDir);
    await fs.mkdir(plainDir);
    for (const { name } of allSizes) {
      const srcFile = path.join(iconsetResult, name);
      const plainName = name.replace(/^icon_/, "");
      const destFile = path.join(plainDir, plainName);
      await fs.copyFile(srcFile, destFile);
    }
    console.log(`📦 Exported plain icons: ${plainDir}`);

    console.log(`✅ Generation successful: ${outputPath}`);
    return outputPath;
  } catch (err) {
    console.error("❌ Generation failed:", err);
    throw err;
  }
}

/**
 * Get list of supported file formats
 * @returns {string[]} List of supported formats
 */
function getSupportedFormats() {
  return [...defaultConfig.supportedFormats];
}

// If this file is run directly, execute default operation
if (import.meta.url === `file://${process.argv[1]}`) {
  generateIcns().catch(console.error);
}

export {
  generateIcns,
  generateIconset,
  createRoundedImage,
  getSupportedFormats,
  isSupportedFormat,
};
