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
 * Create rounded image
 * @param {string} input - Input image path
 * @param {number} size - Image size
 * @returns {Promise<sharp.Sharp>} - Sharp object
 */
function createRoundedImage(input, size) {
  // macOS uses approximately 20% corner radius
  const radius = size * 0.2;
  const svg = `
    <svg width="${size}" height="${size}">
      <rect x="0" y="0" width="${size}" height="${size}" rx="${radius}" ry="${radius}" />
    </svg>
  `;
  return sharp(input)
    .resize(size, size)
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
  const { inputFile, iconsetDir, workDir, outputDir, supportedFormats } = config;

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
    const rounded = await createRoundedImage(inputPath, size);
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
