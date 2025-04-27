#!/usr/bin/env node

import fs from 'fs';
import { glob } from 'glob';

// Find all MDX files
const mdxFiles = glob.sync('**/*.mdx', { ignore: ['node_modules/**', 'dist/**'] });

let hasErrors = false;

// Check each MDX file
for (const file of mdxFiles) {
  const content = fs.readFileSync(file, 'utf8');
  const isApiReference = file.includes('api-reference/');
  const isSnippet = file.includes('snippets/');

  // Skip validation for snippets
  if (isSnippet) {
    continue;
  }

  // Check if the file has frontmatter
  if (!content.startsWith('---')) {
    console.error(`❌ ${file}: Missing frontmatter (should start with ---)`);
    hasErrors = true;
    continue;
  }

  // Find the end of frontmatter
  const endIndex = content.indexOf('---', 3);
  if (endIndex === -1) {
    console.error(`❌ ${file}: Frontmatter must end with ---`);
    hasErrors = true;
    continue;
  }

  // Extract frontmatter content
  const frontmatterContent = content.substring(3, endIndex).trim();

  // Check for required fields only if not in api-reference directory
  if (!isApiReference) {
    if (!frontmatterContent.includes('title:')) {
      console.error(`❌ ${file}: Missing title field in frontmatter`);
      hasErrors = true;
    }

    if (!frontmatterContent.includes('description:')) {
      console.error(`❌ ${file}: Missing description field in frontmatter`);
      hasErrors = true;
    }
  }

  // Check for proper formatting (key: value pairs)
  const lines = frontmatterContent.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line && !line.includes(':')) {
      console.error(`❌ ${file}: Invalid frontmatter format at line ${i + 1}: "${line}"`);
      hasErrors = true;
    }
  }
}

if (hasErrors) {
  console.error('\n❌ Frontmatter validation failed. Please fix the issues above.');
  process.exit(1);
} else {
  console.log('✅ All MDX files have valid frontmatter.');
}
