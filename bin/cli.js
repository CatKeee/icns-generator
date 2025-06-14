#!/usr/bin/env node

/**
 * @file ICNS Generator Command Line Tool
 * @description Command line interface for converting various image formats to macOS application icons (.icns) files
 * @author JXDN <https://github.com/CatKeee>
 * @license MIT
 */

import { program } from 'commander';
import path from 'path';
import fs from 'fs-extra';
import { generateIcns, getSupportedFormats } from '../src/index.js';
import { fileURLToPath } from 'url';

// Get the directory of the current file
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packageJson = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../package.json'), 'utf8'));

// Get supported formats
const supportedFormats = getSupportedFormats();
const formatList = supportedFormats.join(', ');

// Set command line parameters
program
  .name('icns-generator')
  .description(`Convert images to macOS application icons (.icns) files\nSupported formats: ${formatList}`)
  .version(packageJson.version)
  .option('-i, --input <path>', 'Input image path', 'icon.png')
  .option('-o, --output <path>', 'Output ICNS file path', 'icon.icns')
  .option('-d, --dir <path>', 'Temporary iconset directory name', 'icon.iconset')
  .option('-w, --work-dir <path>', 'Working directory', process.cwd())
  .option('-O, --output-dir <path>', 'Output directory for all generated files', 'output')
  .option('-p, --padding <percent>', 'Padding around the icon (percentage per side)', '8.75')
  .option('--list-formats', 'Display supported file formats');

program.parse(process.argv);

const options = program.opts();

// If the user requests to display supported formats, show them and exit
if (options.listFormats) {
  console.log('💾 Supported image formats:');
  supportedFormats.forEach(format => console.log(`  - ${format}`));
  process.exit(0);
}

// Execute generation operation
(async () => {
  try {
    console.log('📐 ICNS Icon Generator');
    console.log(`💼 Input file: ${options.input}`);
    console.log(`📁 Output file: ${options.output}`);
    console.log(`📂 Output directory: ${options.outputDir}`);
    
    console.log(`📍 Padding: ${options.padding}%`);
    
    await generateIcns({
      inputFile: options.input,
      outputIcns: options.output,
      iconsetDir: options.dir,
      workDir: options.workDir,
      outputDir: options.outputDir,
      padding: parseFloat(options.padding)
    });
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
})();
