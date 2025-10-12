#!/usr/bin/env node

/**
 * Graph Paper Games - Classic grid-based strategy games for the web
 * Copyright (c) 2025 Brent A. Enck
 * 
 * This file is part of Graph Paper Games.
 * 
 * Graph Paper Games is free software: you can redistribute it and/or modify
 * it under the terms of the MIT License as published in the LICENSE file
 * included with this source code.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * MIT License for more details.
 */

/**
 * @fileoverview Copyright Header Addition Script
 * 
 * This script adds copyright headers to all TypeScript and JavaScript source files
 * in the project while preserving existing JSDoc @fileoverview comments.
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Copyright header template
const COPYRIGHT_HEADER = `/**
 * Graph Paper Games - Classic grid-based strategy games for the web
 * Copyright (c) 2025 Brent A. Enck
 * 
 * This file is part of Graph Paper Games.
 * 
 * Graph Paper Games is free software: you can redistribute it and/or modify
 * it under the terms of the MIT License as published in the LICENSE file
 * included with this source code.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * MIT License for more details.
 */`;

// File extensions to process
const EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx'];

// Directories to skip
const SKIP_DIRS = [
  'node_modules',
  'dist',
  'build',
  '.git',
  'coverage',
  '.next',
  '.nuxt',
  '.vscode',
  '.idea'
];

/**
 * Check if a file already has a copyright header
 * @param {string} content - File content
 * @returns {boolean}
 */
function hasCopyrightHeader(content) {
  return content.includes('Graph Paper Games - Classic grid-based strategy games') ||
         content.includes('Copyright (c) 2025 Brent A. Enck');
}

/**
 * Extract @fileoverview comment if present
 * @param {string} content - File content
 * @returns {{fileoverview: string | null, remainingContent: string}}
 */
function extractFileoverview(content) {
  // Look for @fileoverview pattern in JSDoc comment
  const fileoverviewMatch = content.match(/\/\*\*\s*\n\s*\*\s*@fileoverview[^*]*(?:\*(?!\/)[^*]*)*\*\//);
  
  if (fileoverviewMatch) {
    const fileoverview = fileoverviewMatch[0];
    const remainingContent = content.replace(fileoverview, '').trim();
    return { fileoverview, remainingContent };
  }
  
  return { fileoverview: null, remainingContent: content.trim() };
}

/**
 * Add copyright header to file content
 * @param {string} content - Original file content
 * @param {boolean} checkOnly - If true, only check for headers without modifying
 * @returns {string|boolean} - Content with copyright header, or boolean if checkOnly
 */
function addCopyrightHeader(content, checkOnly = false) {
  const hasHeader = hasCopyrightHeader(content);
  
  if (checkOnly) {
    if (hasHeader) {
      console.log('  ↳ ✅ Has copyright header');
    } else {
      console.log('  ↳ ❌ Missing copyright header');
    }
    return hasHeader;
  }
  
  if (hasHeader) {
    console.log('  ↳ Already has copyright header, skipping');
    return content;
  }

  const { fileoverview, remainingContent } = extractFileoverview(content);
  
  let newContent = COPYRIGHT_HEADER;
  
  // Add fileoverview after copyright header if it exists
  if (fileoverview) {
    newContent += '\n\n' + fileoverview;
  }
  
  // Add remaining content
  if (remainingContent) {
    newContent += '\n\n' + remainingContent;
  }
  
  return newContent;
}

/**
 * Process a single file
 * @param {string} filePath - Path to the file
 * @param {boolean} checkOnly - If true, only check for headers without modifying
 * @returns {boolean} - True if file has header (or was successfully updated)
 */
function processFile(filePath, checkOnly = false) {
  try {
    console.log(`Processing: ${filePath}`);
    
    const content = readFileSync(filePath, 'utf8');
    
    if (checkOnly) {
      return addCopyrightHeader(content, true);
    } else {
      const newContent = addCopyrightHeader(content, false);
      
      if (content !== newContent) {
        writeFileSync(filePath, newContent, 'utf8');
        console.log('  ↳ Copyright header added');
      }
      return true;
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return false;
  }
}

/**
 * Recursively find and process files
 * @param {string} dir - Directory to search
 * @param {boolean} checkOnly - If true, only check for headers without modifying
 * @param {Object} stats - Statistics object to track results
 * @returns {void}
 */
function processDirectory(dir, checkOnly = false, stats = { total: 0, withHeaders: 0 }) {
  try {
    const items = readdirSync(dir);
    
    for (const item of items) {
      const itemPath = join(dir, item);
      const stat = statSync(itemPath);
      
      if (stat.isDirectory()) {
        // Skip certain directories
        if (SKIP_DIRS.includes(item)) {
          continue;
        }
        
        // Recursively process subdirectories
        processDirectory(itemPath, checkOnly, stats);
      } else if (stat.isFile()) {
        // Process files with matching extensions
        const ext = extname(item);
        if (EXTENSIONS.includes(ext)) {
          stats.total++;
          const hasHeader = processFile(itemPath, checkOnly);
          if (hasHeader) {
            stats.withHeaders++;
          }
        }
      }
    }
  } catch (error) {
    console.error(`Error processing directory ${dir}:`, error.message);
  }
}

/**
 * Main function
 */
function main() {
  const isCheckMode = process.argv.includes('--check');
  
  if (isCheckMode) {
    console.log('🔍 Checking copyright headers in Graph Paper Games source files...');
  } else {
    console.log('🔄 Adding copyright headers to Graph Paper Games source files...');
  }
  console.log('');
  
  const projectRoot = join(__dirname, '..');
  const stats = { total: 0, withHeaders: 0 };
  
  // Process main source directories
  const sourceDirs = [
    'apps',
    'packages',
    'games'
  ];
  
  for (const dir of sourceDirs) {
    const dirPath = join(projectRoot, dir);
    console.log(`📁 Processing directory: ${dir}`);
    processDirectory(dirPath, isCheckMode, stats);
    console.log('');
  }
  
  // Process root-level TypeScript/JavaScript files
  console.log('📁 Processing root files...');
  const rootItems = readdirSync(projectRoot);
  for (const item of rootItems) {
    const itemPath = join(projectRoot, item);
    const stat = statSync(itemPath);
    
    if (stat.isFile() && EXTENSIONS.includes(extname(item))) {
      stats.total++;
      const hasHeader = processFile(itemPath, isCheckMode);
      if (hasHeader) {
        stats.withHeaders++;
      }
    }
  }
  
  console.log('');
  
  if (isCheckMode) {
    console.log(`📊 Copyright Header Report:`);
    console.log(`   Files checked: ${stats.total}`);
    console.log(`   With headers: ${stats.withHeaders}`);
    console.log(`   Missing headers: ${stats.total - stats.withHeaders}`);
    
    if (stats.withHeaders === stats.total) {
      console.log('✅ All files have copyright headers!');
      process.exit(0);
    } else {
      console.log('❌ Some files are missing copyright headers.');
      console.log('');
      console.log('Run: pnpm copyright:add');
      process.exit(1);
    }
  } else {
    console.log('✅ Copyright header addition complete!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Review the changes with: git diff');
    console.log('2. Test that everything still compiles: pnpm build');
    console.log('3. Run tests to ensure no breakage: pnpm test');
    console.log('4. Commit the changes: git commit -am "chore: add copyright headers to all source files"');
  }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}