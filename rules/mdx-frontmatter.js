// Create a custom rule for frontmatter validation
const frontmatterRule = {
  name: 'frontmatter-format',
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce proper frontmatter formatting in MDX files',
      category: 'Possible Errors',
    },
    fixable: 'code',
    schema: [],
  },
  create(context) {
    return {
      Program(node) {
        const sourceCode = context.getSourceCode();
        const text = sourceCode.getText();
        const filePath = context.getFilename();
        const isApiReference = filePath.includes('api-reference/');
        const isSnippet = filePath.includes('snippets/');

        // Skip validation for snippets
        if (isSnippet) {
          return;
        }

        // Check if the file has frontmatter
        if (!text.startsWith('---')) {
          context.report({
            node,
            message: 'MDX files must start with frontmatter (---)',
            fix(fixer) {
              return fixer.insertTextBefore(
                node,
                "---\ntitle: 'Untitled'\ndescription: 'No description provided'\n---\n\n"
              );
            },
          });
          return;
        }

        // Find the end of frontmatter
        const endIndex = text.indexOf('---', 3);
        if (endIndex === -1) {
          context.report({
            node,
            message: 'Frontmatter must end with ---',
            fix(fixer) {
              return fixer.insertTextAfter(node, '\n---\n');
            },
          });
          return;
        }

        // Extract frontmatter content
        const frontmatterContent = text.substring(3, endIndex).trim();

        // Check for required fields only if not in api-reference directory
        if (!isApiReference) {
          if (!frontmatterContent.includes('title:')) {
            context.report({
              node,
              message: 'Frontmatter must include a title field',
              fix(fixer) {
                return fixer.insertTextBefore(node, "---\ntitle: 'Untitled'\n---\n\n");
              },
            });
          }

          if (!frontmatterContent.includes('description:')) {
            context.report({
              node,
              message: 'Frontmatter must include a description field',
              fix(fixer) {
                return fixer.insertTextBefore(
                  node,
                  "---\ndescription: 'No description provided'\n---\n\n"
                );
              },
            });
          }
        }

        // Check for proper formatting (key: value pairs)
        const lines = frontmatterContent.split('\n');
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();
          if (line && !line.includes(':')) {
            context.report({
              node,
              message: `Invalid frontmatter format at line ${i + 1}: "${line}"`,
              fix(fixer) {
                return fixer.replaceText(node, text.replace(line, `${line}: ""`));
              },
            });
          }
        }
      },
    };
  },
};

// Export the rule as a plugin
export default {
  rules: {
    'frontmatter-format': frontmatterRule,
  },
};
