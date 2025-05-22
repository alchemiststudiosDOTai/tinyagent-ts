# NPM Launch Plan for tinyAgent-TS

## Pre-Publish Checklist

- [x] **Package metadata**: Complete `package.json` (name, description, keywords, repository, Business Source License 1.1).
- [x] **Versioning**: Start at `0.1.0`, use Conventional Commits for future updates.
- [x] **Build**: Configure Rollup to generate `dist/index.js`, `dist/index.cjs`, `dist/index.d.ts`.
- [x] **Tree-shaking**: Set `sideEffects: false` in `package.json`.
- [x] **Types**: Set up to generate type declarations with `tsc -p tsconfig.build.json`.
- [ ] **Lint & format**: Ensure `npm run lint` passes (ESLint + Prettier).
- [ ] **Security**: Run `npm audit`, remove unused dependencies, pin critical versions.
- [ ] **README**: Update README to include quick-start, API table, badges (npm version, CI status).
- [x] **Changelog**: Created `CHANGELOG.md` with initial release notes.

## Launch Steps

1. [ ] **Reserve name**: Check `npm view tinyagent-ts`; use `@tiny/agent` if unavailable.
2. [ ] **Enable 2FA**: Activate on npm publishing account.
3. [ ] **Tag release**: Run `npm version 0.1.0 && git push --follow-tags`.
4. [ ] **Publish**: Execute `npm publish --access public`.
5. [ ] **Smoke-test**: Test in a new project (`npx degit user/tmp && npm i tinyagent-ts && node demo.js`).
6. [ ] **Announce**: Update repo badges, post to X and Discord dev server.

## Post-Launch Tasks

- [ ] Update documentation with npm installation instructions
- [ ] Add npm version badge to README
- [ ] Create GitHub release with changelog notes
- [ ] Set up semantic-release or similar for future releases
- [ ] Consider CI/CD pipeline improvements for automated publishing

## Troubleshooting

If any issues arise during the publishing process, document them here along with the solutions for future reference.

## Related Resources

- [npm Docs: Publishing packages](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [standard-version](https://github.com/conventional-changelog/standard-version)
