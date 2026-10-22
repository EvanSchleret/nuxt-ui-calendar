import { appendFile, cp, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { basename, join, resolve } from 'node:path'

interface PackageManifest {
  name: string
  version: string
  main?: string
  module?: string
  types?: string
  exports: Record<string, string | Record<string, string>>
  peerDependencies: Record<string, string>
  devDependencies: Record<string, string>
}

interface PackedManifest {
  filename: string
}

function runCommand(command: string[], cwd: string): string {
  const result = Bun.spawnSync({ cmd: command, cwd, stdout: 'pipe', stderr: 'pipe' })
  const stdout = new TextDecoder().decode(result.stdout).trim()

  if (result.exitCode !== 0) {
    const stderr = new TextDecoder().decode(result.stderr).trim()
    throw new Error(`${command.join(' ')} failed${stderr ? `:\n${stderr}` : ''}`)
  }

  return stdout
}

function collectExportPaths(value: string | Record<string, string>): string[] {
  if (typeof value === 'string') {
    return [value]
  }

  return Object.values(value).flatMap(collectExportPaths)
}

async function createTarball(repositoryRoot: string, directory: string): Promise<string> {
  const output = runCommand(['npm', 'pack', '--json', '--pack-destination', directory], repositoryRoot)
  const [packed] = JSON.parse(output) as PackedManifest[]

  if (!packed?.filename) {
    throw new Error('npm pack did not return a tarball filename')
  }

  return join(directory, packed.filename)
}

async function verifyTarball(tarball: string, manifest: PackageManifest, repositoryRoot: string): Promise<void> {
  const files = new Set(runCommand(['tar', '-tzf', tarball], repositoryRoot).split('\n'))
  const requiredFiles = [
    'dist/module.mjs',
    'dist/module.d.mts',
    'dist/types.d.mts',
    'dist/runtime/index.js',
    'dist/runtime/index.d.ts',
    'dist/runtime/types.d.ts',
    'dist/runtime/components/App.vue',
    'dist/runtime/components/EventModal.vue',
    'dist/runtime/assets/calendar.css'
  ]
  const exportPaths = [manifest.main, manifest.module, manifest.types, ...Object.values(manifest.exports).flatMap(collectExportPaths)]
    .filter((path): path is string => typeof path === 'string' && path.startsWith('./'))
    .map(path => `package/${path.slice(2)}`)
  const missingFiles = [...new Set([...requiredFiles.map(path => `package/${path}`), ...exportPaths])]
    .filter(path => !files.has(path))

  if (missingFiles.length > 0) {
    throw new Error(`Package tarball is missing required files:\n${missingFiles.join('\n')}`)
  }

  const packedManifest = JSON.parse(runCommand(['tar', '-xOf', tarball, 'package/package.json'], repositoryRoot)) as PackageManifest

  if (packedManifest.name !== manifest.name || packedManifest.version !== manifest.version) {
    throw new Error(`Packed manifest mismatch: expected ${manifest.name}@${manifest.version}, received ${packedManifest.name}@${packedManifest.version}`)
  }

  const types = runCommand(['tar', '-xOf', tarball, 'package/dist/runtime/types.d.ts'], repositoryRoot)

  if (!types.includes('CalendarEventModalProps') || !types.includes('CalendarEventModalResult')) {
    throw new Error('Package tarball is missing the public custom event modal types')
  }
}

async function verifyConsumer(tarball: string, manifest: PackageManifest, directory: string, repositoryRoot: string): Promise<void> {
  const fixtureDirectory = join(repositoryRoot, 'test/fixtures/consumer')
  const consumerDirectory = join(directory, 'consumer')
  await cp(fixtureDirectory, consumerDirectory, { recursive: true })

  const consumerManifest = {
    name: 'nuxt-ui-calendar-consumer-smoke-test',
    private: true,
    type: 'module',
    scripts: {},
    dependencies: {
      '@nuxt/ui': manifest.peerDependencies['@nuxt/ui'],
      [manifest.name]: `file:${tarball}`,
      nuxt: manifest.peerDependencies.nuxt
    },
    devDependencies: {
      typescript: manifest.devDependencies.typescript,
      'vue-tsc': manifest.devDependencies['vue-tsc']
    }
  }

  await writeFile(join(consumerDirectory, 'package.json'), `${JSON.stringify(consumerManifest, null, 2)}\n`)
  runCommand(['bun', 'install'], consumerDirectory)
  runCommand(['bun', 'run', 'nuxt', 'prepare'], consumerDirectory)
  runCommand(['bun', 'run', 'vue-tsc', '--noEmit', '--project', 'tsconfig.json'], consumerDirectory)
}

async function main(): Promise<void> {
  const repositoryRoot = resolve(import.meta.dir, '../..')
  const manifest = JSON.parse(await readFile(join(repositoryRoot, 'package.json'), 'utf8')) as PackageManifest
  const providedTarball = process.argv[2]
  const directory = await mkdtemp(join(tmpdir(), 'nuxt-ui-calendar-package-'))
  const tarball = providedTarball ? resolve(providedTarball) : await createTarball(repositoryRoot, directory)

  await verifyTarball(tarball, manifest, repositoryRoot)
  await verifyConsumer(tarball, manifest, directory, repositoryRoot)

  const outputFile = process.env.GITHUB_OUTPUT

  if (outputFile) {
    await appendFile(outputFile, `tarball=${tarball}\n`)
  } else {
    await rm(directory, { recursive: true, force: true })
  }

  process.stdout.write(`Verified ${manifest.name}@${manifest.version} from ${basename(tarball)} in a fresh Nuxt consumer\n`)
}

if (import.meta.main) {
  await main()
}
