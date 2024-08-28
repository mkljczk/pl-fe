import { execSync } from 'node:child_process';

import pkg from '../../package.json';

const { CI_COMMIT_TAG, CI_COMMIT_REF_NAME, CI_COMMIT_SHA } = process.env;

const shortRepoName = (url: string): string => new URL(url).pathname.substring(1);
const trimHash = (hash: string): string => hash.substring(0, 7);

const tryGit = (cmd: string): string | undefined => {
  try {
    return String(execSync(cmd));
  } catch (e) {
    return undefined;
  }
};

const version = (pkg: { version: string }): string => {
  // Try to discern from GitLab CI first
  if (CI_COMMIT_TAG === `v${pkg.version}` || CI_COMMIT_REF_NAME === 'stable') {
    return pkg.version;
  }

  if (typeof CI_COMMIT_SHA === 'string') {
    return `${pkg.version}-${trimHash(CI_COMMIT_SHA)}`;
  }

  // Fall back to git directly
  const head = tryGit('git rev-parse HEAD');
  const tag = tryGit(`git rev-parse v${pkg.version}`);

  if (head && head !== tag) return `${pkg.version}-${trimHash(head)}`;

  // Fall back to version in package.json
  return pkg.version;
};

const code = {
  name: pkg.name,
  displayName: pkg.displayName,
  url: pkg.repository.url,
  repository: shortRepoName(pkg.repository.url),
  version: version(pkg),
  homepage: pkg.homepage,
  ref: CI_COMMIT_TAG || CI_COMMIT_SHA || tryGit('git rev-parse HEAD'),
};

export type Code = typeof code;

export default () => ({
  data: code,
});
