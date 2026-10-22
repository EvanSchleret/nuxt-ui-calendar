import withNuxt from './.nuxt/eslint.config.mjs'
import tailwind from 'eslint-plugin-tailwindcss'

export default withNuxt(
  tailwind.configs.recommended,
  {
    settings: {
      tailwindcss: {
        cssConfigPath: './playground/app/assets/css/main.css'
      }
    },
    rules: {
      '@stylistic/indent': ['error', 2],
      'vue/html-indent': ['error', 2],
      'tailwindcss/no-custom-classname': 'off'
    }
  }
)
