export type ReleaseType = 'patch' | 'minor' | 'major'

export interface ReleaseResolution {
  version: string
  resume: boolean
}

export function nextVersion(currentVersion: string, releaseType: ReleaseType): string {
  const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(currentVersion)

  if (!match) {
    throw new Error(`Expected a stable three-part package version, received "${currentVersion}"`)
  }

  const [, majorValue, minorValue, patchValue] = match
  const major = Number(majorValue)
  const minor = Number(minorValue)
  const patch = Number(patchValue)

  if (releaseType === 'major') {
    return `${major + 1}.0.0`
  }

  if (releaseType === 'minor') {
    return `${major}.${minor + 1}.0`
  }

  return `${major}.${minor}.${patch + 1}`
}

export function resolveRelease(input: {
  currentVersion: string
  releaseType: ReleaseType
  targetTagExists: boolean
  targetVersionPublished: boolean
}): ReleaseResolution {
  const version = nextVersion(input.currentVersion, input.releaseType)

  if (input.targetTagExists) {
    return { version, resume: true }
  }

  if (input.targetVersionPublished) {
    throw new Error(`Version ${version} is already published to npm but has no matching Git tag`)
  }

  return { version, resume: false }
}
