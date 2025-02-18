# Release Process

1. Update CHANGELOG.md with the new version
2. Run tests and linting
   ```bash
   bun run lint
   ```
3. Update version
   ```bash
   npm version <patch|minor|major>
   ```
4. Publish to npm
   ```bash
   npm publish --access public
   ```
5. Push git changes
   ```bash
   git push && git push --tags
   ```
4. Test the demo app
   ```bash
   cd packages/dashboard
   bun run dev
   # Visit http://localhost:3000
   ``` 