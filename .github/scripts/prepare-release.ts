import { appendFileSync, readFileSync } from 'node:fs'
import { nextVersion, resolveRelease, type ReleaseType } from './release-version'

interface PackageManifest {
  name: string
  version: string
}

function runGit(args: string[]): string {
  const result = Bun.spawnSync({ cmd: ['git', ...args], stdout: 'pipe', stderr: 'pipe' })
  const stdout = new TextDecoder().decode(result.stdout).trim()

  if (result.exitCode !== 0) {
    const stderr = new TextDecoder().decode(result.stderr).trim()
    throw new Error(stderr || `git ${args.join(' ')} failed`)
  }

  return stdout
}

async function isPublished(packageName: string, version: string): Promise<boolean> {
  const registryName = packageName.replace('/', '%2f')
  const response = await fetch(`https://registry.npmjs.org/${registryName}/${version}`)

  if (response.status === 404) {
    return false
  }

  if (!response.ok) {
    throw new Error(`npm registry check failed with HTTP ${response.status}`)
  }

  return true
}

async function main(): Promise<void> {
  const manifest = JSON.parse(readFileSync('package.json', 'utf8')) as PackageManifest
  const releaseType = process.env.RELEASE_TYPE as ReleaseType | undefined
  const prereleaseVersion = process.env.PRERELEASE_VERSION
  const outputFile = process.env.GITHUB_OUTPUT

  if (!releaseType || !['patch', 'minor', 'major', 'alpha', 'beta', 'rc'].includes(releaseType)) {
    throw new Error('RELEASE_TYPE must be patch, minor, major, alpha, beta, or rc')
  }

  if (!outputFile) {
    throw new Error('GITHUB_OUTPUT is required')
  }

  runGit(['fetch', 'origin', '+refs/heads/main:refs/remotes/origin/main', '--tags', '--force'])

  const version = nextVersion(manifest.version, releaseType, prereleaseVersion)
  const targetTag = `v${version}`
  const existingTag = runGit(['tag', '--list', targetTag])
  const resolution = resolveRelease({
    currentVersion: manifest.version,
    releaseType,
    prereleaseVersion,
    targetTagExists: Boolean(existingTag),
    targetVersionPublished: existingTag ? false : await isPublished(manifest.name, version)
  })

  if (resolution.resume) {
    runGit(['merge-base', '--is-ancestor', 'HEAD', targetTag])
    runGit(['merge-base', '--is-ancestor', targetTag, 'refs/remotes/origin/main'])
    const taggedManifest = JSON.parse(runGit(['show', `${targetTag}:package.json`])) as PackageManifest

    if (taggedManifest.version !== resolution.version) {
      throw new Error(`Tag ${targetTag} points to package version ${taggedManifest.version}`)
    }

    appendFileSync(outputFile, `version=${resolution.version}\nresume=true\n`)
    return
  }

  const currentHead = runGit(['rev-parse', 'HEAD'])
  const remoteMain = runGit(['rev-parse', 'refs/remotes/origin/main'])

  if (currentHead !== remoteMain) {
    throw new Error('main advanced after this release was requested. Start a new Release workflow from the latest main commit.')
  }

  appendFileSync(outputFile, `version=${resolution.version}\nresume=false\n`)
}

if (import.meta.main) {
  await main()
}
