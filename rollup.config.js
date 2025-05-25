const typescript = require('@rollup/plugin-typescript');
const resolve = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const json = require('@rollup/plugin-json');
const terser = require('@rollup/plugin-terser');
const pkg = require('./package.json');
const fs = require('fs');
const path = require('path');

// Custom plugin to copy prompt templates to dist
function copyPromptTemplates() {
  return {
    name: 'copy-prompt-templates',
    writeBundle() {
      // Create the directory structure
      const sourceDir = path.join(__dirname, 'src', 'core', 'prompts');
      const destDir = path.join(__dirname, 'dist', 'core', 'prompts');
      
      // Create the destination directory if it doesn't exist
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }
      
      // Copy files recursively
      function copyDir(src, dest) {
        if (!fs.existsSync(dest)) {
          fs.mkdirSync(dest, { recursive: true });
        }
        
        const entries = fs.readdirSync(src, { withFileTypes: true });
        
        for (const entry of entries) {
          const srcPath = path.join(src, entry.name);
          const destPath = path.join(dest, entry.name);
          
          if (entry.isDirectory()) {
            copyDir(srcPath, destPath);
          } else {
            fs.copyFileSync(srcPath, destPath);
          }
        }
      }
      
      copyDir(sourceDir, destDir);
      console.log('Prompt templates copied to dist directory');
    }
  };
}

const external = [
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.peerDependencies || {}),
];

module.exports = [
  // ESM build
  {
    input: 'src/index.ts',
    output: {
      file: pkg.module || 'dist/index.js',
      format: 'esm',
      sourcemap: true,
    },
    external,
    plugins: [
      resolve(),
      commonjs(),
      json(),
      typescript({ tsconfig: './tsconfig.build.json' }),
      copyPromptTemplates(),
    ],
  },
  // CommonJS build
  {
    input: 'src/index.ts',
    output: {
      file: pkg.main || 'dist/index.cjs',
      format: 'cjs',
      sourcemap: true,
    },
    external,
    plugins: [
      resolve(),
      commonjs(),
      json(),
      typescript({ tsconfig: './tsconfig.build.json' }),
      terser(),
      copyPromptTemplates(),
    ],
  },
];
