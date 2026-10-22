import { describe, expect, it } from 'bun:test'
import { nextVersion, npmDistTag, resolveRelease } from '../.github/scripts/release-version'

describe('release versioning', () => {
  it('increments patch, minor and major versions', () => {
    expect(nextVersion('0.1.0', 'patch')).toBe('0.1.1')
    expect(nextVersion('0.1.0', 'minor')).toBe('0.2.0')
    expect(nextVersion('0.1.0', 'major')).toBe('1.0.0')
  })

  it('accepts alpha, beta, and rc versions that advance the current version', () => {
    expect(nextVersion('0.1.0', 'alpha', '1.0.0-alpha.1')).toBe('1.0.0-alpha.1')
    expect(nextVersion('1.0.0-alpha.1', 'alpha', '1.0.0-alpha.2')).toBe('1.0.0-alpha.2')
    expect(nextVersion('1.0.0-alpha.2', 'beta', '1.0.0-beta.1')).toBe('1.0.0-beta.1')
    expect(nextVersion('1.0.0-beta.1', 'rc', '1.0.0-rc.1')).toBe('1.0.0-rc.1')
  })

  it('requires a matching, newer prerelease version', () => {
    expect(() => nextVersion('0.1.0', 'alpha')).toThrow('PRERELEASE_VERSION is required')
    expect(() => nextVersion('0.1.0', 'rc', '1.0.0-beta.1')).toThrow('must use the rc channel')
    expect(() => nextVersion('1.0.0-beta.1', 'alpha', '1.0.0-alpha.2')).toThrow('must be newer')
    expect(() => nextVersion('1.0.0', 'alpha', '1.0.0-alpha.1')).toThrow('must be newer')
    expect(() => nextVersion('1.0.0', 'alpha', '1.0.0-alpha.01')).toThrow('stable or alpha, beta, or rc package version')
  })

  it('finalizes a prerelease base version with a patch release', () => {
    expect(nextVersion('1.0.0-rc.1', 'patch')).toBe('1.0.0')
    expect(nextVersion('1.0.0-rc.1', 'minor')).toBe('1.1.0')
  })

  it('uses matching npm dist-tags for prereleases', () => {
    expect(npmDistTag('1.0.0-alpha.1')).toBe('alpha')
    expect(npmDistTag('1.0.0-beta.2')).toBe('beta')
    expect(npmDistTag('1.0.0-rc.1')).toBe('rc')
    expect(npmDistTag('1.0.0')).toBe('latest')
  })

  it('resumes publication for a version whose tag already exists', () => {
    expect(resolveRelease({
      currentVersion: '0.1.0',
      releaseType: 'patch',
      targetTagExists: true,
      targetVersionPublished: false
    })).toEqual({ version: '0.1.1', resume: true })
  })

  it('resumes an existing prerelease tag', () => {
    expect(resolveRelease({
      currentVersion: '0.1.0',
      releaseType: 'rc',
      prereleaseVersion: '1.0.0-rc.1',
      targetTagExists: true,
      targetVersionPublished: false
    })).toEqual({ version: '1.0.0-rc.1', resume: true })
  })

  it('prepares a new version when no tag or npm version exists', () => {
    expect(resolveRelease({
      currentVersion: '0.1.0',
      releaseType: 'minor',
      targetTagExists: false,
      targetVersionPublished: false
    })).toEqual({ version: '0.2.0', resume: false })
  })

  it('rejects an npm version that has no matching tag', () => {
    expect(() => resolveRelease({
      currentVersion: '0.1.0',
      releaseType: 'patch',
      targetTagExists: false,
      targetVersionPublished: true
    })).toThrow('already published to npm but has no matching Git tag')
  })
})
