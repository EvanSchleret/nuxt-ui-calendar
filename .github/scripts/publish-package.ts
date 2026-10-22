import { readFile } from 'node:fs/promises'
import { npmDistTag } from './release-version'

interface PackageManifest {
  name: string
  version: string
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
  const tarball = process.argv[2]
  const releaseVersion = process.env.RELEASE_VERSION
  const manifest = JSON.parse(await readFile('package.json', 'utf8')) as PackageManifest

  if (!tarball || !releaseVersion) {
    throw new Error('Pass the verified tarball path and set RELEASE_VERSION')
  }

  if (manifest.version !== releaseVersion) {
    throw new Error(`Tag version ${releaseVersion} does not match package version ${manifest.version}`)
  }

  if (await isPublished(manifest.name, releaseVersion)) {
    process.stdout.write(`${manifest.name}@${releaseVersion} is already published; nothing to do\n`)
    return
  }

  const result = Bun.spawnSync({
    cmd: ['npm', 'publish', tarball, '--provenance', '--access', 'public', '--tag', npmDistTag(releaseVersion)],
    stdout: 'inherit',
    stderr: 'inherit'
  })

  if (result.exitCode !== 0) {
    throw new Error(`npm publish failed with exit code ${result.exitCode}`)
  }
}

if (import.meta.main) {
  await main()
}
