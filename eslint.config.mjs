import withNuxt from './.nuxt/eslint.config.mjs'
import stylistic from '@stylistic/eslint-plugin'
import tailwind from 'eslint-plugin-tailwindcss'

export default withNuxt(
  tailwind.configs.recommended,
  {
    plugins: {
      '@stylistic': stylistic
    },
    settings: {
      tailwindcss: {
        cssConfigPath: './playground/app/assets/css/main.css'
      }
    },
    rules: {
      '@stylistic/indent': ['error', 2],
      'vue/html-indent': ['error', 2],
      'vue/multi-word-component-names': 'off',
      'tailwindcss/no-custom-classname': 'off'
    }
  }
)
