# Publishing Guide for @cano721/mysql-mcp-server

This guide explains how to publish the MySQL MCP Server to npm.

## Prerequisites

1. **npm account**: Make sure you have an npm account at https://www.npmjs.com/
2. **npm CLI**: Ensure you have npm installed and are logged in:
   ```bash
   npm login
   ```

## Pre-publication Checklist

1. **Version Update**: Update the version in `package.json` if needed:
   ```bash
   npm version patch  # for bug fixes
   npm version minor  # for new features
   npm version major  # for breaking changes
   ```

2. **Build the Project**: Ensure the project builds successfully:
   ```bash
   npm run build
   ```

3. **Test the Package**: Test the package locally:
   ```bash
   npm test
   ```

## Publishing Steps

1. **Dry Run**: First, do a dry run to see what will be published:
   ```bash
   npm publish --dry-run
   ```

2. **Publish**: If everything looks good, publish to npm:
   ```bash
   npm publish
   ```

## Post-publication

1. **Verify**: Check that your package is available on npm:
   ```bash
   npm view @cano721/mysql-mcp-server
   ```

2. **Test Installation**: Test installing your package:
   ```bash
   npm install -g @cano721/mysql-mcp-server
   ```

## Package Information

- **Name**: @cano721/mysql-mcp-server
- **Repository**: https://github.com/cano721/mysql-mcp-server
- **Author**: cano721
- **License**: MIT

## Files Included in Package

The package includes only the essential files:
- `build/` - Compiled JavaScript files
- `package.json` - Package metadata
- `README.md` - Documentation
- `LICENSE` - License file

## Usage After Publication

Users can install and use your package with:

```bash
# Global installation
npm install -g @cano721/mysql-mcp-server

# Local installation
npm install @cano721/mysql-mcp-server
```

## MCP Configuration

Users can configure the MCP server in their Claude Desktop settings:

```json
{
  "mcpServers": {
    "mysql": {
      "command": "npx",
      "args": ["@cano721/mysql-mcp-server"],
      "env": {
        "MYSQL_HOST": "localhost",
        "MYSQL_PORT": "3306",
        "MYSQL_USER": "your-mysql-user",
        "MYSQL_PASSWORD": "your-mysql-password",
        "MYSQL_DATABASE": "your-default-database"
      },
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

## Troubleshooting

- **Permission Issues**: If you get permission errors, make sure you're logged into npm and have the right to publish under this package name.
- **Version Conflicts**: If the version already exists, increment the version number.
- **Build Errors**: Make sure `npm run build` completes successfully before publishing.