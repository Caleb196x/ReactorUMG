// src/build.ts
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const SOURCE_DIR = '.'; 
const tsConfig = JSON.parse(fs.readFileSync('./tsconfig.json', 'utf-8'));
const OUT_DIR = tsConfig.compilerOptions.outDir;
const IGNORE_EXTENSIONS = ['.ts', '.tsx'] as string[];
const IGNORE_FILES = ['tsconfig.json', 'package-lock.json', 'build.ts', 'README.md', 'yarn.lock'] as string[];

async function build() {
  try {

    console.log('\n\n================\n');
    console.log('🛠  Compiling TypeScript...');
    execSync('tsc', { stdio: 'inherit' });

    console.log('📂 Copying static files...');
    await copyNonScriptFiles(SOURCE_DIR, OUT_DIR);

    console.log('📦 install dependencies for js...');
    const cmd = 'yarn install --cwd ' + OUT_DIR;
    execSync(cmd, { stdio: 'inherit' });

    console.log('✅ Build completed successfully!');
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

async function copyNonScriptFiles(source: string, dest: string) {
  let files = fs.readdirSync(source);
 
  for (const file of files) {
    const srcPath = path.join(source, file);
    const destPath = path.join(dest, file);

    if (file === 'node_modules' || srcPath === OUT_DIR) continue;
    if (IGNORE_FILES.includes(file)) continue;

    // const stat = await fs.stat(srcPath);
    const ext = path.extname(file).toLowerCase();

    const stat = fs.statSync(srcPath);
    if (stat.isDirectory()) {
      await copyNonScriptFiles(srcPath, destPath);
    } else if (!IGNORE_EXTENSIONS.includes(ext)) {
      const parentDir = path.dirname(destPath);
      if (!fs.existsSync(parentDir)) {
        fs.mkdirSync(parentDir, { recursive: true });
      }
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

build();