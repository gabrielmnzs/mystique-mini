# Changesets

Changesets under this directory describe user-visible changes to the publishable
`mystique-mini-react` package. Add one in the pull request that changes the
package:

```bash
pnpm changeset
```

The unpublished `mystique-mini-react@0.2.0` rename/bootstrap is the one
documented exception: it uses an empty Changeset so validation records the
intentional no-bump decision and the initial public version remains `0.2.0`.
Normal release-bearing Changesets are required after that bootstrap release.

Select `mystique-mini-react`, choose the appropriate semantic version impact,
and write a concise release note in English. Documentation, tests, and
repository-only tooling changes may use an empty changeset when maintainers want
to record that no package release is required:

```bash
pnpm changeset --empty
```

The release workflow watches `main`. Pending changesets produce or update a
version pull request through `pnpm version-packages`; that command also creates
or updates each affected package's `CHANGELOG.md` using the changelog generator
bundled with Changesets v3. After that pull request is reviewed and merged,
publishing remains disabled until a maintainer manually dispatches the workflow
with its `publish` input enabled and approves the `npm-publish` environment.

See `RELEASING.md` for npm bootstrap, trusted-publisher, validation, and
recovery instructions. Do not add registry tokens to the repository.
