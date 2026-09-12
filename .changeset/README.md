# Changesets

Changesets under this directory describe future publishable changes to
workspace packages. The initial minor changeset was consumed to produce the
0.2.0 package version in this refactor, so there is no additional pending bump.

Typical maintainer commands, once `@changesets/cli` and the corresponding root
scripts are installed, are:

```bash
pnpm changeset
pnpm changeset version
pnpm changeset publish
```

The repository had no Git remote or established default branch when this
configuration was created. `baseBranch` therefore records the known
`feat/mystique-v1` branch and must be revisited when a remote default branch is
created. There is intentionally no automated release workflow yet.
