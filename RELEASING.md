# Releasing Mystique Mini React

`mystique-mini-react` is configured for unscoped public publication on npmjs.org
and has not yet received its initial release. Releases use Changesets v3 and the
split Changesets GitHub Actions v2 workflow in `.github/workflows/release.yml`.
After bootstrap, the normal automated path uses npm trusted publishing through
OpenID Connect (OIDC); the repository must not contain an npm publish token.

## One-time npm and GitHub bootstrap

Trusted publishing can only be attached after the package exists on npm. If
`mystique-mini-react` has never been published, an npm owner must perform the
first publication once from a clean, reviewed `main` checkout:

1. Enable two-factor authentication on the npm owner account and confirm that
   the package name is available.
2. Install with the pinned toolchain and run the validation commands below.
3. Review `pnpm pack --dry-run` from `packages/react` and confirm that only
   `dist`, `LICENSE`, `README.md`, `THIRD_PARTY_NOTICES.md`, and `package.json`
   are included.
4. Publish version `0.2.0` manually with an interactive npm OTP. Do not store
   the OTP or a token in a file, shell history, repository secret, or workflow.

From `packages/react`, the one-time command is:

```bash
npm publish --access public
```

After npm reports `mystique-mini-react@0.2.0` as published, tag the exact
reviewed `main` commit and create the matching GitHub Release:

```bash
git tag -a mystique-mini-react@0.2.0 -m "mystique-mini-react@0.2.0"
git push origin mystique-mini-react@0.2.0
gh release create mystique-mini-react@0.2.0 \
  --verify-tag \
  --title "mystique-mini-react@0.2.0" \
  --notes "Initial public release."
```

The manual publish and tagging commands are intentionally not automated or run
as part of repository setup. Once the package exists, configure its npm trusted
publisher with these exact values:

- provider: GitHub Actions;
- owner: `gabrielmnzs`;
- repository: `mystique-mini`;
- workflow filename: `release.yml`;
- environment: `npm-publish`;
- allowed action: direct `npm publish`.

The package rename and release-tooling bootstrap use an empty Changeset. It
records the intentional no-bump decision without advancing the unpublished
package before its first public `0.2.0` release. After `0.2.0` exists on npm,
every user-visible package change follows the normal release-bearing Changeset
rule below.

On GitHub, create the `npm-publish` environment, restrict it to `main`, and add
required reviewers. In **Settings > Actions > General**, allow GitHub Actions to
create pull requests so the version job can maintain its release pull request.
Depending on repository policy, a maintainer may also need to open that pull
request and click **Approve workflows** before its required checks run. Do not
add `NPM_TOKEN`: only the publish job receives `id-token: write`, and npm
exchanges that OIDC identity for short-lived publish authorization.

After the first OIDC-backed release succeeds, set the npm package's publishing
access to **Require two-factor authentication and disallow tokens**. Trusted
publishing continues to work while long-lived token publication is disabled.

## Validate a release candidate

Use Node.js 24 and pnpm 11.25.0 through Corepack. The pinned Node.js 24.19.0
runtime includes npm 11.17.0, which is above npm's 11.5.1 minimum for trusted
publishing. Start from a clean checkout with the committed lockfile:

```bash
corepack enable
corepack install --global pnpm@11.25.0
pnpm install --frozen-lockfile
pnpm format:check
pnpm lint
pnpm check-types
pnpm test
pnpm validate:package
```

`pnpm validate:package` builds `mystique-mini-react`, runs its ESM and CommonJS
artifact smokes, compiles both declaration formats, and installs its tarball in
an isolated offline consumer. A release is not ready if any command fails or if
the working tree changes during validation.

## Add a release note

Every user-visible package change should include a Changeset in the same pull
request:

```bash
pnpm changeset
```

Select `mystique-mini-react`, choose the semantic version impact, and write a
concise English summary for package users. Repository-only work may use
`pnpm changeset --empty` when maintainers want an explicit no-release record.
Never edit package versions by hand in a feature pull request.

## Version and publish flow

1. Merge a reviewed package change and its Changeset into `main`.
2. The Release workflow selects `version` mode and creates or updates the
   `chore: version packages` pull request by running `pnpm version-packages`.
   That command consumes pending Changesets and creates or updates the affected
   package's `CHANGELOG.md` with the generator bundled in Changesets v3.
3. Review the generated version, consumed Changesets, `CHANGELOG.md`, and
   lockfile diff; require the ordinary CI checks before merging that pull
   request.
4. After the version pull request lands, open **Actions > Release > Run
   workflow**, select `main`, and explicitly enable the `publish` input.
5. Approve the protected `npm-publish` environment. The workflow validates the
   package, packs the immutable release artifact, publishes that same artifact
   through OIDC, then creates the matching git tag and GitHub Release.
6. Verify the npm version, provenance, public files, export map, and install
   command in a clean consumer.

A push to `main` can create or update a version pull request, but it cannot
publish. Packing and publishing require both a manual dispatch with
`publish: true` and environment approval. A manual dispatch while Changesets are
still pending remains in version mode and does not publish.

## Local emergency path

The root `pnpm release` script runs the full monorepo build and then
`changeset publish`. It exists for an explicitly authorized recovery by an npm
owner; it is not the normal release path and requires interactive npm
authentication. Prefer the reviewed workflow because its pack and publish jobs
share an immutable artifact and its credentials are short-lived.

If packing fails, nothing has been published. If a publish is interrupted,
inspect npm and GitHub before retrying; Changesets can skip versions that
already exist, but tags and GitHub Releases may still need reconciliation. Do
not bump a version again or delete a published version merely to make a retry
green.
