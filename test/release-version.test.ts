import { describe, expect, it } from 'bun:test'
import { nextVersion, resolveRelease } from '../.github/scripts/release-version'

describe('release versioning', () => {
  it('increments patch, minor and major versions', () => {
    expect(nextVersion('0.1.0', 'patch')).toBe('0.1.1')
    expect(nextVersion('0.1.0', 'minor')).toBe('0.2.0')
    expect(nextVersion('0.1.0', 'major')).toBe('1.0.0')
  })

  it('rejects non-stable package versions', () => {
    expect(() => nextVersion('1.0.0-beta.1', 'patch')).toThrow('stable three-part package version')
  })

  it('resumes publication for a version whose tag already exists', () => {
    expect(resolveRelease({
      currentVersion: '0.1.0',
      releaseType: 'patch',
      targetTagExists: true,
      targetVersionPublished: false
    })).toEqual({ version: '0.1.1', resume: true })
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
