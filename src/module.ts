import { addComponentsDir, addImportsDir, createResolver, defineNuxtModule } from '@nuxt/kit'
import { defu } from 'defu'
import { uiDefaults } from './ui-config'

export interface NuxtUiCalendarOptions {
  prefix: string
}

export default defineNuxtModule<NuxtUiCalendarOptions>({
  meta: {
    name: '@evanschleret/nuxt-ui-calendar',
    configKey: 'uiCalendar',
    compatibility: {
      nuxt: '>=4.0.0'
    }
  },
  defaults: {
    prefix: 'Calendar'
  },
  moduleDependencies: {
    '@nuxt/ui': {
      version: '^4.12.0'
    }
  },
  setup(options, nuxt) {
    const { resolve } = createResolver(import.meta.url)

    Object.assign(nuxt.options.appConfig.ui, defu(nuxt.options.appConfig.ui, uiDefaults))

    addComponentsDir({
      path: resolve('./runtime/components'),
      prefix: options.prefix,
      pathPrefix: false
    })

    addImportsDir(resolve('./runtime/composables'))

    nuxt.options.css.push(resolve('./runtime/assets/calendar.css'))
  }
})
