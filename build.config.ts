import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  declaration: true,
  clean: true,
  entries: [
    'src/module',
    'src/runtime'
  ],
  externals: [
    'nuxt',
    '#app',
    '#imports',
    '@nuxt/kit',
    'vue'
  ],
  rollup: {
    emitCJS: true,
    inlineDependencies: true
  }
})
